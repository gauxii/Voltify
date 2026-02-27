import os
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import base64
import io
import shap
import joblib
import tensorflow as tf
from flask_cors import CORS
from flask import Flask, request, jsonify
from custom_layers import PositionalEncoding

# -----------------------
# Folders
# -----------------------
UPLOAD_FOLDER = "uploads"
MODEL_FOLDER = "model"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

CORS(app, resources={r"/predict": {"origins": "http://localhost:5173"}})
# -----------------------
# Load Model + Scalers
# -----------------------
MODEL_PATH = os.path.join(MODEL_FOLDER, "transformer_model_v3.keras")

model = tf.keras.models.load_model(
    MODEL_PATH,
    custom_objects={"PositionalEncoding": PositionalEncoding}
)

feature_scaler = joblib.load(os.path.join(MODEL_FOLDER, "feature_minmax_scaler.pkl"))
target_scaler = joblib.load(os.path.join(MODEL_FOLDER, "target_minmax_scaler.pkl"))

# If you saved feature column order (recommended)
with open(os.path.join(MODEL_FOLDER, "feature_columns.json")) as f:
    feature_columns = json.load(f)

SEQ_LEN = 24


# -----------------------
# Preprocess Function
# -----------------------
def preprocess(file_path):
    df = pd.read_csv(file_path)
    df.columns = df.columns.str.strip()
    if "AEP" in df.columns:
        df.rename(columns={"AEP": "AEP_MW"}, inplace=True)

    # Drop unused
    for col in ["PJM_Load", "PJM_Load_MW"]:
        if col in df.columns:
            df = df.drop(columns=[col])

    df["Datetime"] = pd.to_datetime(df["Datetime"], errors="coerce")
    df = df.dropna(subset=["Datetime"])
    df = df.sort_values("Datetime").reset_index(drop=True)
    df = df.dropna(subset=["AEP_MW"]).reset_index(drop=True)
    df = df.ffill().bfill()

    # Time features
    df['hour'] = df['Datetime'].dt.hour
    df['day'] = df['Datetime'].dt.day
    df['weekday'] = df['Datetime'].dt.weekday
    df['month'] = df['Datetime'].dt.month
    df['is_weekend'] = (df['weekday'] >= 5).astype(int)

    # Lag features
    for lag in range(1, 25):
        df[f'lag_{lag}'] = df['AEP_MW'].shift(lag)
    df['roll_mean_24'] = df['AEP_MW'].rolling(window=24).mean()
    df['roll_std_24'] = df['AEP_MW'].rolling(window=24).std()
    df = df.dropna().reset_index(drop=True)

    # Ensure at least SEQ_LEN rows
    if len(df) <= SEQ_LEN:
        raise ValueError("Not enough rows for prediction")

    # Add missing columns from training (50 real features)
    for col in feature_columns[:50]:
        if col not in df.columns:
            df[col] = 0

    # -------------------------
    # Scale first 50 features
    # -------------------------
    X_scaled_partial = feature_scaler.transform(df[feature_columns[:50]].values)

    # -------------------------
    # Append dummy 51st feature
    # -------------------------
    dummy = np.zeros((X_scaled_partial.shape[0], 1))
    X_scaled = np.hstack([X_scaled_partial, dummy])

    # -------------------------
    # Create sequences
    # -------------------------
    X = []
    for i in range(SEQ_LEN, len(X_scaled)):
        X.append(X_scaled[i-SEQ_LEN:i])
    X = np.array(X)

    print("Final X shape:", X.shape)  # should be (num_samples, 24, 51)
    return X
# -----------------------
# Forecast Graph
# -----------------------
def generate_forecast_graph(predictions):

    plt.figure()
    plt.plot(predictions)
    plt.title("Predicted Electricity Load")
    plt.xlabel("Time Step")
    plt.ylabel("Load (kW)")

    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    graph_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    plt.close()

    return graph_base64


# -----------------------
# SHAP
# -----------------------
def generate_shap(X):

    background = X[np.random.choice(X.shape[0], min(50, X.shape[0]), replace=False)]

    explainer = shap.DeepExplainer(model, background)

    shap_values = explainer.shap_values(X[:10])

    plt.figure()
    shap.summary_plot(
        shap_values,
        X[:10].reshape(10, -1),
        show=False
    )

    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    shap_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    plt.close()

    return shap_base64


# -----------------------
# Route
# -----------------------
@app.route("/")
def home():
    return "Backend Running 🚀"

@app.route("/predict", methods=["POST"])
def predict():

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    try:

        X = preprocess(file_path)

        predictions_scaled = model.predict(X)

        predictions = target_scaler.inverse_transform(predictions_scaled)

        predictions = predictions.flatten().tolist()

        graph_img = generate_forecast_graph(predictions)

        #shap_img = generate_shap(X)
        shap_img=None
        
        return jsonify({
            "predictions": predictions,
            "graph": graph_img,
            "shap": shap_img
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)