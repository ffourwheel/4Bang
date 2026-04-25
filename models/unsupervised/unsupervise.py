import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import joblib

# -----------------------------
# 1. LOAD & CLEAN DATA
# -----------------------------
def load_data(path):
    df = pd.read_csv(path)
    df = df[df['use_cleansing_water'] == 'ใช้'].copy()
    return df


# -----------------------------
# 2. PREPROCESSING
# -----------------------------
def preprocess(df):
    factor_cols = [col for col in df.columns if col.startswith('factor_')]

    # fill missing
    for col in factor_cols:
        df[col] = df[col].fillna(df[col].median())

    df['concerns'] = df['concerns'].fillna('')
    df['skin_type'] = df['skin_type'].fillna('ไม่ระบุ')
    df['age'] = df['age'].fillna('ไม่ระบุ')
    df['monthly_income'] = df['monthly_income'].fillna('ไม่ระบุ')

    return df, factor_cols


# -----------------------------
# 3. FEATURE ENGINEERING
# -----------------------------
def get_dummies_multiselect(series, prefix):
    return series.str.get_dummies(sep=',').add_prefix(f'{prefix}_')


def create_features(df, factor_cols):
    concerns_df = get_dummies_multiselect(df['concerns'], 'concern')
    skin_type_df = pd.get_dummies(df['skin_type'], prefix='skin')

    le_age = LabelEncoder()
    le_income = LabelEncoder()

    df['age_encoded'] = le_age.fit_transform(df['age'])
    df['income_encoded'] = le_income.fit_transform(df['monthly_income'])

    X = pd.concat([
        df[factor_cols],
        concerns_df,
        skin_type_df,
        df[['age_encoded', 'income_encoded']]
    ], axis=1)

    return X


# -----------------------------
# 4. SCALING
# -----------------------------
def scale_features(X):
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    return X_scaled, scaler


# -----------------------------
# 5. TRAIN MODEL
# -----------------------------
def train_kmeans(X_scaled, k=3):
    model = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = model.fit_predict(X_scaled)
    return model, labels


# -----------------------------
# 6. PCA (OPTIONAL - FOR VISUALIZATION)
# -----------------------------
def apply_pca(X_scaled):
    pca = PCA(n_components=2)
    return pca.fit_transform(X_scaled)


# -----------------------------
# 7. SAVE MODEL
# -----------------------------
def save_model(model, scaler, path_model, path_scaler):
    joblib.dump(model, path_model)
    joblib.dump(scaler, path_scaler)


# -----------------------------
# 8. MAIN PIPELINE
# -----------------------------
def run_pipeline(data_path):
    df = load_data(data_path)

    df, factor_cols = preprocess(df)
    X = create_features(df, factor_cols)

    X_scaled, scaler = scale_features(X)
    model, labels = train_kmeans(X_scaled, k=3)

    df['cluster'] = labels

    # save model
    save_model(
        model,
        scaler,
        "models/unsupervised/kmeans.pkl",
        "models/unsupervised/scaler.pkl"
    )

    # save result for frontend
    df.to_json("modo-app/public/cluster_result.json",
               orient="records", force_ascii=False)

    return df, model


# -----------------------------
# RUN
# -----------------------------
if __name__ == "__main__":
    run_pipeline("models/data/cleansing_water_data.csv")