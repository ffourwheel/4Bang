import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, ShieldCheck, Zap } from 'lucide-react';

export interface PredictionResult {
  shouldUse: boolean;
  probability: number;
  insight?: string;
}

interface ResultCardProps {
  result: PredictionResult | null;
}

export default function ResultCard({ result }: ResultCardProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (result) {
      setShow(false);
      const timer = setTimeout(() => setShow(true), 50);
      return () => clearTimeout(timer);
    }
  }, [result]);

  if (!result) return null;

  const isPositive = result.shouldUse;
  const confidence = result.probability >= 80 ? "High Confidence" : result.probability >= 60 ? "Medium Confidence" : "Low Confidence";

  return (
    <div className={`transition-all duration-700 ease-out transform ${show ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} max-w-2xl mx-auto w-full`}>
      <div className={`relative overflow-hidden rounded-2xl p-1 shadow-2xl ${isPositive ? 'bg-gradient-to-br from-green-400 to-emerald-600' : 'bg-gradient-to-br from-red-400 to-rose-600'
        }`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
        <div className="bg-gray-900/90 backdrop-blur-3xl rounded-xl p-8 relative z-10">

          <div className="absolute top-4 right-4 flex gap-2">
            <span className={`px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1 ${isPositive ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}>
              <ShieldCheck className="w-3 h-3" />
              {confidence}
            </span>
          </div>

          <div className="flex flex-col items-center text-center space-y-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${isPositive ? 'bg-green-500/20 text-green-400 shadow-green-500/20' : 'bg-red-500/20 text-red-400 shadow-red-500/20'
              }`}>
              {isPositive ? (
                <CheckCircle2 className="w-12 h-12" />
              ) : (
                <XCircle className="w-12 h-12" />
              )}
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2">Prediction Result</h2>
              <div className="text-3xl font-extrabold text-white flex items-center justify-center gap-3">
                {isPositive ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">เป็นกลุ่มลูกค้าเป้าหมาย</span>
                ) : (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">ไม่ใช่กลุ่มลูกค้าเป้าหมาย</span>
                )}
              </div>
            </div>

            <div className="w-full max-w-md pt-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-gray-400">ความน่าจะเป็น (Probability)</span>
                <span className={`text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {result.probability.toFixed(1)}%
                </span>
              </div>
              <div className="h-4 w-full bg-gray-800 rounded-full overflow-hidden shadow-inner border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isPositive ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-rose-400'
                    }`}
                  style={{ width: `${show ? result.probability : 0}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {result.insight ? (
              <div className={`mt-4 p-4 rounded-xl border flex items-start gap-3 text-left w-full max-w-md ${isPositive ? 'bg-green-500/10 border-green-500/20 text-emerald-200' : 'bg-red-500/10 border-red-500/20 text-rose-200'
                }`}>
                {isPositive ? <Zap className="w-5 h-5 shrink-0 mt-0.5 text-green-400" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />}
                <div>
                  <p className="font-semibold text-sm mb-1">Insight วิเคราะห์ผล</p>
                  <p className="text-sm opacity-90">{result.insight}</p>
                </div>
              </div>
            ) : (
              <>
                {isPositive && (
                  <p className="text-emerald-200/70 text-sm mt-4 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> ปัจจัยต่างๆ ตรงกับลักษณะกลุ่มลูกค้าเป้าหมาย
                  </p>
                )}
                {!isPositive && (
                  <p className="text-rose-200/70 text-sm mt-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> ปัจจัยของคุณยังไม่ตรงกับลักษณะกลุ่มเป้าหมาย
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { AlertCircle } from 'lucide-react';
