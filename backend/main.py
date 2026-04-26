from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "supervised", "dt.pkl")

try:
    model = joblib.load(MODEL_PATH)
    print("Model loaded")
except Exception as e:
    print(f"Error {e}")
    model = None

class PredictionPayload(BaseModel):
    factor_deep_cleansing: float
    factor_sensitive_friendly: float
    factor_oil_control: float
    concern_oily: int = Field(alias="concern_ผิวมันเยิ้ม")
    concern_acne: int = Field(alias="concern_รอยสิว")
    concern_pores: int = Field(alias="concern_รูขุมขนกว้าง")
    concern_dry: int = Field(alias="concern_ผิวแห้ง/ลอก/เป็นขุย")
    concern_clogged: int = Field(alias="concern_สิวอุดตัน")
    concern_none: int = Field(alias="concern_ไม่มีปัญหาผิว")
    skin_normal: bool = Field(alias="skin_ผิวธรรมดา")
    skin_oily: bool = Field(alias="skin_ผิวมัน")

@app.post("/detect")
async def detect(payload: PredictionPayload):
    if model is None:
        return {"error": "Model is not loaded."}

    data = {
        'factor_deep_cleansing': [payload.factor_deep_cleansing],
        'factor_sensitive_friendly': [payload.factor_sensitive_friendly],
        'factor_oil_control': [payload.factor_oil_control],
        'concern_ผิวมันเยิ้ม': [payload.concern_oily],
        'concern_รอยสิว': [payload.concern_acne],
        'concern_รูขุมขนกว้าง': [payload.concern_pores],
        'concern_ผิวแห้ง/ลอก/เป็นขุย': [payload.concern_dry],
        'concern_สิวอุดตัน': [payload.concern_clogged],
        'concern_ไม่มีปัญหาผิว': [payload.concern_none],
        'skin_ผิวธรรมดา': [int(payload.skin_normal)],
        'skin_ผิวมัน': [int(payload.skin_oily)]
    }

    df = pd.DataFrame(data)

    prediction = int(model.predict(df)[0])
    
    probabilities = model.predict_proba(df)[0]
    prob_class_1 = float(probabilities[1]) * 100 

    shouldUse = bool(prediction == 1)

    return {
        "prediction": prediction,
        "probability": round(prob_class_1, 2),
        "shouldUse": shouldUse
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
