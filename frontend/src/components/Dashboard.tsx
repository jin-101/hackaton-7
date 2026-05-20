import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { TrendingUp, Users, Plane, AlertCircle } from "lucide-react";
import { revenueHistory, KE_DOMESTIC_ROUTES } from "../data/mockData";
import { useAiRecommendationStore } from "../stores/aiRecommendationStore";

const BRAND = "#002561";

const fmt = (n: number) =>
  n >= 100_000_000
    ? `${(n / 100_000_000).toFixed(1)}억`
    : `${(n / 10_000).toFixed(0)}만`;

const loadFactorColor = (lf: number) => {
  if (lf >= 85) return "#ef4444";
  if (lf >= 65) return "#f59e0b";
  return "#3b82f6";
};

const PERIOD_OPTIONS = [
  { label: "1일", value: 1 },
  { label: "3일", value: 3 },
  { label: "7일", value: 7 },
  { label: "10일", value: 10 },
];

// 노선별 LF Mock 데이터 (노선 필터 반영용)
const ROUTE_LF_MAP: Record<string, { flight: { label: string; lf: number }[]; cls: { cls: string; lf: number }[] }> = {
  "전체": {
    flight: [
      { label: "KE1201 (GMP-CJU)", lf: 79 },
      { label: "KE1203 (GMP-CJU)", lf: 54 },
      { label: "KE1205 (GMP-CJU)", lf: 89 },
      { label: "KE1401 (GMP-PUS)", lf: 58 },
      { label: "KE1501 (ICN-CJU)", lf: 87 },
      { label: "KE1207 (GMP-CJU)", lf: 36 },
      { label: "KE1403 (GMP-PUS)", lf: 73 },
    ],
    cls: [
      { cls: "C (프레스티지)", lf: 72 },
      { cls: "Y (일반 정상)", lf: 68 },
      { cls: "M (일반 할인)", lf: 81 },
      { cls: "V (특가)", lf: 55 },
    ],
  },
  "GMP-CJU": {
    flight: [
      { label: "KE1201 (GMP-CJU)", lf: 79 },
      { label: "KE1203 (GMP-CJU)", lf: 54 },
      { label: "KE1205 (GMP-CJU)", lf: 89 },
      { label: "KE1207 (GMP-CJU)", lf: 36 },
    ],
    cls: [
      { cls: "C (프레스티지)", lf: 75 },
      { cls: "Y (일반 정상)", lf: 71 },
      { cls: "M (일반 할인)", lf: 85 },
      { cls: "V (특가)", lf: 58 },
    ],
  },
  "GMP-PUS": {
    flight: [
      { label: "KE1401 (GMP-PUS)", lf: 58 },
      { label: "KE1403 (GMP-PUS)", lf: 73 },
    ],
    cls: [
      { cls: "C (프레스티지)", lf: 65 },
      { cls: "Y (일반 정상)", lf: 61 },
      { cls: "M (일반 할인)", lf: 74 },
      { cls: "V (특가)", lf: 49 },
    ],
  },
};

function getRouteData(route: string) {
  return ROUTE_LF_MAP[route] ?? ROUTE_LF_MAP["전체"];
}

export default function Dashboard() {
  const { recommendations } = useAiRecommendationStore();
  const [periodDays, setPeriodDays] = useState(1);
  const [dashboardRoute, setDashboardRoute] = useState("전체");

  const filteredHistory = revenueHistory.slice(-periodDays);

  const totalRevenue = filteredHistory.reduce((s, d) => s + d.revenue, 0);
  const totalBookings = filteredHistory.reduce((s, d) => s + d.bookings, 0);
  const pendingRecs = recommendations.filter((r) => r.status === "pending").length;
  const avgLoadFactor = 0.745;

  const routeData = getRouteData(dashboardRoute);
  const { flight: loadFactorData, cls: classData } = routeData;

  const routeLabel = dashboardRoute === "전체" ? "국내선 전체" : dashboardRoute;
  const titleText = `${routeLabel} 판매현황 (최근 ${periodDays}일)`;

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* 헤더 + 필터 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800">{titleText}</h2>
        <div className="flex flex-wrap items-center gap-2">
          {/* 노선 필터 */}
          <select
            data-testid="dashboard-route-select"
            value={dashboardRoute}
            onChange={(e) => setDashboardRoute(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 bg-white outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="전체">국내선 전체</option>
            {KE_DOMESTIC_ROUTES.map((r) => (
              <option key={r} value={r}>{r.replace("-", " ↔ ")}</option>
            ))}
          </select>
          {/* 기간 필터 */}
          <div className="flex rounded-lg overflow-hidden border border-slate-200">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                data-testid={`period-btn-${opt.value}`}
                onClick={() => setPeriodDays(opt.value)}
                className={`px-3 py-1.5 text-sm font-bold transition-colors ${
                  periodDays === opt.value
                    ? "text-white"
                    : "bg-white text-slate-500 hover:bg-slate-50"
                }`}
                style={periodDays === opt.value ? { backgroundColor: BRAND } : {}}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kpi-cards">
        <KpiCard
          icon={<TrendingUp size={20} className="text-blue-600" />}
          label={`최근 ${periodDays}일 수익`}
          value={fmt(totalRevenue)}
          sub="원"
          color="blue"
          testId="kpi-revenue"
        />
        <KpiCard
          icon={<Users size={20} className="text-emerald-600" />}
          label="총 예약 건수"
          value={totalBookings.toLocaleString()}
          sub="건"
          color="emerald"
          testId="kpi-bookings"
        />
        <KpiCard
          icon={<Plane size={20} className="text-amber-600" />}
          label="평균 Load Factor"
          value={`${(avgLoadFactor * 100).toFixed(1)}%`}
          sub={routeLabel}
          color="amber"
          testId="kpi-lf"
        />
        <KpiCard
          icon={<AlertCircle size={20} className="text-rose-600" />}
          label="AI 승인 대기"
          value={String(pendingRecs)}
          sub="건"
          color="rose"
          testId="kpi-pending-recs"
        />
      </div>

      {/* Revenue Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-700 mb-4">
          수익 추이 ({routeLabel} · 최근 {periodDays}일)
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={filteredHistory}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => fmt(Number(v))} tick={{ fontSize: 11 }} width={50} />
            <Tooltip formatter={(v) => [`${Number(v).toLocaleString()}원`, "수익"]} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#revGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Load Factor by Flight */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5" data-testid="lf-by-flight-chart">
          <h3 className="font-semibold text-gray-700 mb-4">
            항공편별 Load Factor ({routeLabel})
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={loadFactorData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={130} />
              <Tooltip formatter={(v) => [`${v}%`, "Load Factor"]} />
              <Bar dataKey="lf" radius={[0, 4, 4, 0]}>
                {loadFactorData.map((d, i) => (
                  <Cell key={i} fill={loadFactorColor(d.lf)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Load Factor by Booking Class */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5" data-testid="lf-by-class-chart">
          <h3 className="font-semibold text-gray-700 mb-4">
            등급별 평균 LF ({routeLabel})
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={classData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="cls" tick={{ fontSize: 11, fontWeight: 600 }} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v}%`, "LF"]} />
              <Bar dataKey="lf" radius={[4, 4, 0, 0]}>
                {classData.map((d, i) => (
                  <Cell key={i} fill={loadFactorColor(d.lf)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="flex gap-4 mt-3 justify-center text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />85%+</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />65–85%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />~65%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon, label, value, sub, color, testId,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
  testId: string;
}) {
  const bg: Record<string, string> = {
    blue: "bg-blue-50",
    emerald: "bg-emerald-50",
    amber: "bg-amber-50",
    rose: "bg-rose-50",
  };
  return (
    <div className={`${bg[color]} rounded-xl p-4 border border-gray-100`} data-testid={testId}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
    </div>
  );
}
