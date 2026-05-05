import { useState, useMemo, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  ScatterChart, Scatter, ZAxis, LabelList,
} from "recharts";

// ═══ رابط Google Apps Script ═══
const DATA_URL = "https://script.google.com/macros/s/AKfycbyCO5oEst4a_gBhSQKsjQBGlzWXWz3_pVZv8UXtODRmSk_m7QrHN5HajHG4wgcLdOIxxA/exec";

const TEAL = "#0D9488";
const COLORS_PIE = ["#0D9488","#6366F1","#F59E0B","#EF4444","#0369A1","#EC4899","#8B5CF6","#10B981"];

const PLATFORM_LIST = [
  { id: "إثرائي", color: "#0D9488", type: "محلية" },
  { id: "دروب", color: "#14B8A6", type: "محلية" },
  { id: "رواق", color: "#2DD4BF", type: "محلية" },
  { id: "إدراك", color: "#5EEAD4", type: "محلية" },
  { id: "مسك", color: "#99F6E4", type: "محلية" },
  { id: "Coursera", color: "#0369A1", type: "عالمية" },
  { id: "Udemy", color: "#6366F1", type: "عالمية" },
  { id: "LinkedIn Learning", color: "#0A66C2", type: "عالمية" },
  { id: "edX", color: "#7C3AED", type: "عالمية" },
];

export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // ═══ جلب البيانات من Google Sheets ═══
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(DATA_URL);
      const json = await res.json();
      if (json.success) {
        setRawData(json.data || []);
        setLastUpdate(new Date());
      } else {
        setError("حصل خطأ في جلب البيانات");
      }
    } catch (err) {
      setError("تعذر الاتصال بقاعدة البيانات — تأكد من رابط الـ Web App");
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const total = rawData.length;

  // ═══ تحليل: وعي المنصات ═══
  const awareness = useMemo(() => {
    const counts = {};
    PLATFORM_LIST.forEach(p => { counts[p.id] = 0; });
    rawData.forEach(row => {
      const platforms = (row["المنصات المعروفة"] || "").split("،");
      platforms.forEach(name => {
        const trimmed = name.trim();
        if (counts[trimmed] !== undefined) counts[trimmed]++;
      });
    });
    return PLATFORM_LIST
      .map(p => ({ name: p.id, value: counts[p.id], pct: total > 0 ? Math.round((counts[p.id] / total) * 100) : 0, color: p.color, type: p.type }))
      .sort((a, b) => b.value - a.value);
  }, [rawData]);

  // ═══ تحليل: القطاعات ═══
  const sectors = useMemo(() => {
    const counts = {};
    rawData.forEach(row => {
      const s = row["القطاع"] || "غير محدد";
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, pct: total > 0 ? Math.round((value / total) * 100) : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [rawData]);

  // ═══ تحليل: الاستعداد للدفع ═══
  const monthly = useMemo(() => {
    const order = ["0 ريال — لا أنوي الدفع", "1 – 30 ريال", "31 – 60 ريال", "61 – 100 ريال", "101 – 150 ريال", "أكثر من 150 ريال"];
    const labels = ["0 ر.س", "1-30", "31-60", "61-100", "101-150", "+150"];
    const counts = {};
    order.forEach(o => { counts[o] = 0; });
    rawData.forEach(row => {
      const val = row["الحد الشهري للاشتراك"] || "";
      if (counts[val] !== undefined) counts[val]++;
    });
    return order.map((o, i) => ({ name: labels[i], value: counts[o], pct: total > 0 ? Math.round((counts[o] / total) * 100) : 0 }));
  }, [rawData]);

  // ═══ تحليل: نمط الاستخدام ═══
  const patterns = useMemo(() => {
    const counts = {};
    rawData.forEach(row => {
      const p = row["نمط الاستخدام"] || "غير محدد";
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, pct: total > 0 ? Math.round((value / total) * 100) : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [rawData]);

  // ═══ تحليل: عوامل القرار ═══
  const factors = useMemo(() => {
    const counts = {};
    rawData.forEach(row => {
      const f = row["عامل القرار"] || "غير محدد";
      counts[f] = (counts[f] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, pct: total > 0 ? Math.round((value / total) * 100) : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [rawData]);

  // ═══ تحليل: المنصة المفضلة ═══
  const favorites = useMemo(() => {
    const counts = {};
    rawData.forEach(row => {
      const f = row["المنصة المفضلة"] || "";
      if (f) counts[f] = (counts[f] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, pct: total > 0 ? Math.round((value / total) * 100) : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [rawData]);

  // ═══ تحليل: الخريطة الإدراكية ═══
  const perceptualMap = useMemo(() => {
    const stats = {};
    PLATFORM_LIST.forEach(p => { stats[p.id] = { qSum: 0, qN: 0, pSum: 0, pN: 0 }; });
    rawData.forEach(row => {
      PLATFORM_LIST.forEach(p => {
        const qVal = row["جودة: " + p.id];
        const pVal = row["سعر: " + p.id];
        if (qVal && qVal !== "" && Number(qVal) > 0) { stats[p.id].qSum += Number(qVal); stats[p.id].qN++; }
        if (pVal && pVal !== "" && Number(pVal) > 0) { stats[p.id].pSum += Number(pVal); stats[p.id].pN++; }
      });
    });
    return PLATFORM_LIST
      .filter(p => stats[p.id].qN >= 1)
      .map(p => ({
        name: p.id,
        quality: +(stats[p.id].qSum / stats[p.id].qN).toFixed(2),
        price: +(stats[p.id].pSum / stats[p.id].pN).toFixed(2),
        n: stats[p.id].qN,
        color: p.color,
        type: p.type,
      }));
  }, [rawData]);

  // ═══ تحليل: إثرائي والترقية ═══
  const ithraaPromo = useMemo(() => {
    let yes = 0, no = 0;
    rawData.forEach(row => {
      const val = row["إثرائي: بسبب الترقية؟"];
      if (val === "نعم") yes++;
      else if (val === "لا") no++;
    });
    return { yes, no, total: yes + no };
  }, [rawData]);

  // ═══ إحصائيات سريعة ═══
  const topPlatform = awareness[0]?.name || "—";
  const topMonthly = monthly.reduce((a, b) => a.value > b.value ? a : b, { name: "—" }).name;
  const payingPct = total > 0 ? Math.round((rawData.filter(r => {
    const p = r["نمط الاستخدام"] || "";
    return !p.includes("المجاني فقط");
  }).length / total) * 100) : 0;

  // ═══════════════════════════
  // المكونات الداخلية
  // ═══════════════════════════

  const StatCard = ({ label, value, sub, accent }) => (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "20px 18px",
      border: "1px solid #E5E7EB", flex: "1 1 140px", minWidth: 140,
      borderTop: "4px solid " + (accent || TEAL),
    }}>
      <p style={{ fontSize: 12, color: "#6B7280", margin: "0 0 6px", fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: "0 0 2px" }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>{sub}</p>}
    </div>
  );

  const SectionTitle = ({ icon, text }) => (
    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "28px 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 20 }}>{icon}</span> {text}
    </h3>
  );

  const ChartCard = ({ children, style = {} }) => (
    <div style={{ background: "#fff", borderRadius: 16, padding: "20px 16px", border: "1px solid #E5E7EB", marginBottom: 16, ...style }}>
      {children}
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "#1F2937", color: "#fff", padding: "8px 14px", borderRadius: 10, fontSize: 12, direction: "rtl" }}>
        <p style={{ margin: 0, fontWeight: 700 }}>{label || payload[0]?.name}</p>
        <p style={{ margin: "4px 0 0" }}>{payload[0]?.value} {total > 0 ? "(" + Math.round((payload[0]?.value / total) * 100) + "%)" : ""}</p>
      </div>
    );
  };

  const TABS = [
    { id: "overview", label: "نظرة عامة", icon: "📊" },
    { id: "platforms", label: "المنصات", icon: "🏆" },
    { id: "perceptual", label: "الخريطة الإدراكية", icon: "🗺️" },
  ];

  // ═══ حالة التحميل ═══
  if (loading) {
    return (
      <div style={{ direction: "rtl", fontFamily: "'Tajawal','Segoe UI',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#F8FAFB" }}>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: "spin 1s linear infinite" }}>📊</div>
          <p style={{ fontSize: 16, color: "#6B7280", fontWeight: 600 }}>جاري تحميل البيانات...</p>
          <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </div>
      </div>
    );
  }

  // ═══ حالة الخطأ ═══
  if (error) {
    return (
      <div style={{ direction: "rtl", fontFamily: "'Tajawal','Segoe UI',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#F8FAFB" }}>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center", maxWidth: 400, padding: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <p style={{ fontSize: 16, color: "#EF4444", fontWeight: 700, marginBottom: 8 }}>تعذر تحميل البيانات</p>
          <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.7, marginBottom: 16 }}>{error}</p>
          <button onClick={fetchData} style={{
            padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600,
            border: "none", background: TEAL, color: "#fff", cursor: "pointer", fontFamily: "inherit",
          }}>إعادة المحاولة</button>
        </div>
      </div>
    );
  }

  // ═══ لا توجد بيانات ═══
  if (total === 0) {
    return (
      <div style={{ direction: "rtl", fontFamily: "'Tajawal','Segoe UI',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#F8FAFB" }}>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center", maxWidth: 400, padding: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <p style={{ fontSize: 18, color: "#111827", fontWeight: 700, marginBottom: 8 }}>لا توجد إجابات بعد</p>
          <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.7 }}>شارك رابط الاستبانة وارجع هنا لتشوف النتائج</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════
  // الواجهة الرئيسية
  // ═══════════════════════════
  return (
    <div style={{ direction: "rtl", fontFamily: "'Tajawal','Segoe UI',sans-serif", maxWidth: 720, margin: "0 auto", padding: "0 12px 40px", minHeight: "100vh", background: "#F8FAFB" }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />

      {/* الهيدر */}
      <div style={{ textAlign: "center", padding: "28px 0 20px" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, margin: "0 auto 12px",
          background: "linear-gradient(135deg, " + TEAL + ", #14B8A6)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#fff",
        }}>📊</div>
        <h1 style={{ fontSize: 21, fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>نتائج استبانة منصات التعلم</h1>
        <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 8px" }}>
          إجمالي {total} مستجيب
          {lastUpdate && <span> • آخر تحديث: {lastUpdate.toLocaleTimeString("ar-SA")}</span>}
        </p>
        <button onClick={fetchData} style={{
          padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
          border: "1.5px solid #E5E7EB", background: "#fff", color: "#6B7280",
          cursor: "pointer", fontFamily: "inherit",
        }}>🔄 تحديث البيانات</button>
      </div>

      {/* التبويبات */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", padding: "2px 0" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            border: "none", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
            background: tab === t.id ? TEAL : "#fff",
            color: tab === t.id ? "#fff" : "#6B7280",
            boxShadow: tab === t.id ? "0 2px 8px rgba(13,148,136,0.3)" : "0 1px 3px rgba(0,0,0,0.06)",
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* ═══════════ نظرة عامة ═══════════ */}
      {tab === "overview" && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <StatCard label="إجمالي المستجيبين" value={total} accent={TEAL} />
            <StatCard label="الأكثر معرفة" value={topPlatform} accent="#6366F1" />
            <StatCard label="الفئة السعرية" value={topMonthly} accent="#F59E0B" />
            <StatCard label="يدفعون" value={payingPct + "%"} accent="#EF4444" />
          </div>

          <SectionTitle icon="🏢" text="توزيع القطاعات الوظيفية" />
          <ChartCard>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={sectors} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="value" paddingAngle={3} stroke="none">
                  {sectors.map((s, i) => <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ fontSize: 11, color: "#374151" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <SectionTitle icon="💰" text="الاستعداد للدفع الشهري" />
          <ChartCard>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly} margin={{ right: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill={TEAL} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <SectionTitle icon="📱" text="نمط استخدام المنصات" />
          <ChartCard>
            {patterns.map((p, i) => (
              <div key={i} style={{ marginBottom: i < patterns.length - 1 ? 12 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{p.name}</span>
                  <span style={{ fontSize: 13, color: TEAL, fontWeight: 700 }}>{p.pct}%</span>
                </div>
                <div style={{ height: 10, background: "#F3F4F6", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: p.pct + "%", background: "linear-gradient(90deg, " + TEAL + ", #14B8A6)", borderRadius: 8 }} />
                </div>
              </div>
            ))}
          </ChartCard>

          <SectionTitle icon="⚖️" text="أهم عامل في اختيار المنصة" />
          <ChartCard>
            {factors.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < factors.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, background: COLORS_PIE[i % COLORS_PIE.length],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0,
                }}>{i + 1}</div>
                <span style={{ fontSize: 13, color: "#374151", flex: 1 }}>{f.name}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{f.pct}%</span>
              </div>
            ))}
          </ChartCard>
        </>
      )}

      {/* ═══════════ المنصات ═══════════ */}
      {tab === "platforms" && (
        <>
          <SectionTitle icon="📢" text="وعي المنصات — % يعرفونها" />
          <ChartCard>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={awareness} layout="vertical" margin={{ right: 40, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#6B7280" }} domain={[0, total]} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: "#374151", fontWeight: 600 }} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {awareness.map((a, i) => <Cell key={i} fill={a.color} />)}
                  <LabelList dataKey="pct" position="right" formatter={v => v + "%"} style={{ fontSize: 11, fill: "#6B7280", fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <SectionTitle icon="❤️" text="المنصة المفضلة" />
          <ChartCard>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={favorites} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" paddingAngle={3} stroke="none">
                  {favorites.map((f, i) => {
                    const pm = PLATFORM_LIST.find(p => p.id === f.name);
                    return <Cell key={i} fill={pm?.color || COLORS_PIE[i % COLORS_PIE.length]} />;
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ fontSize: 12, color: "#374151" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
            {/* النسب تحت الرسم */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 8 }}>
              {favorites.map((f, i) => {
                const pm = PLATFORM_LIST.find(p => p.id === f.name);
                return (
                  <div key={i} style={{ padding: "6px 12px", borderRadius: 8, background: "#F9FAFB", textAlign: "center" }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: pm?.color || TEAL }}>{f.pct}%</span>
                    <span style={{ fontSize: 11, color: "#6B7280", marginRight: 4 }}> {f.name}</span>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          {ithraaPromo.total > 0 && (
            <>
              <SectionTitle icon="📈" text="إثرائي: الاستخدام بسبب الترقية" />
              <ChartCard>
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <div style={{ textAlign: "center", flex: 1, padding: 14, borderRadius: 12, background: "#F0FDF4" }}>
                    <p style={{ fontSize: 28, fontWeight: 800, color: "#059669", margin: 0 }}>
                      {ithraaPromo.total > 0 ? Math.round((ithraaPromo.yes / ithraaPromo.total) * 100) : 0}%
                    </p>
                    <p style={{ fontSize: 11, color: "#6B7280", margin: "4px 0 0" }}>نعم، بسبب الترقية</p>
                  </div>
                  <div style={{ textAlign: "center", flex: 1, padding: 14, borderRadius: 12, background: "#FEF2F2" }}>
                    <p style={{ fontSize: 28, fontWeight: 800, color: "#EF4444", margin: 0 }}>
                      {ithraaPromo.total > 0 ? Math.round((ithraaPromo.no / ithraaPromo.total) * 100) : 0}%
                    </p>
                    <p style={{ fontSize: 11, color: "#6B7280", margin: "4px 0 0" }}>لا، لسبب آخر</p>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0, textAlign: "center" }}>من أصل {ithraaPromo.total} مستخدم لإثرائي</p>
              </ChartCard>
            </>
          )}
        </>
      )}

      {/* ═══════════ الخريطة الإدراكية ═══════════ */}
      {tab === "perceptual" && (
        <>
          <SectionTitle icon="🗺️" text="الخريطة الإدراكية" />
          <p style={{ fontSize: 13, color: "#6B7280", margin: "-8px 0 14px", lineHeight: 1.7 }}>
            كل نقطة = منصة. الأفقي = جودة المحتوى (يمين أفضل). العمودي = حساسية السعر (فوق = السعر يمنع أكثر).
          </p>

          {perceptualMap.length < 2 ? (
            <ChartCard style={{ textAlign: "center", padding: 40 }}>
              <p style={{ fontSize: 14, color: "#6B7280" }}>تحتاج تقييمات أكثر لعرض الخريطة الإدراكية</p>
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>اجمع ردود إضافية وارجع هنا</p>
            </ChartCard>
          ) : (
            <ChartCard style={{ padding: "16px 8px" }}>
              <ResponsiveContainer width="100%" height={360}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" dataKey="quality" name="الجودة" domain={[0.5, 5.5]}
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    label={{ value: "← جودة أقل    الجودة المدركة    جودة أعلى →", position: "bottom", offset: 0, style: { fontSize: 11, fill: "#9CA3AF" } }}
                  />
                  <YAxis type="number" dataKey="price" name="السعر" domain={[0.5, 5.5]}
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    label={{ value: "حساسية السعر ↑", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 11, fill: "#9CA3AF" } }}
                  />
                  <ZAxis type="number" dataKey="n" range={[200, 600]} />
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload;
                    return (
                      <div style={{ background: "#1F2937", color: "#fff", padding: "10px 14px", borderRadius: 10, fontSize: 12, direction: "rtl" }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{d.name}</p>
                        <p style={{ margin: "4px 0 0" }}>الجودة: {d.quality} / 5</p>
                        <p style={{ margin: "2px 0 0" }}>حساسية السعر: {d.price} / 5</p>
                        <p style={{ margin: "2px 0 0", color: "#9CA3AF" }}>عدد التقييمات: {d.n}</p>
                      </div>
                    );
                  }} />
                  <Scatter data={perceptualMap.filter(p => p.type === "محلية")} name="منصات محلية" fill={TEAL}>
                    <LabelList dataKey="name" position="top" style={{ fontSize: 11, fontWeight: 700, fill: TEAL }} offset={10} />
                  </Scatter>
                  <Scatter data={perceptualMap.filter(p => p.type === "عالمية")} name="منصات عالمية" fill="#6366F1">
                    <LabelList dataKey="name" position="top" style={{ fontSize: 11, fontWeight: 700, fill: "#6366F1" }} offset={10} />
                  </Scatter>
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </ScatterChart>
              </ResponsiveContainer>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 }}>
                {[
                  { title: "⭐ الأفضل قيمة", desc: "جودة عالية + سعر مقبول", bg: "#F0FDF4", color: "#059669" },
                  { title: "💎 بريميوم", desc: "جودة عالية + سعر مرتفع", bg: "#EEF2FF", color: "#6366F1" },
                  { title: "⚠️ تحتاج تحسين", desc: "جودة أقل + سعر مقبول", bg: "#FFFBEB", color: "#D97706" },
                  { title: "❌ ضعيفة", desc: "جودة أقل + سعر مرتفع", bg: "#FEF2F2", color: "#EF4444" },
                ].map((q, i) => (
                  <div key={i} style={{ padding: "10px 12px", borderRadius: 10, background: q.bg }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: q.color, margin: "0 0 2px" }}>{q.title}</p>
                    <p style={{ fontSize: 10.5, color: "#6B7280", margin: 0 }}>{q.desc}</p>
                  </div>
                ))}
              </div>
            </ChartCard>
          )}

          <SectionTitle icon="📋" text="جدول التقييمات" />
          <ChartCard style={{ padding: "12px 8px", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #E5E7EB" }}>
                  <th style={{ padding: "8px 6px", textAlign: "right", color: "#6B7280", fontWeight: 600 }}>المنصة</th>
                  <th style={{ padding: "8px 6px", textAlign: "center", color: "#059669", fontWeight: 600 }}>الجودة</th>
                  <th style={{ padding: "8px 6px", textAlign: "center", color: "#6366F1", fontWeight: 600 }}>السعر</th>
                  <th style={{ padding: "8px 6px", textAlign: "center", color: "#6B7280", fontWeight: 600 }}>التقييمات</th>
                </tr>
              </thead>
              <tbody>
                {perceptualMap.sort((a, b) => b.quality - a.quality).map((p, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "10px 6px", fontWeight: 600, color: "#111827" }}>
                      <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: p.color, marginLeft: 6 }} />
                      {p.name}
                    </td>
                    <td style={{ padding: "10px 6px", textAlign: "center" }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 8, fontWeight: 700, fontSize: 12,
                        background: p.quality >= 4 ? "#F0FDF4" : p.quality >= 3 ? "#FFFBEB" : "#FEF2F2",
                        color: p.quality >= 4 ? "#059669" : p.quality >= 3 ? "#D97706" : "#EF4444",
                      }}>{p.quality}</span>
                    </td>
                    <td style={{ padding: "10px 6px", textAlign: "center" }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 8, fontWeight: 700, fontSize: 12,
                        background: p.price <= 2 ? "#F0FDF4" : p.price <= 3.5 ? "#FFFBEB" : "#FEF2F2",
                        color: p.price <= 2 ? "#059669" : p.price <= 3.5 ? "#D97706" : "#EF4444",
                      }}>{p.price}</span>
                    </td>
                    <td style={{ padding: "10px 6px", textAlign: "center", color: "#6B7280" }}>{p.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ChartCard>
        </>
      )}

      {/* الفوتر */}
      <div style={{ textAlign: "center", padding: "20px 0", borderTop: "1px solid #E5E7EB", marginTop: 20 }}>
        <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>استبانة منصات التعلم الإلكتروني — بيانات حقيقية من Google Sheets</p>
      </div>
    </div>
  );
}
