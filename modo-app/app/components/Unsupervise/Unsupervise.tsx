"use client";
import { useEffect, useState, useRef } from "react";
import { Bar, Doughnut, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, PointElement, LineElement, Tooltip, Legend
} from "chart.js";
import "./Unsupervise.css";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Tooltip, Legend
);

// ========== Helper ==========
function countBy(arr: string[]) {
  const map: Record<string, number> = {};
  for (const v of arr) map[v] = (map[v] || 0) + 1;
  return map;
}

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

// สี heatmap (coolwarm)
function heatColor(v: number) {
  // map 1 to 5 to 0 to 1
  const t = (v - 1) / 4;
  const r = Math.round(t < 0.5 ? 59 + t * 2 * 196 : 255);
  const g = Math.round(t < 0.5 ? 76 + t * 2 * 179 : 255 - (t - 0.5) * 2 * 179);
  const b = Math.round(t < 0.5 ? 192 : 192 - (t - 0.5) * 2 * 130);
  return `rgb(${r},${g},${b})`;
}

// ========== Heatmap (canvas) ==========
function Heatmap({ labels, yLabels, values }: { labels: string[]; yLabels: string[]; values: number[][] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current || !values?.length) return;
    const ctx = ref.current.getContext("2d")!;
    const cols = labels.length;
    const rows = yLabels.length;
    const cellW = Math.min(50, (ref.current.width - 250) / cols);
    const cellH = Math.min(40, (ref.current.height - 120) / rows);
    const sx = 200, sy = 20;
    ctx.clearRect(0, 0, ref.current.width, ref.current.height);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const v = values[i][j];
        ctx.fillStyle = heatColor(v);
        ctx.fillRect(sx + j * cellW, sy + i * cellH, cellW - 2, cellH - 2);

        // Text color contrast
        ctx.fillStyle = v > 4.0 || v < 2.5 ? "#fff" : "#111";
        ctx.font = "11px Inter,sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(v.toFixed(1), sx + j * cellW + cellW / 2, sy + i * cellH + cellH / 2);
      }
    }

    // Y Labels (Clusters)
    ctx.fillStyle = "#ccc"; ctx.font = "12px Inter,sans-serif";
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    yLabels.forEach((l, i) => {
      ctx.fillText(l.length > 25 ? l.slice(0, 25) + "..." : l, sx - 10, sy + i * cellH + cellH / 2);
    });

    // X Labels (Factors)
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    labels.forEach((l, j) => {
      ctx.save();
      ctx.translate(sx + j * cellW + cellW / 2, sy + rows * cellH + 10);
      ctx.rotate(-Math.PI / 6);
      ctx.fillText(l.replace("factor_", ""), 0, 0);
      ctx.restore();
    });

    // Legend
    const lx = sx + cols * cellW + 20, lh = rows * cellH;
    for (let i = 0; i < lh; i++) {
      // 1 to 5 mapped
      ctx.fillStyle = heatColor(5 - (4 * i) / lh);
      ctx.fillRect(lx, sy + i, 12, 1);
    }
    ctx.fillStyle = "#ccc"; ctx.font = "10px Inter,sans-serif"; ctx.textAlign = "left";
    ctx.fillText("5.0", lx + 18, sy + 4);
    ctx.fillText("3.0", lx + 18, sy + lh / 2);
    ctx.fillText("1.0", lx + 18, sy + lh - 2);
  }, [labels, yLabels, values]);

  return <canvas ref={ref} width={800} height={380} style={{ width: "100%", maxWidth: 800, margin: "0 auto", display: "block" }} />;
}

// ========== Type & Colors ==========
type UnsupervisedRow = Record<string, any>;
type ClusterProfile = Record<string, any>;

const clusterColors = ["#f59e0b", "#10b981", "#6366f1", "#ef4444", "#8b5cf6"];
const gridColor = "#ffffff10";
const textColor = "#ccc";
const mutedColor = "#999";

export default function Unsupervise() {
  const [data, setData] = useState<UnsupervisedRow[]>([]);
  const [profile, setProfile] = useState<ClusterProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/cluster_result.json").then(r => r.json()),
      fetch("/cluster_profile.json").then(r => r.json())
    ]).then(([resData, resProfile]) => {
      setData(resData);
      setProfile(resProfile);
      setLoading(false);
    }).catch(err => {
      console.error("Error loading JSON:", err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="usv-center" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spinner" style={{ width: 36, height: 36, border: "3px solid #333", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 1s linear infinite" }} /></div>;
  if (!data.length) return <div className="usv-center" style={{ textAlign: "center", paddingTop: "50px", color: "#fff" }}><h3>Error loading data</h3><p>Make sure cluster_result.json and cluster_profile.json exist in the public folder.</p></div>;

  const total = data.length;
  const clusters = [...new Set(data.map(d => Number(d.cluster)))].sort();
  const kNum = clusters.length;

  const clusterCounts = clusters.map(c => data.filter(d => Number(d.cluster) === c).length);
  const maxClusterSize = Math.max(...clusterCounts);
  const maxClusterPct = ((maxClusterSize / total) * 100).toFixed(1);

  // Extract cluster names from data dynamically
  const clusterNames = clusters.map(c => {
    const row = data.find(d => Number(d.cluster) === c);
    return row?.cluster_name || `Cluster ${c}`;
  });

  // Extract factors dynamically from profile
  const factors = Object.keys(data[0]).filter(k => k.startsWith("factor_"));
  const hmValues = clusters.map(c => {
    const p = profile.find(pr => Number(pr.cluster) === c);
    if (p) return factors.map(f => Number(p[f]));
    // Fallback if profile not found
    const cData = data.filter(d => Number(d.cluster) === c);
    return factors.map(f => avg(cData.map(d => Number(d[f]) || 0)));
  });

  // Demographics
  const skinsByCluster = clusters.map(c => countBy(data.filter(d => Number(d.cluster) === c).map(d => String(d.skin_type))));
  const allSkins = [...new Set(data.map(d => String(d.skin_type)))];

  const agesByCluster = clusters.map(c => countBy(data.filter(d => Number(d.cluster) === c).map(d => String(d.age))));
  const allAges = [...new Set(data.map(d => String(d.age)))].sort();

  // Common options
  const grid = { color: gridColor };
  const xAxis = { ticks: { color: textColor }, grid: { display: false } };
  const yAxis = { ticks: { color: mutedColor }, grid };

  // Static Silhouette Score (based on Python script output)
  const silhouetteScore = "0.26"; 

  return (
    <div className="usv">
      {/* Header */}
      <div className="usv-header pt-8">
        <h2>Customer Segmentation Dashboard</h2>
        <p>Unsupervised Learning Insights • วิเคราะห์พฤติกรรมลูกค้า</p>
      </div>

      {/* KPIs */}
      <div className="usv-stats">
        <div className="usv-stat">
          <span className="usv-num">{total}</span>
          Total Customers
        </div>
        <div className="usv-stat">
          <span className="usv-num c-indigo">{kNum}</span>
          จำนวน Clusters
        </div>
        <div className="usv-stat">
          <span className="usv-num c-green">{maxClusterPct}%</span>
          ขนาด Cluster ที่ใหญ่ที่สุด
        </div>
        <div className="usv-stat">
          <span className="usv-num c-yellow">{silhouetteScore}</span>
          Silhouette Score
        </div>
      </div>

      {/* Cluster Dist */}
      <div className="usv-row-2">
        <div className="usv-card">
          <h4>การกระจายตัวของลูกค้า (Distribution)</h4>
          <div className="usv-chart">
            <Bar
              data={{
                labels: clusterNames,
                datasets: [{
                  label: "จำนวนลูกค้า",
                  data: clusterCounts,
                  backgroundColor: clusterColors.slice(0, kNum),
                  borderRadius: 6,
                }]
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: xAxis, y: yAxis }
              }}
            />
          </div>
        </div>
        <div className="usv-card">
          <h4>สัดส่วนของแต่ละ Cluster (%)</h4>
          <div className="usv-chart">
            <Doughnut
              data={{
                labels: clusterNames,
                datasets: [{
                  data: clusterCounts,
                  backgroundColor: clusterColors.slice(0, kNum),
                  borderWidth: 0
                }]
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                cutout: "60%",
                plugins: { legend: { position: "right", labels: { color: textColor } } }
              }}
            />
          </div>
        </div>
      </div>

      {/* PCA Scatter Plot */}
      <div className="usv-card">
        <h4>การจับกลุ่มลูกค้า (PCA 2D Projection)</h4>
        <p className="usv-sub">การกระจายตัวของข้อมูลหลังทำ Dimensionality Reduction</p>
        <div className="usv-chart usv-chart-lg">
          <Scatter
            data={{
              datasets: clusters.map((c, i) => ({
                label: clusterNames[c],
                data: data.filter(d => Number(d.cluster) === c).map(d => ({ x: Number(d.pca1), y: Number(d.pca2) })),
                backgroundColor: clusterColors[i] + "cc",
                borderColor: clusterColors[i],
                pointRadius: 4,
                pointHoverRadius: 6,
              }))
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { labels: { color: textColor } } },
              scales: { x: xAxis, y: yAxis }
            }}
          />
        </div>
      </div>

      {/* Heatmap */}
      <h3 className="usv-section">📊 Factor Analysis by Cluster</h3>
      <div className="usv-card">
        <h4>ค่าเฉลี่ยปัจจัยการตัดสินใจของแต่ละกลุ่ม (1-5)</h4>
        <Heatmap
          labels={factors}
          yLabels={clusterNames}
          values={hmValues}
        />
      </div>

      {/* Personas */}
      <h3 className="usv-section">🎯 Customer Personas</h3>
      <div className="usv-row-3">
        {clusters.map((c, i) => {
          const cData = data.filter(d => Number(d.cluster) === c);
          const topSkin = Object.entries(countBy(cData.map(d => String(d.skin_type)))).sort((a,b)=>b[1]-a[1])[0]?.[0] || "-";
          const topAge = Object.entries(countBy(cData.map(d => String(d.age)))).sort((a,b)=>b[1]-a[1])[0]?.[0] || "-";
          
          const pVals = hmValues[i];
          const sortedFactors = [...factors].map((f, idx) => ({ f, v: pVals[idx] })).sort((a,b) => b.v - a.v);
          const topFactor = sortedFactors[0]?.f.replace("factor_", "").replaceAll("_", " ");

          let icon = "👥";
          let insight = "";
          let title = clusterNames[c];
          
          if (title.includes("อ่อนโยน")) {
            icon = "🌿";
            insight = "กลุ่มนี้ให้ความสำคัญกับความอ่อนโยน และไม่ก่อให้เกิดอาการแพ้เป็นหลัก มองหาผลิตภัณฑ์ที่ปลอดภัยต่อผิว ไม่ระคายเคือง";
          } else if (title.includes("ทำความสะอาด")) {
            icon = "🧼";
            insight = "กลุ่มนี้เน้นประสิทธิภาพการทำความสะอาดอย่างล้ำลึก เพื่อจัดการคราบเครื่องสำอางและสิ่งสกปรกให้หมดจดอย่างรวดเร็ว";
          } else if (title.includes("ปัญหาผิวและสิว")) {
            icon = "🩺";
            insight = "กลุ่มนี้มุ่งเน้นการดูแลปัญหาผิว เช่น สิว หรือผิวมัน ต้องการผลิตภัณฑ์ที่มีส่วนช่วยลดปัญหาผิวเฉพาะจุด";
          }

          return (
            <div key={c} className="persona-card">
              <div className="persona-badge" style={{ backgroundColor: clusterColors[i] }}>Cluster {c}</div>
              <h3 className="persona-title" style={{ fontSize: "16px" }}>{icon} {title}</h3>
              
              <div className="persona-metrics">
                <div className="metric-row">
                  <div className="metric-icon">⭐</div>
                  <div className="metric-content">
                    <div className="metric-label">Top Factor</div>
                    <div className="metric-value capitalize">{topFactor}</div>
                  </div>
                </div>
                <div className="metric-row">
                  <div className="metric-icon">👤</div>
                  <div className="metric-content">
                    <div className="metric-label">Majority Skin Type</div>
                    <div className="metric-value">{topSkin}</div>
                  </div>
                </div>
                <div className="metric-row">
                  <div className="metric-icon">🎂</div>
                  <div className="metric-content">
                    <div className="metric-label">Age Group</div>
                    <div className="metric-value">{topAge}</div>
                  </div>
                </div>
              </div>
              <div className="persona-insight">{insight}</div>
            </div>
          );
        })}
      </div>

      {/* Demographics Breakdown */}
      <h3 className="usv-section">👥 Demographic Breakdown</h3>
      <div className="usv-row-2">
        <div className="usv-card">
          <h4>Skin Type by Cluster</h4>
          <div className="usv-chart">
            <Bar
              data={{
                labels: allSkins,
                datasets: clusters.map((c, i) => ({
                  label: clusterNames[c],
                  data: allSkins.map(s => skinsByCluster[c][s] || 0),
                  backgroundColor: clusterColors[i],
                  borderRadius: 2,
                }))
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                scales: { x: xAxis, y: { stacked: true, ...yAxis } }
              }}
            />
          </div>
        </div>
        <div className="usv-card">
          <h4>Age Group by Cluster</h4>
          <div className="usv-chart">
            <Bar
              data={{
                labels: allAges,
                datasets: clusters.map((c, i) => ({
                  label: clusterNames[c],
                  data: allAges.map(a => agesByCluster[c][a] || 0),
                  backgroundColor: clusterColors[i],
                  borderRadius: 2,
                }))
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                scales: { x: xAxis, y: { stacked: true, ...yAxis } }
              }}
            />
          </div>
        </div>
      </div>

      {/* Business Recommendation */}
      <h3 className="usv-section">💼 Business Recommendations</h3>

      {clusters.map((c, i) => {
        let title = clusterNames[c];
        let icon = "💡";
        let recs = [];
        
        if (title.includes("อ่อนโยน")) {
          icon = "🌿";
          recs = [
            "- <strong>Product:</strong> พัฒนาสูตรที่ปราศจากแอลกอฮอล์ น้ำหอม และพาราเบน (Clean Beauty)",
            "- <strong>Trust:</strong> ใช้ Dermatologist Tested เพื่อสร้างความน่าเชื่อถือ",
            "- <strong>Marketing:</strong> ร่วมงานกับ Micro-Influencer ที่มีปัญหาผิวแพ้ง่ายจริง เพื่อรีวิวผลลัพธ์อย่างจริงใจ"
          ];
        } else if (title.includes("ทำความสะอาด")) {
          icon = "🧼";
          recs = [
            "- <strong>Product:</strong> เน้นโชว์ประสิทธิภาพ Deep Cleansing เช็ดออกง่าย ไม่ทิ้งคราบ",
            "- <strong>Marketing:</strong> ทำคลิปรีวิวเปรียบเทียบประสิทธิภาพการเช็ดเครื่องสำอางกันน้ำ (Waterproof)",
            "- <strong>Promotion:</strong> จัดเซ็ตสุดคุ้ม คู่กับสำลี เพื่อดึงดูดผู้ใช้เป็นประจำ"
          ];
        } else if (title.includes("ปัญหาผิวและสิว")) {
          icon = "🩺";
          recs = [
            "- <strong>Product:</strong> ชูจุดเด่นเรื่องส่วนผสมที่ช่วยลดสิว หรือควบคุมความมัน เช่น Tea Tree, BHA",
            "- <strong>Experience:</strong> ให้บริการปรึกษาปัญหาผิวแบบ Exclusive หรือให้ความรู้การรักษาสิว",
            "- <strong>Marketing:</strong> นำเสนอ Before/After จากผู้ใช้จริงที่มีปัญหาสิว"
          ];
        } else {
          recs = ["- วิเคราะห์เพิ่มเติมเพื่อหากลยุทธ์ที่เหมาะสม"];
        }

        return (
          <div key={c} className="biz-rec-card">
            <div className="biz-rec-cluster" style={{ background: clusterColors[i] }}>
              <span>Cluster {c}</span>
              {icon}
            </div>
            <div className="biz-rec-content">
              <h4>กลยุทธ์สำหรับ "{title}"</h4>
              <p dangerouslySetInnerHTML={{ __html: recs.join('<br />') }} />
            </div>
          </div>
        );
      })}

      <p className="usv-footer"> วิเคราะห์พฤติกรรมลูกค้า • Unsupervised Learning</p>
    </div>
  );
}
