import os
import json
import io
import base64
import numpy as np
import pandas as pd
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

import joblib
import shap
import tensorflow as tf

from flask import Flask, request, jsonify
from flask_cors import CORS
from custom_layers import PositionalEncoding


# -----------------------
# Folders
# -----------------------
UPLOAD_FOLDER = "uploads"
MODEL_FOLDER = "model"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

CORS(app)


# -----------------------
# Load Model + Scalers
# -----------------------
MODEL_PATH = os.path.join(MODEL_FOLDER, "transformer_energy_model.keras")

model = tf.keras.models.load_model(
    MODEL_PATH,
    custom_objects={"PositionalEncoding": PositionalEncoding},
)

feature_scaler = joblib.load(
    os.path.join(MODEL_FOLDER, "feature_minmax_scaler.pkl")
)

target_scaler = joblib.load(
    os.path.join(MODEL_FOLDER, "target_minmax_scaler.pkl")
)

with open(os.path.join(MODEL_FOLDER, "feature_columns.json")) as f:
    feature_columns = json.load(f)

SEQ_LEN = 24


# -----------------------
# Preprocess Function
# -----------------------
def preprocess(file_path):

    df = pd.read_csv(file_path)

    df.columns = df.columns.str.strip()

    if "Datetime" not in df.columns:
        df.rename(columns={df.columns[0]: "Datetime"}, inplace=True)

    df["Datetime"] = pd.to_datetime(df["Datetime"], errors="coerce")

    df = df.dropna(subset=["Datetime"]).sort_values("Datetime").reset_index(drop=True)

    if "PJM_Load" in df.columns:
        df = df.drop(columns=["PJM_Load"])

    df = df.dropna(subset=["AEP"]).reset_index(drop=True)

    df = df.ffill().bfill()

    # -----------------------
    # Time Features
    # -----------------------
    df["hour"] = df["Datetime"].dt.hour
    df["day"] = df["Datetime"].dt.day
    df["weekday"] = df["Datetime"].dt.weekday
    df["month"] = df["Datetime"].dt.month
    df["is_weekend"] = (df["weekday"] >= 5).astype(int)

    # -----------------------
    # Lag Features
    # -----------------------
    for lag in range(1, 25):
        df[f"lag_{lag}"] = df["AEP"].shift(lag)

    df["roll_mean_24"] = df["AEP"].rolling(24).mean()
    df["roll_std_24"] = df["AEP"].rolling(24).std()

    df = df.dropna().reset_index(drop=True)

    if len(df) <= SEQ_LEN:
        raise ValueError("Not enough rows for prediction")

    # -----------------------
    # Scale Features
    # -----------------------
    features = df[feature_columns[:41]].values

    features_scaled = feature_scaler.transform(features)

    target_scaled = target_scaler.transform(df[["AEP"]].values)

    combined = np.hstack([features_scaled, target_scaled])

    return combined, df


# -----------------------
# Forecast Graph
# -----------------------
def generate_forecast_graph(predictions):

    plt.figure(figsize=(8, 4))  # bigger size

    x = np.arange(1, len(predictions) + 1)

    plt.plot(
        x,
        predictions,
        linewidth=3,
        linestyle='-',
        marker='o',
        markersize=6
    )

    # Styling
    plt.title("Electricity Load Forecast (Next 24 Hours)", fontsize=14, fontweight='bold')
    plt.xlabel("Hour", fontsize=12)
    plt.ylabel("Load (MW)", fontsize=12)

    # Grid (soft)
    plt.grid(True, linestyle='--', alpha=0.5)

    # Remove top/right borders
    plt.gca().spines['top'].set_visible(False)
    plt.gca().spines['right'].set_visible(False)

    # Tight layout
    plt.tight_layout()

    # Save image
    buf = io.BytesIO()
    plt.savefig(buf, format="png", dpi=150)
    buf.seek(0)

    graph_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    plt.close()

    return graph_base64


# -----------------------
# Routes
# -----------------------
@app.route("/")
def home():
    return "Backend Running 🚀"


@app.route("/predict", methods=["POST"])
def predict():

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    file_path = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)

    file.save(file_path)

    try:

        # -----------------------
        # Preprocess
        # -----------------------
        combined, df = preprocess(file_path)

        # -----------------------
        # Predict 24 Hours
        # -----------------------
        last_seq = combined[-SEQ_LEN:].reshape(1, SEQ_LEN, combined.shape[1])

        future_preds_scaled = []

        for _ in range(24):

            pred_scaled = model.predict(last_seq, verbose=0)[0, 0]

            future_preds_scaled.append(pred_scaled)

            new_row = np.hstack(
                [last_seq[0, -1, :-1], pred_scaled]
            ).reshape(1, 1, last_seq.shape[2])

            last_seq = np.concatenate([last_seq[:, 1:, :], new_row], axis=1)

        future_preds = target_scaler.inverse_transform(
            np.array(future_preds_scaled).reshape(-1, 1)
        )

        graph_img = generate_forecast_graph(future_preds.flatten())

        # -----------------------
        # SHAP Explanation
        # -----------------------
        from shap import sample as shap_sample

        rows_to_use = min(24, len(combined))

        X_rows = combined[-rows_to_use:, :]

        background_size = min(100, len(combined))

        X_background = shap_sample(combined[-background_size:, :], 50)

        def predict_last_step(x):

            x_seq = np.repeat(x[:, np.newaxis, :], SEQ_LEN, axis=1)

            preds = model.predict(x_seq, verbose=0)

            return preds.reshape(-1)

        explainer = shap.KernelExplainer(predict_last_step, X_background)

        shap_values = explainer.shap_values(X_rows)

        shap_values = np.array(shap_values)

        shap_values_fixed = shap_values[:, 1:]

        X_rows_fixed = X_rows[:, 1:]

        feature_names_fixed = [
            'COMED','DAYTON','DEOK','DOM','DUQ','EKPC','NI','PJME','PJMW',
            'hour','day','weekday','month','is_weekend',
            'lag_1','lag_2','lag_3','lag_4','lag_5','lag_6','lag_7','lag_8',
            'lag_9','lag_10','lag_11','lag_12','lag_13','lag_14','lag_15',
            'lag_16','lag_17','lag_18','lag_19','lag_20','lag_21','lag_22',
            'lag_23','lag_24','roll_mean_24','roll_std_24'
        ]

        mean_abs_shap = np.abs(shap_values_fixed).mean(axis=0)

        top_idx = np.argmax(mean_abs_shap)

        top_feature = feature_names_fixed[top_idx]

        top_shap_value = mean_abs_shap[top_idx]

        shap_feature_list = [
            {
                "feature": feature_names_fixed[i],
                "shap_value": float(mean_abs_shap[i]),
            }
            for i in range(len(feature_names_fixed))
        ]

        return jsonify(
            {
                "predictions": future_preds.flatten().tolist(),
                "graph": graph_img,
                "shap_top_feature": top_feature,
                "shap_top_value": float(top_shap_value),
                "shap_all_features": shap_feature_list,
            }
        )

    except Exception as e:

        return jsonify({"error": str(e)}), 500


# -----------------------
# Run server
# -----------------------
if __name__ == "__main__":
    app.run(debug=True)