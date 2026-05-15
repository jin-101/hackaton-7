import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { TrendingUp, Users, Plane, AlertCircle } from "lucide-react";
import { flights, revenueHistory, fareClasses, aiRecommendations } from "../data/mockData";

const fmt = (n: number) =>
  n >= 100_000_000
    ? `${(n / 100_000_000).toFixed(1)}억`
    : `${(n / 10_000).toFixed(0)}만`;

const loadFactorColor = (lf: number) => {
  if (lf >= 85) return "#ef4444";
  if (lf >= 65) return "#f59e0b";
  return "#3b82f6";
};

export default function Dashboard() {
  const totalRevenue = revenueHistory.reduce((s, d) => s + d.revenue, 0);
  const totalBookings = revenueHistory.reduce((s, d) => s + d.bookings, 0);
  const avgLoadFactor =
    flights.reduce((s, f) => s + f.bookedSeats / f.totalSeats, 0) / flights.length;
  const pendingRecs = aiRecommendations.filter((r) => r.status === "pending").length;

  const loadFactorData = flights.map((f) => ({
    name: `${f.flightNo}\n${f.route}`,
    label: `${f.flightNo} (${f.route})`,
    lf: Math.round((f.bookedSeats / f.totalSeats) * 100),
  }));

  const classData = ["Y", "B", "M", "K", "H", "Q"].map((cls) => {
    const rows = fareClasses.filter((fc) => fc.bookingClass === cls);
    const total = rows.reduce((s, r) => s + r.availableSeats, 0);
    const booked = rows.reduce((s, r) => s + r.bookedSeats, 0);
    return { cls, lf: total ? Math.round((booked / total) * 100) : 0 };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">실시간 대시보드</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<TrendingUp size={20} className="text-blue-600" />}
          label="최근 8일 수익"
          value={fmt(totalRevenue)}
          sub="원"
          color="blue"
        />
        <KpiCard
          icon={<Users size={20} className="text-emerald-600" />}
          label="총 예약 건수"
          value={totalBookings.toLocaleString()}
          sub="건"
          color="emerald"
        />
        <KpiCard
          icon={<Plane size={20} className="text-amber-600" />}
          label="평균 Load Factor"
          value={`${(avgLoadFactor * 100).toFixed(1)}%`}
          sub="전체 항공편"
          color="amber"
        />
        <KpiCard
          icon={<AlertCircle size={20} className="text-rose-600" />}
          label="AI 승인 대기"
          value={String(pendingRecs)}
          sub="건"
          color="rose"
        />
      </div>

      {/* Revenue Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-700 mb-4">수익 추이 (최근 8일)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={revenueHistory}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11 }} width={50} />
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-4">항공편별 Load Factor</h3>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Booking Class별 평균 LF</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={classData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="cls" tick={{ fontSize: 13, fontWeight: 600 }} />
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
  icon, label, value, sub, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  const bg: Record<string, string> = {
    blue: "bg-blue-50",
    emerald: "bg-emerald-50",
    amber: "bg-amber-50",
    rose: "bg-rose-50",
  };
  return (
    <div className={`${bg[color]} rounded-xl p-4 border border-gray-100`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
    </div>
  );
}
