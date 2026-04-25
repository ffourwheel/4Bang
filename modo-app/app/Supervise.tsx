"use client";
import { useEffect, useState, useRef } from "react";
import { Bar, Doughnut, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, RadialLinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend
} from "chart.js";
import "./Supervise.css";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend
);

// ========== Helper ==========

// นับจำนวนแต่ละค่า
function countBy(arr: string[]) {
  const map: Record<string, number> = {};
  for (const v of arr) map[v] = (map[v] || 0) + 1;
  return map;
}

// หาค่าเฉลี่ย
function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

// คำนวณ Pearson Correlation
function pearson(a: number[], b: number[]) {
  const n = a.length;
  if (!n) return 0;
  const ma = avg(a);
  const mb = avg(b);
  let xy = 0, x2 = 0, y2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = a[i] - ma;
    const dy = b[i] - mb;
    xy += dx * dy;
    x2 += dx * dx;
    y2 += dy * dy;
  }
  const d = Math.sqrt(x2 * y2);
  return d === 0 ? 0 : xy / d;
}

// สี heatmap (coolwarm)
function heatColor(v: number) {
  const t = (v + 1) / 2;
  const r = Math.round(t < 0.5 ? 59 + t * 2 * 196 : 255);
  const g = Math.round(t < 0.5 ? 76 + t * 2 * 179 : 255 - (t - 0.5) * 2 * 179);
  const b = Math.round(t < 0.5 ? 192 : 192 - (t - 0.5) * 2 * 130);
  return `rgb(${r},${g},${b})`;
}

// ========== Heatmap (canvas) ==========
function Heatmap({ labels, values }: { labels: string[]; values: number[][] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current || !values?.length) return;
    const ctx = ref.current.getContext("2d")!;
    const n = labels.length;
    const cell = Math.min(38, (ref.current.width - 130) / n);
    const sx = 130, sy = 10;
    ctx.clearRect(0, 0, ref.current.width, ref.current.height);

    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const v = values[i][j];
      ctx.fillStyle = heatColor(v);
      ctx.fillRect(sx + j * cell, sy + i * cell, cell - 1, cell - 1);
      ctx.fillStyle = Math.abs(v) > 0.35 ? "#fff" : "#333";
      ctx.font = "9px Inter,sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(v.toFixed(2), sx + j * cell + cell / 2, sy + i * cell + cell / 2);
    }

    ctx.fillStyle = "#ccc"; ctx.font = "9px Inter,sans-serif";
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    labels.forEach((l, i) => {
      ctx.fillText(l.length > 16 ? l.slice(0, 15) + "…" : l, sx - 6, sy + i * cell + cell / 2);
    });

    ctx.textAlign = "center"; ctx.textBaseline = "top";
    labels.forEach((l, j) => {
      ctx.save();
      ctx.translate(sx + j * cell + cell / 2, sy + n * cell + 5);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(l.length > 14 ? l.slice(0, 13) + "…" : l, 0, 0);
      ctx.restore();
    });

    const lx = sx + n * cell + 12, lh = n * cell;
    for (let i = 0; i < lh; i++) { ctx.fillStyle = heatColor(1 - (2 * i) / lh); ctx.fillRect(lx, sy + i, 12, 1); }
    ctx.fillStyle = "#ccc"; ctx.font = "9px Inter,sans-serif"; ctx.textAlign = "left";
    ctx.fillText("1.0", lx + 16, sy + 4);
    ctx.fillText("0.0", lx + 16, sy + lh / 2);
    ctx.fillText("-1.0", lx + 16, sy + lh - 2);
  }, [labels, values]);

  return <canvas ref={ref} width={680} height={560} style={{ width: "100%", maxWidth: 680, margin: "0 auto", display: "block" }} />;
}

// ========== สีและ Type ==========
type Row = Record<string, any>;
type ModelRow = Record<string, any>;

// สีหลัก (hex อ่านง่าย)
const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280"];
const gridColor = "#ffffff10";
const textColor = "#ccc";
const mutedColor = "#999";

// ========== Component หลัก ==========
export default function Supervise() {
  const [rows, setRows] = useState<Row[]>([]);
  const [models, setModels] = useState<ModelRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/clean_data.json").then(r => r.json()),
      fetch("/model_results.json").then(r => r.json()),
    ])
      .then(([d, m]) => { setRows(d); setModels(m); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="sv-center"><div className="spinner" /><p> Loading</p></div>;
  if (!rows.length) return <div className="sv-center"><p>Error</p></div>;

  // ===== สถิติ =====
  const total = rows.length;
  const kiyora = rows.filter(r => r.uses_kiyora === 1).length;
  const pct = ((kiyora / total) * 100).toFixed(1);

  // ดึง metric keys จาก model_results.json อัตโนมัติ
  const metricKeys = models.length ? Object.keys(models[0]).filter(k => k !== "Model") : [];

  // factor columns
  const fCols = Object.keys(rows[0]).filter(k => k.startsWith("factor_"));
  const fLabels = fCols.map(k => k.replace("factor_", "").replaceAll("_", " "));
  const fAvg = fCols.map(k => +avg(rows.map(r => Number(r[k]) || 0)).toFixed(2));

  // demographics
  const ages = countBy(rows.map(r => String(r.age)));
  const ageKeys = Object.keys(ages).sort();
  const skins = countBy(rows.map(r => String(r.skin_type)));

  // correlation
  const yArr = rows.map(r => Number(r.uses_kiyora));
  const corrList = fCols.map((k, i) => ({
    label: fLabels[i],
    val: +pearson(rows.map(r => Number(r[k]) || 0), yArr).toFixed(4),
  })).sort((a, b) => b.val - a.val);
  const top5 = corrList.slice(0, 5);

  // heatmap matrix
  const hmCols = [...fCols, "uses_kiyora"];
  const hmLabels = hmCols.map(k => k.replace("factor_", "").replaceAll("_", " "));
  const hmValues = hmCols.map(a =>
    hmCols.map(b => +pearson(rows.map(r => Number(r[a]) || 0), rows.map(r => Number(r[b]) || 0)).toFixed(4))
  );

  // chart style ใช้ซ้ำ
  const grid = { color: gridColor };
  const xAxis = { ticks: { color: textColor }, grid: { display: false } };
  const yAxis = { ticks: { color: mutedColor }, grid };

  return (
    <div className="sv">
      <div className="sv-header">
        <h2> Supervised Learning Dashboard</h2>
        <p> Supervised Learning • วิเคราะห์ปัจจัยการเลือกใช้ Kiyora ข้อมูล {total} ตัวอย่าง</p>
      </div>

      {/* Stats */}
      <div className="sv-stats">
        <div className="sv-stat"><span className="sv-num">{total}</span>ตัวอย่างทั้งหมด</div>
        <div className="sv-stat"><span className="sv-num c-indigo">{kiyora}</span>ใช้ Kiyora</div>
        <div className="sv-stat"><span className="sv-num c-gray">{total - kiyora}</span>ไม่ใช้ Kiyora</div>
        <div className="sv-stat"><span className="sv-num c-green">{pct}%</span>อัตราใช้ Kiyora</div>
      </div>

      {/* ===== Model Performance ===== */}
      <h3 className="sv-section"> Model Performance</h3>

      {/* ตาราง — ดึง column headers จาก JSON */}
      <div className="sv-card">
        <table className="sv-table">
          <thead>
            <tr>
              <th>Model</th>
              {metricKeys.map(k => <th key={k}>{k}</th>)}
            </tr>
          </thead>
          <tbody>
            {models.map((m, i) => (
              <tr key={i}>
                <td>{m.Model}</td>
                {metricKeys.map(k => (
                  <td key={k}>{(Number(m[k]) * 100).toFixed(1)}%</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sv-row">
        {/* กราฟ bar — สร้าง dataset จาก metricKeys อัตโนมัติ */}
        <div className="sv-card">
          <h4>Model Comparison</h4>
          <div className="sv-chart">
            <Bar
              data={{
                labels: models.map(m => m.Model),
                datasets: metricKeys.map((key, i) => ({
                  label: key,
                  data: models.map(m => Number(m[key])),
                  backgroundColor: colors[i % colors.length],
                  borderRadius: 4,
                })),
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: textColor } } },
                scales: {
                  y: { min: 0, max: 1, ticks: { color: mutedColor, callback: v => (Number(v) * 100) + "%" }, grid },
                  x: xAxis,
                },
              }}
            />
          </div>
        </div>

        <div className="sv-card">
          <h4>สัดส่วนผู้ใช้ Kiyora</h4>
          <div className="sv-chart">
            <Doughnut
              data={{
                labels: ["ใช้ Kiyora", "ไม่ใช้"],
                datasets: [{ data: [kiyora, total - kiyora], backgroundColor: [colors[0], "#374151"], borderWidth: 0 }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: "60%",
                plugins: { legend: { position: "bottom", labels: { color: textColor } } },
              }}
            />
          </div>
          <p className="sv-chart-note">{pct}% ของผู้ใช้ Cleansing Water เลือก Kiyora</p>
        </div>
      </div>

      {/* ===== Correlation ===== */}
      <h3 className="sv-section"> Correlation Analysis</h3>

      <div className="sv-row">
        <div className="sv-card">
          <h4>Top 5 Correlation → Kiyora</h4>
          <p className="sv-sub">ปัจจัยที่มีความสัมพันธ์เชิงบวกสูงสุดกับการเลือกใช้ Kiyora</p>
          <div className="sv-chart">
            <Bar
              data={{
                labels: top5.map(c => c.label),
                datasets: [{
                  label: "Correlation",
                  data: top5.map(c => c.val),
                  backgroundColor: colors.slice(0, 5),
                  borderRadius: 6,
                }],
              }}
              options={{
                indexAxis: "y" as const,
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { ticks: { color: mutedColor }, grid }, y: { ticks: { color: textColor, font: { size: 12 } }, grid: { display: false } } },
              }}
            />
          </div>
        </div>
        <div className="sv-card">
          <h4>Correlation Heatmap</h4>
          <p className="sv-sub">Factor Features vs Uses Kiyora</p>
          <Heatmap labels={hmLabels} values={hmValues} />
        </div>
      </div>

      {/* ===== Demographics ===== */}
      <h3 className="sv-section"> Demographics</h3>

      <div className="sv-row">
        <div className="sv-card">
          <h4>กลุ่มอายุ</h4>
          <div className="sv-chart">
            <Bar
              data={{
                labels: ageKeys,
                datasets: [{ label: "จำนวน", data: ageKeys.map(k => ages[k]), backgroundColor: colors, borderRadius: 4 }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: yAxis, x: xAxis },
              }}
            />
          </div>
        </div>
        <div className="sv-card">
          <h4>ประเภทผิว</h4>
          <div className="sv-chart">
            <Doughnut
              data={{
                labels: Object.keys(skins),
                datasets: [{ data: Object.values(skins), backgroundColor: colors, borderWidth: 0 }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: "50%",
                plugins: { legend: { position: "right", labels: { color: textColor, font: { size: 11 } } } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Factor Radar */}
      <div className="sv-card">
        <h4> ปัจจัยในการเลือกซื้อ (เฉลี่ย 1-5)</h4>
        <div className="sv-chart sv-chart-lg">
          <Radar
            data={{
              labels: fLabels,
              datasets: [{
                label: "คะแนนเฉลี่ย",
                data: fAvg,
                backgroundColor: colors[0] + "26",
                borderColor: colors[0],
                pointBackgroundColor: colors[0],
                borderWidth: 2,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                r: {
                  min: 0, max: 5,
                  ticks: { stepSize: 1, color: mutedColor, backdropColor: "transparent" },
                  grid,
                  pointLabels: { color: textColor, font: { size: 11 } },
                },
              },
              plugins: { legend: { display: false } },
            }}
          />
        </div>
      </div>
      <p className="usv-footer"> วิเคราะห์ปัจจัยการเลือกใช้ Kiyora • Supervised Learning </p>
    </div>
  );
}