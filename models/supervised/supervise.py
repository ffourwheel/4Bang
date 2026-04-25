import pandas as pd
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

df = pd.read_csv('models/data/cleansing_water_data.csv')
df_clean = df[df['use_cleansing_water'] == 'ใช้'].copy()

df_clean['uses_kiyora'] = df_clean['brands_used'].apply(
    lambda x: 1 if isinstance(x, str) and 'Kiyora' in x else 0
)

factor_cols = [c for c in df.columns if c.startswith('factor_')]

def get_dummies_multiselect(series, prefix):
    return series.str.get_dummies(sep=',').add_prefix(f"{prefix}_")

concerns_df = get_dummies_multiselect(df_clean['concerns'], 'concern')

skin_type_encoded = pd.get_dummies(df_clean['skin_type'], prefix='skin', drop_first=False)
le = LabelEncoder()
df_clean['age_encoded'] = le.fit_transform(df_clean['age'])
df_clean['income_encoded'] = le.fit_transform(df_clean['monthly_income'])

X = pd.concat([df_clean[factor_cols], concerns_df, skin_type_encoded, df_clean[['age_encoded', 'income_encoded']]], axis=1)
y = df_clean['uses_kiyora']

df_clean.to_json('modo-app/public/clean_data.json', orient='records', force_ascii=False)

corr_values = X.corrwith(y)
selected_features = corr_values[corr_values >= 0.10].index.tolist()
X_selected = X[selected_features].copy()
X_selected['uses_kiyora'] = y

X_selected.to_json('modo-app/public/model_features.json', orient='records', force_ascii=False)

class train:
    corr_values = X.corrwith(y)
    selected_features = corr_values[corr_values >= 0.10].index.tolist()
    X = X[selected_features]
    y = df_clean['uses_kiyora']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)

    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Decision Tree': DecisionTreeClassifier(max_depth=3, random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=50, max_depth=3, random_state=42)
    }

    results = []
    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        results.append({
            'Model': name,
            'Accuracy': round(accuracy_score(y_test, y_pred), 4),
            'Precision': round(precision_score(y_test, y_pred), 4),
            'Recall': round(recall_score(y_test, y_pred), 4),
            'F1-score': round(f1_score(y_test, y_pred), 4)
        })

    results_df = pd.DataFrame(results)
    print(results_df)

    with open('modo-app/public/model_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    model = DecisionTreeClassifier(max_depth=3, random_state=42).fit(X_train, y_train)
    import joblib
    joblib.dump(model, 'models/supervised/dt.pkl')