# 🧴 Modo App — Kiyora Cleansing Water Analysis Dashboard

> **แดชบอร์ดวิเคราะห์ปัจจัยการเลือกใช้ผลิตภัณฑ์ Kiyora Cleansing Water**
> ด้วย Supervised Learning Models พร้อม Interactive Data Visualization

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4-ff6384?logo=chart.js)](https://www.chartjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](#license)

---

## 📋 สารบัญ (Table of Contents)

- [ภาพรวมโปรเจกต์ (Overview)](#-ภาพรวมโปรเจกต์-overview)
- [ฟีเจอร์หลัก (Features)](#-ฟีเจอร์หลัก-features)
- [เทคโนโลยีที่ใช้ (Tech Stack)](#-เทคโนโลยีที่ใช้-tech-stack)
- [โครงสร้างโปรเจกต์ (Project Structure)](#-โครงสร้างโปรเจกต์-project-structure)
- [ข้อมูลที่ใช้ (Data)](#-ข้อมูลที่ใช้-data)
- [Data Pipeline](#-data-pipeline)
- [การติดตั้งและรัน (Setup)](#-การติดตั้งและรัน-setup)
- [สคริปต์ที่ใช้ได้ (Scripts)](#-สคริปต์ที่ใช้ได้-scripts)
- [รายละเอียดหน้าเว็บ (Pages)](#-รายละเอียดหน้าเว็บ-pages)
- [โมเดล Machine Learning](#-โมเดล-machine-learning)
- [การปรับแต่ง (Customization)](#-การปรับแต่ง-customization)
- [License](#license)

---

## 🎯 ภาพรวมโปรเจกต์ (Overview)

**Modo App** เป็นเว็บแอปพลิเคชันสำหรับ **วิเคราะห์และแสดงผลข้อมูลเชิงสถิติ** เกี่ยวกับปัจจัยที่มีผลต่อการเลือกใช้ผลิตภัณฑ์ **Kiyora Cleansing Water** โดยใช้ข้อมูลจากแบบสอบถาม (Survey Data) ร่วมกับโมเดล Supervised Learning เพื่อ:

- 📊 แสดงผลสถิติเชิงพรรณนา (Descriptive Statistics) แบบ Interactive
- 🤖 เปรียบเทียบประสิทธิภาพของโมเดล Machine Learning 3 ตัว
- 🔗 วิเคราะห์ Correlation ระหว่างปัจจัยต่าง ๆ กับการเลือกใช้ Kiyora
- 👥 แสดงข้อมูล Demographics ของกลุ่มตัวอย่าง
- 🕸️ แสดง Radar Chart ของคะแนนปัจจัยการตัดสินใจซื้อ

---

## ✨ ฟีเจอร์หลัก (Features)

### 🏠 หน้า Home
- แสดงเมนูหลักสำหรับเลือกดู Dashboard แบบ Supervise หรือ Unsupervise
- Navigation bar แบบ Pill-style พร้อม Active state animation

### 📈 Supervised Learning Dashboard
| ฟีเจอร์ | รายละเอียด |
|---|---|
| **Summary Stats** | แสดงจำนวนตัวอย่างทั้งหมด, จำนวนผู้ใช้/ไม่ใช้ Kiyora, อัตราส่วนเปอร์เซ็นต์ |
| **Model Performance Table** | ตารางเปรียบเทียบ Accuracy, Precision, Recall, F1-score ของทุกโมเดล |
| **Model Comparison Bar Chart** | กราฟแท่งเปรียบเทียบ metric ทุกตัวของแต่ละโมเดล |
| **Kiyora Usage Doughnut** | กราฟวงกลมแสดงสัดส่วนผู้ใช้ vs ไม่ใช้ Kiyora |
| **Top 5 Correlation** | กราฟแท่งแนวนอนแสดง 5 ปัจจัยที่มี Pearson Correlation สูงสุด |
| **Correlation Heatmap** | Heatmap แบบ Canvas แสดง Correlation Matrix ระหว่างทุก factor + uses_kiyora |
| **Age Distribution** | กราฟแท่งแสดงการกระจายตัวของกลุ่มอายุ |
| **Skin Type Distribution** | กราฟ Doughnut แสดงสัดส่วนประเภทผิว |
| **Factor Radar Chart** | Radar Chart แสดงคะแนนเฉลี่ยของปัจจัยแต่ละตัว (สเกล 1-5) |

### 🎨 UI/UX
- 🌑 Dark Theme สวยงามทันสมัย (Glassmorphism style)
- 🖋️ Google Fonts — Inter
- 📱 Responsive Design รองรับ Mobile/Tablet
- ✨ Hover Effects & Smooth Transitions
- 🔄 Loading Spinner แบบ Animated

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### Frontend
| เทคโนโลยี | เวอร์ชัน | หน้าที่ |
|---|---|---|
| **Next.js** | 16.2.4 | React Framework (App Router) |
| **React** | 19.2.4 | UI Library |
| **TypeScript** | 5.x | Type Safety |
| **Tailwind CSS** | 4.x | Utility-first CSS + Custom Styles |
| **Chart.js** | 4.5.1 | Charting Library |
| **react-chartjs-2** | 5.3.1 | React Wrapper สำหรับ Chart.js |
| **Geist Font** | — | Typography (via next/font) |

### Data Processing (Python)
| เทคโนโลยี | หน้าที่ |
|---|---|
| **pandas** | Data Manipulation & Cleaning |
| **numpy** | Numerical Computing |
| **scikit-learn** | Machine Learning Models |
| **seaborn / matplotlib** | Data Visualization (ใช้ตอน Explore) |
| **joblib** | Model Serialization |

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
modo-app/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root Layout (Geist Font, Metadata)
│   ├── page.tsx                  # หน้าหลัก — Tab Navigation (Home / Supervise / Unsupervise)
│   ├── Supervise.tsx             # 📈 Supervised Learning Dashboard Component
│   ├── Supervise.css             # Stylesheet สำหรับ Dashboard (Dark Theme)
│   ├── globals.css               # Global Styles (Tailwind base)
│   └── favicon.ico               # Favicon
│
├── public/                       # Static Files (served at /)
│   ├── clean_data.json           # ข้อมูลหลังทำความสะอาด (Survey Data)
│   └── model_results.json        # ผลลัพธ์จากโมเดล ML (Accuracy, Precision, Recall, F1)
│
├── .gitignore                    # Git ignore rules
├── .git/                         # Git repository
├── eslint.config.mjs             # ESLint configuration
├── next.config.ts                # Next.js configuration
├── next-env.d.ts                 # Next.js TypeScript declarations
├── package.json                  # Dependencies & Scripts
├── package-lock.json             # Dependency lock file
├── postcss.config.mjs            # PostCSS configuration (Tailwind)
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # 📖 ไฟล์นี้
```

---

## 📊 ข้อมูลที่ใช้ (Data)

### `public/clean_data.json`
ข้อมูลจากแบบสอบถามที่ผ่านการทำความสะอาดแล้ว (เฉพาะผู้ที่ใช้ Cleansing Water)

| ฟิลด์ | ประเภท | คำอธิบาย |
|---|---|---|
| `age` | string | กลุ่มอายุ (เช่น "18-24", "25-34") |
| `skin_type` | string | ประเภทผิว (เช่น "ผิวมัน", "ผิวแห้ง") |
| `uses_kiyora` | number (0/1) | ใช้ Kiyora หรือไม่ (Target Variable) |
| `factor_*` | number (1-5) | คะแนนปัจจัยการเลือกซื้อ (หลายคอลัมน์) |
| `monthly_income` | string | รายได้ต่อเดือน |
| `brands_used` | string | แบรนด์ที่ใช้ |
| `concerns` | string | ปัญหาผิวที่กังวล (comma-separated) |

### `public/model_results.json`
ผลลัพธ์การเปรียบเทียบโมเดล 3 ตัว:

```json
[
  {
    "Model": "Logistic Regression",
    "Accuracy": 0.6,
    "Precision": 0.4286,
    "Recall": 0.3333,
    "F1-score": 0.375
  },
  ...
]
```

---

## 🔄 Data Pipeline

```
┌─────────────────────┐
│  cleansing_water     │   CSV จากแบบสอบถาม
│  _data.csv           │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Python Script       │   ทำความสะอาด + Train Model
│  (------------.py)   │   • กรองเฉพาะผู้ใช้ Cleansing Water
│                      │   • สร้าง Target: uses_kiyora
│                      │   • Encode categorical features
│                      │   • Train 3 Models (LR, DT, RF)
└────────┬────────────┘
         │
         ├──▶ clean_data.json          → public/
         ├──▶ model_results.json       → public/
         └──▶ dt.pkl                   → Saved Decision Tree Model
         │
         ▼
┌─────────────────────┐
│  Next.js App         │   โหลด JSON → แสดง Dashboard
│  (Supervise.tsx)     │   • คำนวณ Statistics client-side
│                      │   • สร้าง Charts แบบ Dynamic
│                      │   • Pearson Correlation + Heatmap
└─────────────────────┘
```

---

## 🚀 การติดตั้งและรัน (Setup)

### ความต้องการของระบบ (Prerequisites)

- **Node.js** ≥ 18.x ([ดาวน์โหลด](https://nodejs.org/))
- **npm** ≥ 9.x (มาพร้อมกับ Node.js)
- **Python** ≥ 3.8 (สำหรับรัน Data Pipeline เท่านั้น — ไม่จำเป็นสำหรับรัน Web App)

### ขั้นตอนการติดตั้ง

```bash
# 1. Clone หรือเปิดโฟลเดอร์โปรเจกต์
cd modo-app

# 2. ติดตั้ง Dependencies
npm install

# 3. รัน Development Server
npm run dev
```

เปิดเบราว์เซอร์ไปที่ **[http://localhost:3000](http://localhost:3000)** เพื่อดู Dashboard

### (ทางเลือก) รัน Data Pipeline

หากต้องการประมวลผลข้อมูลใหม่:

```bash
# ติดตั้ง Python dependencies
pip install pandas numpy scikit-learn seaborn matplotlib joblib

# รันสคริปต์
python "------------.py"
```

> ⚠️ ต้องมีไฟล์ `cleansing_water_data.csv` อยู่ในโฟลเดอร์เดียวกัน

---

## 📜 สคริปต์ที่ใช้ได้ (Scripts)

| คำสั่ง | คำอธิบาย |
|---|---|
| `npm run dev` | รัน Development Server ที่ `localhost:3000` (Hot Reload) |
| `npm run build` | Build โปรเจกต์สำหรับ Production |
| `npm run start` | รัน Production Server |
| `npm run lint` | ตรวจสอบโค้ดด้วย ESLint |

---

## 🖥️ รายละเอียดหน้าเว็บ (Pages)

### Tab Navigation
แอปใช้ระบบ **Tab-based Navigation** (client-side state) แบ่งเป็น 3 หน้า:

| Tab | Component | สถานะ |
|---|---|---|
| **Home** | `page.tsx` | ✅ แสดงการ์ด Supervise + Unsupervise |
| **Supervise** | `Supervise.tsx` | ✅ Dashboard เต็มรูปแบบ |
| **Unsupervise** | `page.tsx` (inline) | 🚧 อยู่ระหว่างพัฒนา |

### Supervise Dashboard — รายละเอียดทางเทคนิค

#### การโหลดข้อมูล
- ใช้ `fetch()` โหลด `clean_data.json` และ `model_results.json` จาก `/public`
- แสดง Loading Spinner ระหว่างรอข้อมูล
- จัดการ Error State กรณีโหลดไม่สำเร็จ

#### ฟังก์ชัน Helper (คำนวณ Client-side)
| ฟังก์ชัน | หน้าที่ |
|---|---|
| `countBy(arr)` | นับจำนวนแต่ละค่าในอาร์เรย์ |
| `avg(nums)` | หาค่าเฉลี่ย |
| `pearson(a, b)` | คำนวณ Pearson Correlation Coefficient |
| `heatColor(v)` | แปลงค่า correlation (-1 ถึง 1) เป็นสี Coolwarm |

#### Heatmap Component
- ใช้ **HTML Canvas** วาด Correlation Matrix
- รองรับ Label แบบหมุน 45° สำหรับแกน X
- แสดง Color Legend Bar พร้อมค่า -1.0 ถึง 1.0

---

## 🤖 โมเดล Machine Learning

โปรเจกต์ใช้ **3 โมเดล Supervised Learning** ในการทำนายว่าผู้ใช้จะเลือก Kiyora หรือไม่:

| โมเดล | Hyperparameters |
|---|---|
| **Logistic Regression** | `max_iter=1000, random_state=42` |
| **Decision Tree** | `max_depth=3, random_state=42` |
| **Random Forest** | `n_estimators=50, max_depth=3, random_state=42` |

### Feature Selection
- ใช้ Pearson Correlation เป็นตัวกรอง
- เลือกเฉพาะ feature ที่มี correlation ≥ 0.10 กับ target (`uses_kiyora`)

### Train/Test Split
- **Test Size:** 30%
- **Stratified:** Yes (สัดส่วน target คงที่ระหว่าง train/test)
- **Random State:** 42

---

## 🎨 การปรับแต่ง (Customization)

### เปลี่ยนสี Theme
แก้ไขในไฟล์ `app/Supervise.tsx`:
```typescript
const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280"];
```

### เปลี่ยนข้อมูล
1. เตรียมข้อมูลใหม่ในรูปแบบ JSON เดียวกัน
2. วางไฟล์ใน `public/`
3. รีโหลดหน้าเว็บ — Dashboard จะอัปเดตอัตโนมัติ

### เพิ่มโมเดลใหม่
เพิ่มผลลัพธ์โมเดลใน `public/model_results.json`:
```json
{
  "Model": "SVM",
  "Accuracy": 0.65,
  "Precision": 0.50,
  "Recall": 0.40,
  "F1-score": 0.44
}
```
Dashboard จะสร้าง Column ในตารางและแท่งกราฟให้อัตโนมัติ

---

## 🧑‍💻 ผู้พัฒนา (Author)

โปรเจกต์นี้เป็นส่วนหนึ่งของรายวิชา **ปี 3 ภาคเรียนที่ 2/2568**

---

## License

MIT License — อนุญาตให้ใช้, คัดลอก, แก้ไข, และแจกจ่ายได้อย่างอิสระ
