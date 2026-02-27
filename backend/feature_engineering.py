import pandas as pd

def create_features(df):
    df = df.copy()

    df['hour'] = df['Datetime'].dt.hour
    df['day'] = df['Datetime'].dt.day
    df['weekday'] = df['Datetime'].dt.weekday
    df['month'] = df['Datetime'].dt.month
    df['is_weekend'] = (df['weekday'] >= 5).astype(int)

    for lag in range(1, 25):
        df[f'lag_{lag}'] = df['AEP_MW'].shift(lag)

    df['roll_mean_24'] = df['AEP_MW'].rolling(window=24).mean()
    df['roll_std_24'] = df['AEP_MW'].rolling(window=24).std()

    df = df.dropna().reset_index(drop=True)

    return df