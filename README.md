# 🧴 4Bangs (Modo App) — Kiyora Cleansing Water Analysis Dashboard

> **แดชบอร์ดวิเคราะห์ปัจจัยการเลือกใช้ผลิตภัณฑ์ Kiyora Cleansing Water**
> ขับเคลื่อนด้วย Machine Learning (Supervised & Unsupervised) พร้อม Interactive Dashboard และระบบทำนายผลแบบ Real-time

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python)](https://www.python.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-Machine%20Learning-F7931E?logo=scikit-learn)](https://scikit-learn.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

---

## 📋 สารบัญ (Table of Contents)

- [ภาพรวมโปรเจกต์ (Overview)](#-ภาพรวมโปรเจกต์-overview)
- [ฟีเจอร์หลัก (Features)](#-ฟีเจอร์หลัก-features)
- [โครงสร้างโปรเจกต์ (Project Structure)](#-โครงสร้างโปรเจกต์-project-structure)
- [ระบบ Machine Learning & Data Pipeline](#-ระบบ-machine-learning--data-pipeline)
- [🚀 การติดตั้งและรัน (Setup)](#-การติดตั้งและรัน-setup)
- [รายละเอียดระบบการทำนาย (Prediction System)](#-รายละเอียดระบบการทำนาย-prediction-system)

---

## 🎯 ภาพรวมโปรเจกต์ (Overview)

**4Bangs (Modo App)** เป็น Full-stack เว็บแอปพลิเคชันสำหรับ **วิเคราะห์และแสดงผลข้อมูลเชิงสถิติ** เกี่ยวกับปัจจัยที่มีผลต่อการเลือกใช้ผลิตภัณฑ์ **Kiyora Cleansing Water** 

โปรเจกต์นี้ผสมผสานระหว่างหน้าเว็บแดชบอร์ดที่สวยงาม และระบบหลังบ้านที่นำ Machine Learning มาใช้ทำนายว่า **"ผู้ใช้รายนี้มีโอกาสเป็นลูกค้าเป้าหมายหรือไม่"** จากการกรอกข้อมูลสภาพผิวและปัญหาผิว

---

## ✨ ฟีเจอร์หลัก (Features)

### 📈 Supervised Learning Dashboard
- **Customer Segmentation Predictor:** ฟอร์มทำนายกลุ่มลูกค้าแบบ Real-time โดยเชื่อมต่อกับโมเดล Decision Tree (`dt.pkl`) ผ่าน FastAPI
- **Summary Stats & Charts:** แสดงผลสถิติผู้ใช้ (Pie Chart, Bar Chart, Radar Chart)
- **Model Comparison:** ตารางเปรียบเทียบประสิทธิภาพของโมเดล (Accuracy, Precision, Recall, F1)
- **Correlation Heatmap:** วิเคราะห์ความสัมพันธ์ของปัจจัยที่มีผลต่อการเลือกใช้สินค้า

### 🎨 UI/UX Design
- 🌑 Dark Theme (Pure Black / Glassmorphism)
- 📱 Responsive Design รองรับ Mobile/Tablet
- ✨ Interactive elements & Smooth Animations

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

โปรเจกต์ถูกแบ่งออกเป็น 3 ส่วนหลัก:

```text
4Bangs/
├── modo-app/                 # 🌐 Frontend (Next.js + React + Tailwind)
│   ├── app/                  # UI Components, Pages, Dashboard
│   ├── public/               # ข้อมูลตั้งต้น (clean_data.json, model_results.json)
│   └── package.json
│
├── backend/                  # ⚙️ Backend API (FastAPI)
│   └── main.py               # REST API (/detect) โหลดโมเดลทำนายผล
│
├── models/                   # 🧠 Machine Learning / Data Science
│   ├── supervised/           # โค้ดเทรนโมเดล (supervise.py) และไฟล์ dt.pkl
│   ├── unsupervised/         # โค้ด K-Means (unsupervise.py)
│   └── data/                 # Raw datasets (CSV)
│
└── run.bat                   # 🚀 สคริปต์รันโปรเจกต์ทั้งหมด (Frontend + Backend)
```

---

## 🧠 ระบบ Machine Learning & Data Pipeline

โปรเจกต์ใช้ **scikit-learn** ในการเทรนโมเดลจากแบบสอบถาม (`cleansing_water_data.csv`)

### 1. Supervised Learning (การทำนายกลุ่มเป้าหมาย)
- **เป้าหมาย:** ทำนายว่าผู้ใช้จะใช้ "Kiyora" หรือไม่ (Target: `uses_kiyora`)
- **โมเดลที่ใช้:** Logistic Regression, Decision Tree, Random Forest
- **โมเดลที่ถูกเลือกใช้งานจริง:** **Decision Tree** ถูกเซฟเป็น `dt.pkl`
- **Feature Selection:** เลือกเฉพาะฟีเจอร์ที่มี Pearson Correlation $\geq 0.10$ 

### 2. Unsupervised Learning (Customer Clustering)
- **เป้าหมาย:** จัดกลุ่มลูกค้า (Segmentation) ตามพฤติกรรม
- **โมเดลที่ใช้:** K-Means Clustering + PCA สำหรับลดมิติข้อมูล

---

## 🚀 การติดตั้งและรัน (Setup)

### ความต้องการของระบบ (Prerequisites)
- **Node.js** (v18+)
- **Python** (v3.8+)

### ขั้นตอนการรัน (สำหรับ Windows)

1. ติดตั้ง Library ของฝั่ง Python (Backend):
   ```bash
   pip install fastapi uvicorn pydantic scikit-learn pandas joblib
   ```
2. ติดตั้ง Package ฝั่ง Node.js (Frontend):
   ```bash
   cd modo-app
   npm install
   cd ..
   ```
3. **รันโปรเจกต์ด้วยคำสั่งเดียว!**
   เพียงแค่ดับเบิลคลิกที่ไฟล์ `run.bat` หรือรันคำสั่ง:
   ```bash
   .\run.bat
   ```
   *สคริปต์จะทำการเปิดหน้าต่าง Terminal ขึ้นมา 2 อัน เพื่อรัน FastAPI (Port 8000) และ Next.js (Port 3000) ไปพร้อมๆ กัน*

เปิดเบราว์เซอร์ไปที่ **[http://localhost:3000](http://localhost:3000)** เพื่อใช้งาน!

---

## 📡 รายละเอียดระบบการทำนาย (Prediction System)

**Flow การทำงานของหน้าเว็บ:**
1. ผู้ใช้กรอกข้อมูล (สภาพผิว, ปัญหาผิว, ระดับความสำคัญของฟีเจอร์สินค้า) ในหน้า Dashboard
2. Next.js ทำการส่ง `POST Request` ไปที่ `http://localhost:8000/detect`
3. **FastAPI Backend** โหลดโมเดล `dt.pkl` (ถูกโหลดรอไว้แล้วใน Memory)
4. แปลงข้อมูลให้อยู่ในรูป `pandas DataFrame`
5. เรียกใช้ `model.predict()` และ `model.predict_proba()`
6. คืนค่า JSON กลับมาให้หน้าเว็บ เช่น `{"prediction": 1, "probability": 85.5, "shouldUse": true}`
7. หน้าเว็บแสดงผลลัพธ์พร้อม Insights แนะนำสินค้าทันที!

---

## 🧑‍💻 ผู้พัฒนา (Author)

โปรเจกต์นี้เป็นส่วนหนึ่งของรายวิชา **ปี 3 ภาคเรียนที่ 2/2568**

## License

MIT License — อนุญาตให้ใช้, คัดลอก, แก้ไข, และแจกจ่ายได้อย่างอิสระ
