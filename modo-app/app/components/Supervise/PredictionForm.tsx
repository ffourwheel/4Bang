import React, { useState } from 'react';
import { Droplet, Sparkles, SlidersHorizontal, AlertCircle, RefreshCcw } from 'lucide-react';

export interface PredictionPayload {
  factor_deep_cleansing: number;
  factor_sensitive_friendly: number;
  factor_oil_control: number;
  "concern_ผิวมันเยิ้ม": number;
  "concern_รอยสิว": number;
  "concern_รูขุมขนกว้าง": number;
  "concern_ผิวแห้ง/ลอก/เป็นขุย": number;
  "concern_สิวอุดตัน": number;
  "concern_ไม่มีปัญหาผิว": number;
  "skin_ผิวธรรมดา": boolean;
  "skin_ผิวมัน": boolean;
}

interface PredictionFormProps {
  onSubmit: (data: PredictionPayload) => void;
  isLoading: boolean;
  onReset: () => void;
}

const SKIN_CONCERNS = [
  "ผิวมันเยิ้ม",
  "รอยสิว",
  "รูขุมขนกว้าง",
  "ผิวแห้ง/ลอก/เป็นขุย",
  "สิวอุดตัน",
  "ไม่มีปัญหาผิว"
];

const DEFAULT_STATE = {
  skinType: "ผิวธรรมดา" as "ผิวธรรมดา" | "ผิวมัน",
  concerns: [] as string[],
  factors: {
    deep_cleansing: 3,
    sensitive_friendly: 3,
    oil_control: 3,
  }
};

export default function PredictionForm({ onSubmit, isLoading, onReset }: PredictionFormProps) {
  const [state, setState] = useState(DEFAULT_STATE);
  const [error, setError] = useState<string | null>(null);

  const handleConcernToggle = (concern: string) => {
    setState(prev => {
      let newConcerns = [...prev.concerns];
      if (concern === "ไม่มีปัญหาผิว") {
        newConcerns = prev.concerns.includes(concern) ? [] : ["ไม่มีปัญหาผิว"];
      } else {
        newConcerns = newConcerns.filter(c => c !== "ไม่มีปัญหาผิว");
        if (newConcerns.includes(concern)) {
          newConcerns = newConcerns.filter(c => c !== concern);
        } else {
          newConcerns.push(concern);
        }
      }
      return { ...prev, concerns: newConcerns };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.concerns.length === 0) {
      setError("โปรดเลือกปัญหาผิวอย่างน้อย 1 ข้อ (หรือเลือก 'ไม่มีปัญหาผิว')");
      return;
    }
    setError(null);

    const payload: PredictionPayload = {
      factor_deep_cleansing: state.factors.deep_cleansing,
      factor_sensitive_friendly: state.factors.sensitive_friendly,
      factor_oil_control: state.factors.oil_control,
      "concern_ผิวมันเยิ้ม": state.concerns.includes("ผิวมันเยิ้ม") ? 1 : 0,
      "concern_รอยสิว": state.concerns.includes("รอยสิว") ? 1 : 0,
      "concern_รูขุมขนกว้าง": state.concerns.includes("รูขุมขนกว้าง") ? 1 : 0,
      "concern_ผิวแห้ง/ลอก/เป็นขุย": state.concerns.includes("ผิวแห้ง/ลอก/เป็นขุย") ? 1 : 0,
      "concern_สิวอุดตัน": state.concerns.includes("สิวอุดตัน") ? 1 : 0,
      "concern_ไม่มีปัญหาผิว": state.concerns.includes("ไม่มีปัญหาผิว") ? 1 : 0,
      "skin_ผิวธรรมดา": state.skinType === "ผิวธรรมดา",
      "skin_ผิวมัน": state.skinType === "ผิวมัน",
    };

    onSubmit(payload);
  };

  const handleReset = () => {
    setState(DEFAULT_STATE);
    setError(null);
    onReset();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-8 w-full max-w-4xl mx-auto transition-all">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Customer Segmentation Predictor</h2>
          <p className="text-indigo-200/70 text-sm mt-1">ระบบทำนายว่าผู้ใช้เป็นกลุ่มลูกค้าเป้าหมายหรือไม่ จากข้อมูลสภาพผิว</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Skin Type & Concerns */}
        <div className="space-y-8">
          {/* Skin Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Droplet className="w-5 h-5 text-indigo-400" />
              สภาพผิวของคุณ (Skin Type)
            </h3>
            <div className="flex gap-4">
              {["ผิวธรรมดา", "ผิวมัน"].map((type) => (
                <label
                  key={type}
                  className={`flex-1 cursor-pointer group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 ${state.skinType === type
                      ? "bg-indigo-500/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                      : "bg-black/20 border-white/10 hover:border-white/30 hover:bg-white/5"
                    }`}
                >
                  <input
                    type="radio"
                    name="skinType"
                    value={type}
                    checked={state.skinType === type}
                    onChange={(e) => setState({ ...state, skinType: e.target.value as any })}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${state.skinType === type ? "text-indigo-300" : "text-gray-400"}`}>
                      {type}
                    </span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${state.skinType === type ? "border-indigo-400" : "border-gray-500"
                      }`}>
                      {state.skinType === type && <div className="w-2 h-2 bg-indigo-400 rounded-full" />}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Skin Concerns */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-purple-400" />
              ปัญหาผิว (Skin Concerns)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {SKIN_CONCERNS.map((concern) => {
                const isSelected = state.concerns.includes(concern);
                return (
                  <label
                    key={concern}
                    className={`cursor-pointer rounded-xl border p-3 flex items-start gap-3 transition-all duration-200 ${isSelected
                        ? "bg-purple-500/20 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                        : "bg-black/20 border-white/10 hover:border-white/30 hover:bg-white/5"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleConcernToggle(concern)}
                      className="mt-1 sr-only"
                    />
                    <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? "bg-purple-500 border-purple-500" : "border-gray-500 bg-transparent"
                      }`}>
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm leading-tight ${isSelected ? "text-purple-200" : "text-gray-400"}`}>
                      {concern}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Factors */}
        <div className="space-y-6 bg-black/20 p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-400" />
            ปัจจัยความสำคัญ (1-5)
          </h3>
          <p className="text-sm text-gray-400 mb-6">ระบุระดับความสำคัญของปัจจัยต่างๆ ในการเลือกใช้ผลิตภัณฑ์ (1 = น้อยที่สุด, 5 = มากที่สุด)</p>

          {[
            { key: "deep_cleansing", label: "การทำความสะอาดล้ำลึก (Deep Cleansing)", color: "from-blue-500 to-indigo-500" },
            { key: "sensitive_friendly", label: "อ่อนโยนต่อผิวแพ้ง่าย (Sensitive Friendly)", color: "from-indigo-500 to-purple-500" },
            { key: "oil_control", label: "ควบคุมความมัน (Oil Control)", color: "from-purple-500 to-pink-500" },
          ].map((factor) => (
            <div key={factor.key} className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-300">{factor.label}</label>
                <span className="bg-white/10 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-inner">
                  {state.factors[factor.key as keyof typeof state.factors]}
                </span>
              </div>
              <div className="relative pt-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={state.factors[factor.key as keyof typeof state.factors]}
                  onChange={(e) => setState({
                    ...state,
                    factors: { ...state.factors, [factor.key]: parseInt(e.target.value) }
                  })}
                  className="w-full h-2 appearance-none bg-gray-700 rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg"
                  style={{
                    background: `linear-gradient(to right, #6366f1 ${((state.factors[factor.key as keyof typeof state.factors] - 1) / 4) * 100}%, #374151 ${((state.factors[factor.key as keyof typeof state.factors] - 1) / 4) * 100}%)`
                  }}
                />
                <div className="flex justify-between px-1 mt-2 text-xs text-gray-500">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4 justify-end items-center mt-8">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors w-full sm:w-auto justify-center"
          disabled={isLoading}
        >
          <RefreshCcw className="w-4 h-4" />
          Reset Form
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="relative group overflow-hidden w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 group-hover:bg-[length:200%_auto] animate-gradient transition-all" />
          <div className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing
              </>
            ) : (
              <>
                Predict Now
                <Sparkles className="w-5 h-5" />
              </>
            )}
          </div>
        </button>
      </div>
    </form>
  );
}
