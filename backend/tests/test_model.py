import numpy as np
import tensorflow as tf
from custom_layers import PositionalEncoding


MODEL_PATH = "model/transformer_model_v3.keras"


def test_model_loads():
    model = tf.keras.models.load_model(
        MODEL_PATH,
        custom_objects={"PositionalEncoding": PositionalEncoding}
    )
    assert model is not None


def test_model_input_shape():
    model = tf.keras.models.load_model(
        MODEL_PATH,
        custom_objects={"PositionalEncoding": PositionalEncoding}
    )

    # Check sequence length
    assert model.input_shape[1] == 24

    # Check feature count (should match your feature_columns.json)
    assert model.input_shape[2] == 51   # change to 51 if needed


def test_model_prediction_shape():
    model = tf.keras.models.load_model(
        MODEL_PATH,
        custom_objects={"PositionalEncoding": PositionalEncoding}
    )

    sequence_length = model.input_shape[1]
    feature_count = model.input_shape[2]

    dummy_input = np.random.rand(1, sequence_length, feature_count)

    prediction = model.predict(dummy_input)

    # Should return one prediction
    assert prediction.shape[0] == 1