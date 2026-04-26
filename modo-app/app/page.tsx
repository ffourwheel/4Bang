"use client";
import { useState } from "react";
import Supervise from "./components/Supervise/Supervise";
import Unsupervise from "./components/Unsupervise/Unsupervise";

export default function Home() {
  const [tab, setTab] = useState("home");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav className="navbar">
        <div className="nav-pill">
          <button
            className={`nav-item ${tab === "supervise" ? "active" : ""}`}
            onClick={() => setTab("supervise")}
          >
            Supervise
          </button>
          <button
            className={`nav-item ${tab === "home" ? "active" : ""}`}
            onClick={() => setTab("home")}
          >
            Home
          </button>
          <button
            className={`nav-item ${tab === "unsupervise" ? "active" : ""}`}
            onClick={() => setTab("unsupervise")}
          >
            Unsupervise
          </button>
        </div>
      </nav>

      <div className="content">
        {tab === "home" && (
          <div className="flex flex-col gap-6 pb-10 max-w-5xl mx-auto w-full">
            {/* Overview Card */}
            <div className="bg-[#161b22]/90 border border-indigo-500/30 rounded-2xl p-6 md:p-8 shadow-lg shadow-indigo-500/10">
              <h2 className="text-2xl font-bold text-indigo-100 flex items-center gap-3 mb-4">
                <span className="text-3xl">📊</span> ภาพรวมชุดข้อมูล (Dataset Overview)
              </h2>
              <p className="text-slate-400 text-[15px] leading-relaxed mb-6">
                ชุดข้อมูลนี้รวบรวมจากแบบสอบถามเกี่ยวกับพฤติกรรมการใช้ Cleansing Water และปัจจัยที่มีผลต่อการตัดสินใจซื้อผลิตภัณฑ์ โดยมุ่งเน้นการวิเคราะห์กลุ่มเป้าหมายเพื่อนำไปสู่การพัฒนากลยุทธ์สำหรับผลิตภัณฑ์ <strong>Kiyora Cleansing Water</strong> ข้อมูลดิบถูกจัดเก็บในไฟล์ <code>cleansing_water_data.csv</code> และถูกนำไปประมวลผลผ่าน Data Pipeline
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/5 p-5 rounded-xl text-center">
                  <div className="text-3xl font-bold text-indigo-400">130</div>
                  <div className="text-slate-300 text-sm mt-1">จำนวนผู้ตอบแบบสอบถามทั้งหมด</div>
                </div>
                <div className="bg-white/5 border border-white/5 p-5 rounded-xl text-center">
                  <div className="text-3xl font-bold text-emerald-400">28</div>
                  <div className="text-slate-300 text-sm mt-1">จำนวนฟีเจอร์ (Columns)</div>
                </div>
                <div className="bg-white/5 border border-white/5 p-5 rounded-xl text-center">
                  <div className="text-3xl font-bold text-amber-400">10</div>
                  <div className="text-slate-300 text-sm mt-1">ปัจจัยการตัดสินใจหลัก</div>
                </div>
              </div>
            </div>

            {/* Dictionary Card */}
            <div className="bg-[#161b22]/90 border border-[#30363d] rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-slate-200 mb-5 flex items-center gap-2">
                📋 คำอธิบายตัวแปร (Data Dictionary)
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-indigo-500/40 text-slate-400">
                      <th className="py-3 px-4 font-medium w-1/4">ชื่อคอลัมน์ (Column)</th>
                      <th className="py-3 px-4 font-medium w-1/5">ประเภท (Type)</th>
                      <th className="py-3 px-4 font-medium">คำอธิบาย (Description)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-indigo-300 font-medium">sex, age, occupation</td>
                      <td className="py-3 px-4">Categorical</td>
                      <td className="py-3 px-4">ข้อมูลประชากรศาสตร์เบื้องต้น (เพศ, กลุ่มอายุ, อาชีพ)</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-indigo-300 font-medium">monthly_income, province</td>
                      <td className="py-3 px-4">Categorical</td>
                      <td className="py-3 px-4">รายได้เฉลี่ยต่อเดือน และ จังหวัดที่พักอาศัย</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-indigo-300 font-medium">skin_type, concerns</td>
                      <td className="py-3 px-4">Categorical</td>
                      <td className="py-3 px-4">สภาพผิว (เช่น ผิวมัน, ผิวแห้ง) และปัญหาผิวที่กังวล (สิว, รูขุมขน หรืออะไรอื่นๆ)</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-indigo-300 font-medium">acne_level</td>
                      <td className="py-3 px-4">Categorical</td>
                      <td className="py-3 px-4">ระดับความรุนแรงของสิว</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-indigo-300 font-medium">use_cleansing_water</td>
                      <td className="py-3 px-4">Binary</td>
                      <td className="py-3 px-4">ระบุว่าปัจจุบันใช้ Cleansing Water หรือไม่ (ใช้ / ไม่ใช้)</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-indigo-300 font-medium align-top">10 factors (10 ปัจจัย)</td>
                      <td className="py-3 px-4 align-top">Numerical (1-5)</td>
                      <td className="py-3 px-4">
                        คะแนนความสำคัญของปัจจัยต่างๆ (1=น้อยที่สุด, 5=มากที่สุด)<br />
                        <span className="text-xs text-slate-500 mt-1 block">deep_cleansing, acne_friendly, sensitive_friendly, no_allergen, hypoallergenic, moisturizing, low_friction, nourishment, eye_friendly, oil_control</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-indigo-300 font-medium">switch_factors</td>
                      <td className="py-3 px-4">Categorical</td>
                      <td className="py-3 px-4">สาเหตุหรือปัจจัยที่ทำให้ตัดสินใจเปลี่ยนแบรนด์</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-indigo-300 font-medium">brand_primary</td>
                      <td className="py-3 px-4">Categorical (Target)</td>
                      <td className="py-3 px-4">แบรนด์ที่ใช้งานเป็นหลักในปัจจุบัน ใช้เป็น <strong>Target Variable</strong> ในการทำโมเดลว่าใช้ Kiyora หรือไม่</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "supervise" && (
          <Supervise />
        )}

        {tab === "unsupervise" && (
          <Unsupervise />
        )}
      </div>
      <p className="usv-footer"> Unsupervised Learning • Supervised Learning </p>
    </div>
  );
}
