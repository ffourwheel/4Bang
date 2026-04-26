# ===============================
# 1) Import Library
# ===============================
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm

from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score

font_path = "C:/Windows/Fonts/tahoma.ttf"
thai_font = fm.FontProperties(fname=font_path)

plt.rcParams['font.family'] = thai_font.get_name()
plt.rcParams['axes.unicode_minus'] = False

df = pd.read_csv('./models/data/cleansing_water_data.csv')

df_clean = df[df['use_cleansing_water'] == 'ใช้'].copy()

print("--- จำนวนข้อมูลทั้งหมด ---")
print(df.shape)

print("\n--- จำนวนคนที่ใช้ Cleansing Water ---")
print(df_clean.shape)

factor_cols = [c for c in df_clean.columns if c.startswith('factor_')]

print("\n--- Factor ที่ใช้ทำ Clustering ---")
print(factor_cols)

for col in factor_cols:
    df_clean[col] = df_clean[col].fillna(df_clean[col].median())

X = df_clean[factor_cols].copy()

X_pattern = X.div(X.sum(axis=1), axis=0)
X_pattern = X_pattern.fillna(0)

X_final = (X * 0.5) + (X_pattern * 0.5)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_final)

K_range = range(2, 7)
silhouette_scores = []

for k in K_range:
    temp_kmeans = KMeans(
        n_clusters=k,
        random_state=42,
        n_init=100,
        max_iter=500
    )
    
    temp_labels = temp_kmeans.fit_predict(X_scaled)
    score = silhouette_score(X_scaled, temp_labels)
    silhouette_scores.append(score)

print("\n--- Silhouette Score ของแต่ละ k ---")
for k, score in zip(K_range, silhouette_scores):
    print(f"k = {k}, Silhouette Score = {score:.4f}")


plt.figure(figsize=(8, 5))
plt.plot(K_range, silhouette_scores, marker='o')
plt.title('Silhouette Score เพื่อดูจำนวน Cluster ที่เหมาะสม')
plt.xlabel('จำนวน Cluster')
plt.ylabel('Silhouette Score')
plt.tight_layout()
plt.show()

best_k = 3

kmeans = KMeans(
    n_clusters=best_k,
    random_state=42,
    n_init=100,
    max_iter=500
)

df_clean['cluster'] = kmeans.fit_predict(X_scaled)

print("\n--- จำนวนคนในแต่ละ Cluster ---")
print(df_clean['cluster'].value_counts().sort_index())

pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)

print("\n--- PCA อธิบายข้อมูลได้รวม ---")
print(pca.explained_variance_ratio_.sum())

df_clean['pca1'] = X_pca[:, 0]
df_clean['pca2'] = X_pca[:, 1]

plt.figure(figsize=(8, 6))
sns.scatterplot(
    x='pca1',
    y='pca2',
    hue='cluster',
    data=df_clean,
    palette='Set1',
    s=90,
    edgecolor='black'
)

plt.title('การแบ่งกลุ่มลูกค้า Cleansing Water ด้วย K-Means จำนวน 3 กลุ่ม')
plt.xlabel('PCA 1')
plt.ylabel('PCA 2')
plt.legend(title='Cluster')
plt.tight_layout()
plt.show()

plt.figure(figsize=(6, 4))
sns.countplot(x='cluster', data=df_clean, palette='Set1')
plt.title('จำนวนคนในแต่ละ Cluster')
plt.xlabel('Cluster')
plt.ylabel('จำนวนคน')
plt.tight_layout()
plt.show()

cluster_profile = df_clean.groupby('cluster')[factor_cols].mean()

print("\n--- ค่าเฉลี่ยปัจจัยในการเลือกซื้อของแต่ละ Cluster ---")
print(cluster_profile)

plt.figure(figsize=(12, 6))
sns.heatmap(cluster_profile, annot=True, cmap='coolwarm', fmt='.2f')
plt.title('ค่าเฉลี่ยปัจจัยในการเลือกซื้อของแต่ละ Cluster')
plt.xlabel('ปัจจัยในการเลือกซื้อ')
plt.ylabel('Cluster')
plt.tight_layout()
plt.show()

print("\n--- สรุปลักษณะเด่นของแต่ละ Cluster ---")

for cluster in sorted(df_clean['cluster'].unique()):
    print("=" * 60)
    print(f"Cluster {cluster}")
    print("จำนวนคน:", len(df_clean[df_clean['cluster'] == cluster]))

    print("\nปัจจัยที่ให้ความสำคัญสูงสุด:")
    print(cluster_profile.loc[cluster].sort_values(ascending=False).head(5))

    print("\nปัจจัยที่ให้ความสำคัญต่ำสุด:")
    print(cluster_profile.loc[cluster].sort_values(ascending=True).head(3))

cluster_names = {
    0: 'กลุ่มเน้นความอ่อนโยนและไม่ระคายเคือง',
    1: 'กลุ่มเน้นประสิทธิภาพการทำความสะอาด',
    2: 'กลุ่มเน้นการดูแลปัญหาผิวและสิว'
}

df_clean['cluster_name'] = df_clean['cluster'].map(cluster_names)

print("\n--- ตัวอย่างข้อมูลพร้อมชื่อ Cluster ---")
print(df_clean[['cluster', 'cluster_name']].head())

import os
import joblib

public_dir = '../modo-app/public'
models_dir = '../models/unsupervised'

if os.path.exists('modo-app'):
    public_dir = 'modo-app/public'
    models_dir = 'models/unsupervised'

os.makedirs(public_dir, exist_ok=True)
os.makedirs(models_dir, exist_ok=True)

df_clean.to_json(os.path.join(public_dir, 'cluster_result.json'), orient='records', force_ascii=False)
cluster_profile.reset_index().to_json(os.path.join(public_dir, 'cluster_profile.json'), orient='records', force_ascii=False)

joblib.dump(kmeans, os.path.join(models_dir, 'kmeans.pkl'))
joblib.dump(scaler, os.path.join(models_dir, 'scaler.pkl'))
joblib.dump(pca, os.path.join(models_dir, 'pca.pkl'))