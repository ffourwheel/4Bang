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
    const cellW = Math.min(50, (ref.current.width - 150) / cols);
    const cellH = Math.min(40, (ref.current.height - 80) / rows);
    const sx = 100, sy = 20;
    ctx.clearRect(0, 0, ref.current.width, ref.current.height);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const v = values[i][j];
        ctx.fillStyle = heatColor(v);
        ctx.fillRect(sx + j * cellW, sy + i * cellH, cellW - 2, cellH - 2);

        // Text color contrast
        ctx.fillStyle = v > 3.5 || v < 2.0 ? "#fff" : "#111";
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
      ctx.fillText(l, sx - 10, sy + i * cellH + cellH / 2);
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

  return <canvas ref={ref} width={680} height={320} style={{ width: "100%", maxWidth: 680, margin: "0 auto", display: "block" }} />;
}

// ========== Dummy Data Generator ==========
type UnsupervisedRow = {
  id: number;
  cluster: number;
  factor_price: number;
  factor_ingredients: number;
  factor_brand: number;
  factor_packaging: number;
  factor_reviews: number;
  skin_type: string;
  age: string;
  pca1: number;
  pca2: number;
};

function generateDummyData(n = 600): UnsupervisedRow[] {
  const data: UnsupervisedRow[] = [];
  const skinTypes = ["Normal", "Dry", "Oily", "Combination", "Sensitive"];
  const ages = ["18-24", "25-34", "35-44", "45+"];

  for (let i = 0; i < n; i++) {
    const r = Math.random();
    let cluster = 0;
    if (r > 0.35) cluster = 1;
    if (r > 0.75) cluster = 2;

    let f_price, f_ing, f_brand, f_pack, f_rev;
    let skin, age;
    let p1, p2;

    // Simulate persona logic
    if (cluster === 0) {
      // สายประหยัด (Budget)
      f_price = 4.5 + Math.random() * 0.5;
      f_ing = 2.0 + Math.random() * 2;
      f_brand = 1.0 + Math.random() * 2;
      f_pack = 2.0 + Math.random() * 2;
      f_rev = 3.0 + Math.random() * 2;
      skin = skinTypes[Math.floor(Math.random() * 4)]; // Not usually sensitive
      age = ages[Math.floor(Math.random() * 2)]; // 18-34
      p1 = -2 + Math.random() * 1.5;
      p2 = -1 + Math.random() * 2;
    } else if (cluster === 1) {
      // สายผิวแพ้ง่าย (Sensitive & Ingredients)
      f_price = 2.5 + Math.random() * 2;
      f_ing = 4.0 + Math.random() * 1;
      f_brand = 3.0 + Math.random() * 1.5;
      f_pack = 2.5 + Math.random() * 2;
      f_rev = 4.0 + Math.random() * 1;
      skin = "Sensitive";
      if (Math.random() > 0.6) skin = "Combination";
      age = ages[1 + Math.floor(Math.random() * 2)]; // 25-44
      p1 = 1 + Math.random() * 1.5;
      p2 = -1.5 + Math.random() * 1.5;
    } else {
      // สายแบรนด์ (Premium Brand)
      f_price = 1.0 + Math.random() * 2;
      f_ing = 3.0 + Math.random() * 1.5;
      f_brand = 4.5 + Math.random() * 0.5;
      f_pack = 4.0 + Math.random() * 1;
      f_rev = 3.5 + Math.random() * 1.5;
      skin = skinTypes[Math.floor(Math.random() * 5)];
      age = ages[2 + Math.floor(Math.random() * 2)]; // 35-45+
      p1 = 0 + Math.random() * 2;
      p2 = 1.5 + Math.random() * 1.5;
    }

    data.push({
      id: i, cluster,
      factor_price: f_price, factor_ingredients: f_ing,
      factor_brand: f_brand, factor_packaging: f_pack, factor_reviews: f_rev,
      skin_type: skin, age,
      pca1: p1, pca2: p2
    });
  }
  return data;
}

// ========== Type & Colors ==========
const clusterColors = ["#f59e0b", "#10b981", "#6366f1", "#ef4444", "#8b5cf6"];
const gridColor = "#ffffff10";
const textColor = "#ccc";
const mutedColor = "#999";

const clusterNames = ["กลุ่มที่ 0: สายประหยัด", "กลุ่มที่ 1: สายผิวแพ้ง่าย", "กลุ่มที่ 2: สายแบรนด์"];

export default function Unsupervise() {
  const [data, setData] = useState<UnsupervisedRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API Fetch
    setTimeout(() => {
      setData(generateDummyData(600));
      setLoading(false);
    }, 600);
  }, []);

  if (loading) return <div className="usv-center" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spinner" style={{ width: 36, height: 36, border: "3px solid #333", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 1s linear infinite" }} /></div>;

  const total = data.length;
  const clusters = [...new Set(data.map(d => d.cluster))].sort();
  const kNum = clusters.length;

  const clusterCounts = clusters.map(c => data.filter(d => d.cluster === c).length);
  const maxClusterSize = Math.max(...clusterCounts);
  const maxClusterPct = ((maxClusterSize / total) * 100).toFixed(1);

  // Factors Analysis
  const factors = ["factor_price", "factor_ingredients", "factor_brand", "factor_packaging", "factor_reviews"];
  const hmValues = clusters.map(c => {
    const cData = data.filter(d => d.cluster === c);
    return factors.map(f => avg(cData.map((d: any) => d[f])));
  });

  // Demographics
  const skinsByCluster = clusters.map(c => countBy(data.filter(d => d.cluster === c).map(d => d.skin_type)));
  const allSkins = [...new Set(data.map(d => d.skin_type))];

  const agesByCluster = clusters.map(c => countBy(data.filter(d => d.cluster === c).map(d => d.age)));
  const allAges = [...new Set(data.map(d => d.age))].sort();

  // Common options
  const grid = { color: gridColor };
  const xAxis = { ticks: { color: textColor }, grid: { display: false } };
  const yAxis = { ticks: { color: mutedColor }, grid };

  return (
    <div className="usv">
      {/* Header */}
      <div className="usv-header">
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
          <span className="usv-num c-yellow">0.58</span>
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
                data: data.filter(d => d.cluster === c).map(d => ({ x: d.pca1, y: d.pca2 })),
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
          yLabels={clusterNames.map(n => n.split(":")[0])}
          values={hmValues}
        />
      </div>

      {/* Personas */}
      <h3 className="usv-section">🎯 Customer Personas</h3>
      <div className="usv-row-3">
        {/* Persona 0 */}
        <div className="persona-card">
          <div className="persona-badge" style={{ backgroundColor: clusterColors[0] }}>Cluster 0</div>
          <h3 className="persona-title">🛍️ สายประหยัด</h3>

          <div className="persona-metrics">
            <div className="metric-row">
              <div className="metric-icon">⭐</div>
              <div className="metric-content">
                <div className="metric-label">Top Factor</div>
                <div className="metric-value">Price (ราคาถูก)</div>
              </div>
            </div>
            <div className="metric-row">
              <div className="metric-icon">👤</div>
              <div className="metric-content">
                <div className="metric-label">Majority Skin Type</div>
                <div className="metric-value">Normal / Oily</div>
              </div>
            </div>
            <div className="metric-row">
              <div className="metric-icon">🎂</div>
              <div className="metric-content">
                <div className="metric-label">Age Group</div>
                <div className="metric-value">18 - 34 ปี</div>
              </div>
            </div>
          </div>
          <div className="persona-insight">
            วัยรุ่นและนักศึกษาที่มองหาความคุ้มค่าเป็นหลัก ไม่ได้ยึดติดกับแบรนด์ แต่ตัดสินใจจากราคา
          </div>
        </div>

        {/* Persona 1 */}
        <div className="persona-card">
          <div className="persona-badge" style={{ backgroundColor: clusterColors[1] }}>Cluster 1</div>
          <h3 className="persona-title">🌿 สายผิวแพ้ง่าย</h3>

          <div className="persona-metrics">
            <div className="metric-row">
              <div className="metric-icon">⭐</div>
              <div className="metric-content">
                <div className="metric-label">Top Factor</div>
                <div className="metric-value">Ingredients (ส่วนผสมปลอดภัย)</div>
              </div>
            </div>
            <div className="metric-row">
              <div className="metric-icon">👤</div>
              <div className="metric-content">
                <div className="metric-label">Majority Skin Type</div>
                <div className="metric-value">Sensitive</div>
              </div>
            </div>
            <div className="metric-row">
              <div className="metric-icon">🎂</div>
              <div className="metric-content">
                <div className="metric-label">Age Group</div>
                <div className="metric-value">25 - 44 ปี</div>
              </div>
            </div>
          </div>
          <div className="persona-insight">
            กลุ่มคนวัยทำงานที่มีปัญหาผิวแพ้ง่าย อ่านฉลากอย่างละเอียดและให้ความสำคัญกับรีวิวจากผู้ใช้จริง
          </div>
        </div>

        {/* Persona 2 */}
        <div className="persona-card">
          <div className="persona-badge" style={{ backgroundColor: clusterColors[2] }}>Cluster 2</div>
          <h3 className="persona-title">💎 สายแบรนด์</h3>

          <div className="persona-metrics">
            <div className="metric-row">
              <div className="metric-icon">⭐</div>
              <div className="metric-content">
                <div className="metric-label">Top Factor</div>
                <div className="metric-value">Brand & Packaging</div>
              </div>
            </div>
            <div className="metric-row">
              <div className="metric-icon">👤</div>
              <div className="metric-content">
                <div className="metric-label">Majority Skin Type</div>
                <div className="metric-value">All Types (Mixed)</div>
              </div>
            </div>
            <div className="metric-row">
              <div className="metric-icon">🎂</div>
              <div className="metric-content">
                <div className="metric-label">Age Group</div>
                <div className="metric-value">35+ ปี</div>
              </div>
            </div>
          </div>
          <div className="persona-insight">
            กลุ่มที่มีกำลังซื้อสูง ชอบความพรีเมียมและภาพลักษณ์แบรนด์ที่ดูน่าเชื่อถือ รวมถึงแพ็คเกจจิ้งที่สวยงาม
          </div>
        </div>
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
                  label: `Cluster ${c}`,
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
                  label: `Cluster ${c}`,
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

      <div className="biz-rec-card">
        <div className="biz-rec-cluster" style={{ background: clusterColors[0] }}>
          <span>Cluster 0</span>
          🛍️
        </div>
        <div className="biz-rec-content">
          <h4>กลยุทธ์สำหรับ "สายประหยัด"</h4>
          <p>
            - <strong>Promotion:</strong> จัดโปรโมชั่น 1 แถม 1 หรือลดราคาช่วง Flash Sale <br />
            - <strong>Product:</strong> เน้นสินค้าขนาดพกพา (Travel Size) หรือแบบซอง เพื่อให้ตัดสินใจซื้อง่าย<br />
            - <strong>Marketing:</strong> โฆษณาผ่าน Tiktok ด้วยคอนเทนต์ที่เน้น "ถูกและดี"
          </p>
        </div>
      </div>

      <div className="biz-rec-card">
        <div className="biz-rec-cluster" style={{ background: clusterColors[1] }}>
          <span>Cluster 1</span>
          🌿
        </div>
        <div className="biz-rec-content">
          <h4>กลยุทธ์สำหรับ "สายผิวแพ้ง่าย"</h4>
          <p>
            - <strong>Product:</strong> พัฒนาสูตรที่ปราศจากแอลกอฮอล์ น้ำหอม และพาราเบน (Clean Beauty)<br />
            - <strong>Trust:</strong> ใช้ Dermatologist Tested เพื่อสร้างความน่าเชื่อถือ<br />
            - <strong>Marketing:</strong> ร่วมงานกับ Micro-Influencer ที่มีปัญหาผิวจริง เพื่อรีวิวผลลัพธ์อย่างจริงใจ
          </p>
        </div>
      </div>

      <div className="biz-rec-card">
        <div className="biz-rec-cluster" style={{ background: clusterColors[2] }}>
          <span>Cluster 2</span>
          💎
        </div>
        <div className="biz-rec-content">
          <h4>กลยุทธ์สำหรับ "สายแบรนด์"</h4>
          <p>
            - <strong>Product:</strong> อัปเกรดแพ็คเกจจิ้งให้ดูหรูหรา และใช้นวัตกรรมส่วนผสมที่หาได้ยาก<br />
            - <strong>Experience:</strong> ให้บริการปรึกษาปัญหาผิวแบบ Exclusive หรือระบบสมาชิก (Loyalty Program)<br />
            - <strong>Marketing:</strong> เลือกใช้ Presenter ระดับ A-List หรือการโฆษณาในห้างสรรพสินค้าชั้นนำ
          </p>
        </div>
      </div>

      <p className="usv-footer"> วิเคราะห์พฤติกรรมลูกค้า • Unsupervised Learning</p>
    </div>
  );
}
