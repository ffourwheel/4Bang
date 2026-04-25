import pandas as pd
import json
import matplotlib.pyplot as plt
import seaborn as sns
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

class corr:
    corr = X.corrwith(y).sort_values(ascending=False)
    print("--- ปัจจัยที่มีผลเชิงบวกต่อการเลือกใช้ Kiyora มากที่สุด ---")
    print(corr.head(5))

    plt.rcParams['font.family'] = 'Tahoma'
    plt.figure(figsize=(10, 8))
    top_features = corr.abs().sort_values(ascending=False).head(10).index
    sns.heatmap(X[top_features].join(y).corr(), annot=True, cmap='coolwarm', fmt=".2f")
    plt.title('Correlation Heatmap (Top 10 Features vs Uses Kiyora)')
    plt.tight_layout()
    plt.show()

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
    
    results_df.set_index('Model', inplace=True)
    results_df.plot(kind='bar', figsize=(10, 6))
    plt.title('Model Performance Comparison')
    plt.ylabel('Score')
    plt.legend()
    plt.tight_layout()
    plt.xticks(rotation=45)
    plt.show()
    
class plot:
    plt.figure(figsize=(12, 5))
    plt.subplot(1, 2, 1)
    sns.countplot(y='age', data=df_clean, order=df_clean['age'].value_counts().index)
    plt.title('อายุคนที่ใช้ Cleansing Water)')

    plt.subplot(1, 2, 2)
    sns.countplot(y='skin_type', data=df_clean, order=df_clean['skin_type'].value_counts().index)
    plt.title('สภาพผิวของคนใช้ Cleansing Water')
    plt.tight_layout()

    plt.figure(figsize=(12, 6))
    df_factors = df_clean[factor_cols].rename(columns=lambda x: x.replace('factor_', ''))
    sns.boxplot(data=df_factors, orient='h')
    plt.title('คะแนนปัจจัยในการเลือกซื้อ')
    plt.tight_layout()
    plt.show()