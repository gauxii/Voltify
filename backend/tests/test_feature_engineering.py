import pandas as pd
import numpy as np
from feature_engineering import create_features


def test_feature_columns_created():
    dates = pd.date_range("2023-01-01", periods=48, freq="h")
    df = pd.DataFrame({
        "Datetime": dates,
        "AEP_MW": range(48)
    })

    result = create_features(df)

    # Time features
    assert "hour" in result.columns
    assert "day" in result.columns
    assert "weekday" in result.columns
    assert "month" in result.columns
    assert "is_weekend" in result.columns

    # Lag features
    for lag in range(1, 25):
        assert f"lag_{lag}" in result.columns

    # Rolling features
    assert "roll_mean_24" in result.columns
    assert "roll_std_24" in result.columns


def test_lag_values():
    dates = pd.date_range("2023-01-01", periods=50, freq="h")
    df = pd.DataFrame({
        "Datetime": dates,
        "AEP_MW": range(50)
    })

    result = create_features(df)

    first_row = result.iloc[0]
    assert first_row["lag_1"] == df["AEP_MW"].iloc[23]


def test_rolling_mean():
    dates = pd.date_range("2023-01-01", periods=50, freq="h")
    values = np.arange(50)

    df = pd.DataFrame({
        "Datetime": dates,
        "AEP_MW": values
    })

    result = create_features(df)

    expected_mean = np.mean(values[1:25])
    assert abs(result.iloc[0]["roll_mean_24"] - expected_mean) < 1e-6