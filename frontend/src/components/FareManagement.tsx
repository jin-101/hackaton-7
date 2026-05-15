import { useState, useRef, useEffect } from "react";
import {
  Search, Sparkles, Send, LayoutGrid, BarChart4,
  AlertCircle, Coins, Wallet, XCircle,
  ChevronLeft, ChevronRight, TrendingUp, TrendingDown,
  RefreshCw, Plane, CheckCircle, XIcon, Calendar,
} from "lucide-react";
import {
  buildDashboardFlights, buildWeekDays, KE_DOMESTIC_ROUTES,
  type DashboardFlight, type DashboardClass,
} from "../data/mockData";
import { useFareStore } from "../stores/fareStore";
import { useAiRecommendationStore } from "../stores/aiRecommendationStore";

const BRAND = "#002561";

const fmtW = (n: number) => `₩${n.toLocaleString()}`;

const classTagColor = (name: string) => {
  if (name.includes("일등석"))    return "bg-purple-100 text-purple-700";
  if (name.includes("프레스티지")) return "bg-amber-100 text-amber-700";
  if (name.includes("일반석"))    return "bg-blue-100 text-blue-700";
  return "bg-slate-200 text-slate-600";
};
const classBarColor = (name: string) => {
  if (name.includes("일등석"))    return "bg-purple-600";
  if (name.includes("프레스티지")) return "bg-amber-500";
  if (name.includes("일반석"))    return "bg-blue-600";
  return "bg-slate-400";
};
const statusBadgeClass = (s: DashboardFlight["status"]) => {
  const m: Record<string, string> = {
    "수요 급증": "bg-red-100 text-red-600",
    "위험":      "bg-red-200 text-red-700",
    "안정적":    "bg-green-100 text-green-700",
    "수요 저조": "bg-amber-100 text-amber-700",
  };
  return m[s] ?? "bg-slate-100 text-slate-500";
};
const lfBarColor = (lf: number) =>
  lf >= 90 ? "bg-red-500" : lf >= 70 ? "bg-amber-500" : "bg-[#002561]";

type ClassStatus = "Open" | "Closed" | "Sold Out";

interface EditState {
  flightId: string;
  classCode: string;
  field: "price" | "seats";
  value: string;
}

// 월간 달력 날짜 생성
function buildMonthDays(year: number, month: number): { date: string; day: number; inMonth: boolean }[] {
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const days: { date: string; day: number; inMonth: boolean }[] = [];
  // 앞 빈칸
  const prevLastDate = new Date(year, month, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevLastDate - i;
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({ date: dateStr, day: d, inMonth: false });
  }
  // 이번 달
  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({ date: dateStr, day: d, inMonth: true });
  }
  // 뒤 빈칸 (6행 맞추기)
  const remain = 42 - days.length;
  for (let d = 1; d <= remain; d++) {
    const dateStr = `${year}-${String(month + 2).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({ date: dateStr, day: d, inMonth: false });
  }
  return days;
}

const MONTH_KO = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const DOW_KO = ["일","월","화","수","목","금","토"];

export default function FareManagement() {
  const today = new Date();
  const [calYear, setCalYear]           = useState(2026);
  const [calMonth, setCalMonth]         = useState(4); // 0-indexed (4 = 5월)
  const [selectedDate, setSelectedDate] = useState(today.toISOString().slice(0, 10));
  const [showCalendar, setShowCalendar] = useState(false);
  const [weekOffset, setWeekOffset]     = useState(0);
  const [selectedRoute, setSelectedRoute] = useState(KE_DOMESTIC_ROUTES[0]);
  const [flights, setFlights]           = useState<DashboardFlight[]>(() =>
    buildDashboardFlights(KE_DOMESTIC_ROUTES[0])
  );
  const [selectedFlight, setSelectedFlight] = useState<DashboardFlight>(
    () => buildDashboardFlights(KE_DOMESTIC_ROUTES[0])[0]
  );
  const [editState, setEditState]       = useState<EditState | null>(null);
  const [aiQuery, setAiQuery]           = useState("");
  const [aiLoading, setAiLoading]       = useState(false);
  const [aiPopup, setAiPopup]           = useState<{ desc: string } | null>(null);
  const aiRef = useRef<HTMLTextAreaElement>(null);
  const { updateFare } = useFareStore();
  const { approveRecommendation, rejectRecommendation } = useAiRecommendationStore();
  const [aiDetailPopup, setAiDetailPopup] = useState<{ flightId: string; cls: DashboardClass } | null>(null);

  const aiDetailFlight = aiDetailPopup ? flights.find(f => f.id === aiDetailPopup.flightId) ?? null : null;

  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() + weekOffset * 7);
  const weekDays = buildWeekDays(baseDate);
  const monthDays = buildMonthDays(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  useEffect(() => {
    const newFlights = buildDashboardFlights(selectedRoute);
    setFlights(newFlights);
    setSelectedFlight(newFlights[0]);
  }, [selectedRoute]);

  const syncSelected = (updated: DashboardFlight[]) => {
    const found = updated.find((f) => f.id === selectedFlight.id);
    if (found) setSelectedFlight(found);
  };

  // ── 인라인 편집 ──────────────────────────────────────────────────────────
  const startEdit = (flightId: string, classCode: string, field: "price" | "seats", cur: number) => {
    setEditState({ flightId, classCode, field, value: String(cur) });
  };
  const commitEdit = () => {
    if (!editState) return;
    const num = parseInt(editState.value, 10);
    if (isNaN(num) || num < 0) { setEditState(null); return; }
    const updated = flights.map((f) => {
      if (f.id !== editState.flightId) return f;
      return {
        ...f,
        classes: f.classes.map((c) => {
          if (c.code !== editState.classCode) return c;
          if (editState.field === "price") {
            updateFare(editState.flightId, editState.classCode, num);
            return { ...c, price: num };
          }
          const newSeats = Math.max(num, 1);
          return { ...c, seats: newSeats, sold: Math.min(c.sold, newSeats) };
        }),
      };
    });
    setFlights(updated);
    syncSelected(updated);
    setEditState(null);
  };

  // ── AI 분석 요청 ─────────────────────────────────────────────────────────
  const runAi = () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setTimeout(() => {
      const up = selectedFlight.aiRecommended > selectedFlight.currentPrice;
      setAiPopup({
        desc: `"${aiQuery}" 분석 결과 — 해당 이슈로 고수요 고객 유입이 약 15% 증가할 것으로 예측됩니다. ${up ? "하위 클래스 인벤토리 즉시 회수 및" : ""} ${selectedFlight.id} Y/B/M 클래스 운임을 ${fmtW(selectedFlight.aiRecommended)}으로 ${up ? "인상" : "조정"}하십시오.`,
      });
      setAiLoading(false);
    }, 1400);
  };

  // ── AI 추천 일괄 적용 (팝업) ─────────────────────────────────────────────
  const applyAiPopup = () => {
    const updated = flights.map((f) =>
      f.id === selectedFlight.id
        ? {
            ...f,
            currentPrice: f.aiRecommended,
            classes: f.classes.map((c) => ({
              ...c,
              price: c.aiPrice,
              status: (c.name.includes("할인가") || c.name.includes("특가"))
                ? ("Closed" as ClassStatus)
                : c.status,
            })),
          }
        : f
    );
    setFlights(updated);
    syncSelected(updated);
    setAiPopup(null);
    setAiQuery("");
  };

  // ── AI 추천가 단건 적용 ───────────────────────────────────────────────────
  const applyAiClass = (flightId: string, classCode: string) => {
    const updated = flights.map((f) => {
      if (f.id !== flightId) return f;
      return {
        ...f,
        classes: f.classes.map((c) =>
          c.code === classCode ? { ...c, price: c.aiPrice } : c
        ),
      };
    });
    setFlights(updated);
    syncSelected(updated);
  };

  // ── 클래스 상태 토글 ─────────────────────────────────────────────────────
  const toggleStatus = (flightId: string, classCode: string) => {
    const updated = flights.map((f) => {
      if (f.id !== flightId) return f;
      return {
        ...f,
        classes: f.classes.map((c) => {
          if (c.code !== classCode) return c;
          const next: ClassStatus =
            c.status === "Open" ? "Closed" :
            c.status === "Closed" ? "Open" : c.status;
          return { ...c, status: next };
        }),
      };
    });
    setFlights(updated);
    syncSelected(updated);
  };

  // ── Profit 계산 ───────────────────────────────────────────────────────────
  const revenue = selectedFlight.classes.reduce((s, c) => s + c.sold * c.price, 0);
  const cost    = selectedFlight.baseCost;
  const profit  = revenue - cost;
  const margin  = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : "0.0";
  const soldSeats = selectedFlight.classes.reduce((s, c) => s + c.sold, 0);

  return (
    <div className="space-y-0 -m-8" data-testid="fare-management-page">

      {/* AI 추천 상세 모달 */}
      {aiDetailPopup && (() => {
        const { cls } = aiDetailPopup;
        const isUp = cls.aiPrice > cls.price;
        const pct = Math.round(Math.abs(cls.aiPrice - cls.price) / cls.price * 100);
        const soldPct = cls.seats > 0 ? Math.round(cls.sold / cls.seats * 100) : 0;
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={() => setAiDetailPopup(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl text-purple-600"><Sparkles size={20} /></div>
                  <div>
                    <h3 className="font-black text-slate-800 text-base">AI 추천 상세</h3>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                      {aiDetailPopup.flightId} · {cls.code} {cls.name} · {selectedRoute}
                    </p>
                  </div>
                </div>
                <button onClick={() => setAiDetailPopup(null)} className="text-slate-300 hover:text-slate-500 transition-colors">
                  <XCircle size={22} />
                </button>
              </div>

              {/* 가격 비교 */}
              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4 mb-4">
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 font-bold mb-1">현재 운임</div>
                  <div className="text-xl font-black text-slate-400 line-through">{cls.price.toLocaleString()}원</div>
                </div>
                <div className={`flex flex-col items-center gap-1 text-sm font-black ${isUp ? "text-red-500" : "text-blue-500"}`}>
                  {isUp ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  {isUp ? "+" : "-"}{pct}%
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 font-bold mb-1">AI 추천 운임</div>
                  <div className={`text-xl font-black ${isUp ? "text-red-600" : "text-blue-600"}`}>
                    {cls.aiPrice.toLocaleString()}원
                  </div>
                </div>
              </div>

              {/* 추천 근거 */}
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles size={12} className="text-purple-500" />
                  <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider">AI 분석 근거</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{selectedFlight.reason}</p>
              </div>

              {/* 판매 현황 */}
              <div className="mb-5">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5">
                  <span>현재 판매율</span>
                  <span className="text-purple-600 font-black">{soldPct}% ({cls.sold}/{cls.seats}석)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all"
                    style={{ width: `${soldPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                  <span>잔여 {cls.seats - cls.sold}석</span>
                  <span className={`px-2 py-0.5 rounded-full ${cls.status === "Open" ? "bg-green-100 text-green-600" : cls.status === "Sold Out" ? "bg-red-200 text-red-700" : "bg-red-100 text-red-500"}`}>
                    {cls.status}
                  </span>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    rejectRecommendation(`${aiDetailPopup.flightId}-${cls.code}`);
                    setAiDetailPopup(null);
                  }}
                  className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
                >
                  거부
                </button>
                <button
                  onClick={() => {
                    applyAiClass(aiDetailPopup.flightId, cls.code);
                    approveRecommendation(`${aiDetailPopup.flightId}-${cls.code}`);
                    setAiDetailPopup(null);
                  }}
                  className="flex-1 text-white py-3 rounded-xl font-black text-sm hover:opacity-90 transition-all shadow-md active:scale-95"
                  style={{ backgroundColor: BRAND }}
                >
                  추천 운임 적용
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* AI 전략 분석 결과 모달 */}
      {aiPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={() => setAiPopup(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-100 rounded-xl text-sky-600"><Sparkles size={20} /></div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">AI 긴급 전략 제안</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">External Factor Detected</p>
                </div>
              </div>
              <button onClick={() => setAiPopup(null)} className="text-slate-300 hover:text-slate-500 transition-colors">
                <XCircle size={22} />
              </button>
            </div>

            {/* 분석 결과 */}
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles size={12} className="text-sky-500" />
                <span className="text-[10px] font-black text-sky-600 uppercase tracking-wider">분석 결과</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">{aiPopup.desc}</p>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                data-testid="strategy-reject-btn"
                onClick={() => setAiPopup(null)}
                className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
              >
                기각
              </button>
              <button
                data-testid="strategy-approve-btn"
                onClick={applyAiPopup}
                className="flex-1 text-white py-3 rounded-xl font-black text-sm hover:opacity-90 transition-all shadow-md active:scale-95"
                style={{ backgroundColor: BRAND }}
              >
                전략 승인 및 적용
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 max-w-[1600px] mx-auto grid grid-cols-12 gap-5 pb-8">

        {/* ── 좌측 사이드바 ── */}
        <aside className="col-span-12 lg:col-span-3 space-y-5">

          {/* 노선 · 날짜 설정 */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xs font-black text-slate-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Search size={13} /> 노선 및 일자 설정
            </h2>
            <div className="space-y-4">
              <select
                data-testid="fare-route-select"
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 font-bold text-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                {KE_DOMESTIC_ROUTES.map((r) => (
                  <option key={r} value={r}>{r.replace("-", " ↔ ")}</option>
                ))}
              </select>

              {/* 날짜 선택 버튼 (달력 토글) */}
              <button
                onClick={() => setShowCalendar((v) => !v)}
                className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all"
              >
                <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Calendar size={14} className="text-blue-500" />
                  {selectedDate}
                </span>
                <ChevronRight size={14} className={`text-slate-400 transition-transform ${showCalendar ? "rotate-90" : ""}`} />
              </button>

              {/* 월간 달력 */}
              {showCalendar && (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-md">
                  {/* 헤더 */}
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                    <button onClick={prevMonth} className="p-1 rounded hover:bg-slate-200 text-slate-500">
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-xs font-black text-slate-700">
                      {calYear}년 {MONTH_KO[calMonth]}
                    </span>
                    <button onClick={nextMonth} className="p-1 rounded hover:bg-slate-200 text-slate-500">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                  {/* 요일 헤더 */}
                  <div className="grid grid-cols-7 text-center border-b border-slate-100">
                    {DOW_KO.map((d, i) => (
                      <div key={d} className={`text-[9px] font-black py-1.5 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-500" : "text-slate-400"}`}>{d}</div>
                    ))}
                  </div>
                  {/* 날짜 */}
                  <div className="grid grid-cols-7">
                    {monthDays.map((d, i) => {
                      const isSelected = selectedDate === d.date;
                      const isToday = d.date === today.toISOString().slice(0, 10);
                      const dow = i % 7;
                      return (
                        <button
                          key={d.date}
                          onClick={() => { if (d.inMonth) { setSelectedDate(d.date); setShowCalendar(false); } }}
                          disabled={!d.inMonth}
                          className={`py-1.5 text-[10px] font-bold transition-all relative
                            ${!d.inMonth ? "text-slate-200 cursor-default" : ""}
                            ${d.inMonth && !isSelected ? "hover:bg-blue-50" : ""}
                            ${isSelected ? "text-white rounded-sm" : ""}
                            ${isToday && !isSelected ? "underline" : ""}
                            ${d.inMonth && dow === 0 && !isSelected ? "text-red-400" : ""}
                            ${d.inMonth && dow === 6 && !isSelected ? "text-blue-500" : ""}
                          `}
                          style={isSelected ? { backgroundColor: BRAND } : {}}
                        >
                          {d.day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 주간 달력 피커 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <button onClick={() => setWeekOffset((w) => w - 1)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400"><ChevronLeft size={15} /></button>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {weekDays[0].label} ~ {weekDays[6].label}
                  </span>
                  <button onClick={() => setWeekOffset((w) => w + 1)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400"><ChevronRight size={15} /></button>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map((d) => (
                    <button
                      key={d.date}
                      onClick={() => setSelectedDate(d.date)}
                      className={`flex flex-col items-center py-2 rounded-lg text-[10px] font-black border transition-all ${
                        selectedDate === d.date
                          ? "text-white border-[#002561]"
                          : d.isToday
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "bg-white border-slate-100 text-slate-500 hover:border-blue-300"
                      }`}
                      style={selectedDate === d.date ? { backgroundColor: BRAND } : {}}
                    >
                      <span className="text-[8px] opacity-70">{d.dayOfWeek}</span>
                      <span>{d.date.slice(8)}</span>
                      {d.isPeak && <span className="text-[7px] text-amber-500 font-bold">성수기</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-[11px] text-slate-500 bg-slate-50 rounded-lg px-3 py-2 font-medium">
                📅 {selectedDate} · {selectedRoute}
              </div>
            </div>
          </div>

          {/* AI 전략 분석 요청 */}
          <div className="rounded-xl shadow-lg text-white p-5" style={{ backgroundColor: BRAND }}>
            <h2 className="text-sm font-black mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-sky-300" /> AI 전략 분석 요청
            </h2>
            <div className="space-y-3">
              <textarea
                data-testid="ai-strategy-query"
                ref={aiRef}
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="w-full h-24 p-3 bg-white/10 border border-white/20 rounded-lg text-xs placeholder:text-white/40 focus:bg-white/20 focus:outline-none resize-none font-medium"
                placeholder="돌발 이슈를 입력하세요&#10;(예: 태풍 보도, 대형 행사, 연휴 등)"
              />
              <button
                data-testid="ai-strategy-submit-btn"
                onClick={runAi}
                disabled={aiLoading || !aiQuery.trim()}
                className="w-full bg-sky-400 hover:bg-sky-500 disabled:opacity-50 text-[#002561] font-black py-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {aiLoading
                  ? <><RefreshCw size={13} className="animate-spin" /> 분석 중...</>
                  : <><Send size={13} /> AI 전략 분석 시작</>}
              </button>
            </div>
          </div>

        </aside>

        {/* ── 중앙 메인 ── */}
        <section className="col-span-12 lg:col-span-6 space-y-5">



          {/* 운항 현황 테이블 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-end">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  {selectedDate} 운항 현황
                </h2>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                  B737-900 (C8 / Y165) · {selectedRoute}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 block mb-1 uppercase">Selected</span>
                <span className="text-lg font-black" style={{ color: BRAND }}>
                  {selectedFlight.id} / {selectedFlight.time}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3">편명/시간</th>
                    <th className="px-5 py-3 text-center">L/F</th>
                    <th className="px-5 py-3 text-center">Pace</th>
                    <th className="px-5 py-3">현재가</th>
                    <th className="px-5 py-3 text-blue-600">AI 추천</th>
                    <th className="px-5 py-3">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {flights.map((f) => {
                    const isSelected = f.id === selectedFlight.id;
                    const paceUp = f.pace.startsWith("+");
                    return (
                      <tr
                        key={f.id}
                        onClick={() => setSelectedFlight(f)}
                        className={`cursor-pointer transition-all hover:bg-blue-50/60 ${
                          isSelected ? "bg-blue-50/80 border-l-4 border-[#002561]" : "border-l-4 border-transparent"
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="font-black text-slate-900 text-sm">{f.id}</div>
                          <div className="text-[10px] text-slate-400 font-bold">{f.time} ({f.timeSlot})</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div className={`h-full ${lfBarColor(f.lf)}`} style={{ width: `${f.lf}%` }} />
                            </div>
                            <span className="text-[11px] font-black text-slate-600">{f.lf}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`text-[11px] font-black flex items-center justify-center gap-0.5 ${paceUp ? "text-red-500" : "text-blue-500"}`}>
                            {paceUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            {f.pace}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[12px] font-bold text-slate-800">{fmtW(f.currentPrice)}</td>
                        <td className="px-5 py-4 font-black text-[12px] text-blue-600">
                          {f.aiRecommended !== f.currentPrice
                            ? <span className="flex items-center gap-1">
                                {fmtW(f.aiRecommended)}
                                <TrendingUp size={11} className={f.aiRecommended > f.currentPrice ? "text-red-400" : "text-blue-400"} />
                              </span>
                            : <span className="text-slate-400 font-medium text-xs">유지</span>
                          }
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadgeClass(f.status)}`}>
                            {f.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 좌석 등급별 현황 카드 — AI 추천 인라인 통합 */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <LayoutGrid size={16} style={{ color: BRAND }} />
                좌석 등급별 운임 관리
                <span className="text-xs font-bold text-slate-400 ml-1">
                  — {selectedFlight.id} ({selectedFlight.time})
                </span>
              </h3>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase">
                C8 + Y165 = 173 Seats
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedFlight.classes.map((cls) => (
                <ClassEditCard
                  key={cls.code}
                  cls={cls}
                  flightId={selectedFlight.id}
                  editState={editState}
                  onStartEdit={startEdit}
                  onCommit={commitEdit}
                  onCancel={() => setEditState(null)}
                  onEditChange={(v) => setEditState((e) => e ? { ...e, value: v } : null)}
                  onToggleStatus={toggleStatus}
                  onApplyAi={applyAiClass}
                  onDetailAi={(fid, code) => {
                    const cls = selectedFlight.classes.find(c => c.code === code);
                    if (cls) setAiDetailPopup({ flightId: fid, cls });
                  }}
                />
              ))}
            </div>

            {/* AI 분석 근거 */}
            <div className="mt-5 pt-4 border-t border-dashed border-slate-200 flex items-start gap-2">
              <AlertCircle size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                <span className="text-blue-600 font-bold">AI 분석 근거:</span> {selectedFlight.reason}
              </p>
            </div>
          </div>
        </section>

        {/* ── 우측: Profit Analysis + AI 추천 ── */}
        <aside className="col-span-12 lg:col-span-3 space-y-5">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-20">
            <h2 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2 border-b pb-4 uppercase">
              <BarChart4 size={16} style={{ color: BRAND }} /> Profit Analysis
            </h2>
            <div className="space-y-4">
              {/* Revenue */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black text-blue-600 uppercase">Revenue</span>
                  <Coins size={13} className="text-blue-400" />
                </div>
                <div className="text-xl font-black" style={{ color: BRAND }}>{fmtW(revenue)}</div>
                <p className="text-[9px] text-blue-400 font-bold mt-1">
                  {soldSeats}석 판매 (L/F {selectedFlight.lf}%)
                </p>
              </div>
              {/* Cost */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Cost</span>
                  <Wallet size={13} className="text-slate-400" />
                </div>
                <div className="text-xl font-black text-slate-700">{fmtW(cost)}</div>
                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">Operational Expenses</p>
              </div>
              {/* Profit / Margin */}
              <div className="bg-white p-4 rounded-xl border-2 border-slate-100 shadow-inner">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Margin</span>
                  <span className={`text-sm font-black ${profit >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {margin}%
                  </span>
                </div>
                <div className={`text-2xl font-black tracking-tight mb-3 ${profit >= 0 ? "text-slate-800" : "text-red-600"}`}>
                  {fmtW(profit)}
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${profit >= 0 ? "bg-green-500" : "bg-red-400"}`}
                    style={{ width: `${Math.min(Math.abs(Number(margin)), 100)}%` }}
                  />
                </div>
              </div>
              {/* 확정 버튼 */}
              <button
                data-testid="confirm-inventory-btn"
                className="w-full text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95"
                style={{ backgroundColor: BRAND }}
              >
                <Plane size={15} /> 인벤토리 실시간 통제 확정
              </button>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}

// ── 등급 카드 (인라인 편집 + AI 추천 적용) ────────────────────────────────
function ClassEditCard({
  cls, flightId, editState, onStartEdit, onCommit, onCancel, onEditChange,
  onToggleStatus, onApplyAi, onDetailAi,
}: {
  cls: DashboardClass;
  flightId: string;
  editState: EditState | null;
  onStartEdit: (fid: string, code: string, field: "price" | "seats", cur: number) => void;
  onCommit: () => void;
  onCancel: () => void;
  onEditChange: (v: string) => void;
  onToggleStatus: (fid: string, code: string) => void;
  onApplyAi: (fid: string, code: string) => void;
  onDetailAi: (fid: string, code: string) => void;
}) {
  const soldPct = cls.seats > 0 ? Math.round((cls.sold / cls.seats) * 100) : 0;
  const isEditingPrice = editState?.flightId === flightId && editState.classCode === cls.code && editState.field === "price";
  const isEditingSeats = editState?.flightId === flightId && editState.classCode === cls.code && editState.field === "seats";

  const statusColor =
    cls.status === "Open"     ? "bg-green-100 text-green-600" :
    cls.status === "Sold Out" ? "bg-red-200 text-red-700" :
                                "bg-red-100 text-red-600";

  const hasDiff = cls.aiPrice !== cls.price;
  const aiUp = cls.aiPrice > cls.price;
  const aiDiffPct = cls.price > 0 ? Math.round(((cls.aiPrice - cls.price) / cls.price) * 100) : 0;

  return (
    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-blue-200 transition-all shadow-sm space-y-3">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${classTagColor(cls.name)}`}>
            {cls.code}
          </span>
          <h4 className="text-sm font-black text-slate-800 mt-1">{cls.name}</h4>
        </div>
        <button
          onClick={() => onToggleStatus(flightId, cls.code)}
          className={`text-[10px] font-black px-2 py-0.5 rounded cursor-pointer transition-all ${statusColor}`}
          title="클릭하여 Open/Closed 전환"
        >
          {cls.status}
        </button>
      </div>

      {/* 운임 편집 */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase">현재 운임</span>
          {isEditingPrice ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={editState!.value}
                onChange={(e) => onEditChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") onCommit(); if (e.key === "Escape") onCancel(); }}
                className="w-28 border border-blue-400 rounded px-2 py-1 text-right text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-300"
                autoFocus
              />
              <button onClick={onCommit} className="text-emerald-600 hover:text-emerald-700"><CheckCircle size={15} /></button>
              <button onClick={onCancel} className="text-red-400 hover:text-red-500"><XIcon size={15} /></button>
            </div>
          ) : (
            <button
              onClick={() => onStartEdit(flightId, cls.code, "price", cls.price)}
              className="font-mono font-black text-slate-800 text-sm hover:text-blue-600 transition-colors underline decoration-dotted"
              title="클릭하여 운임 수정"
            >
              {fmtW(cls.price)}
            </button>
          )}
        </div>

        {/* AI 추천가 */}
        {hasDiff && (
          <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
            <div className="flex items-center gap-1.5">
              <Sparkles size={11} className="text-blue-500" />
              <span className="text-[10px] text-blue-600 font-bold">AI 추천</span>
              <span className={`text-[10px] font-black flex items-center gap-0.5 ${aiUp ? "text-red-500" : "text-blue-600"}`}>
                {aiUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {aiUp ? "+" : ""}{aiDiffPct}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-blue-700 text-xs">{fmtW(cls.aiPrice)}</span>
              <button
                onClick={() => onDetailAi(flightId, cls.code)}
                className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded font-bold hover:bg-purple-700 transition-colors"
              >
                상세 보기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 좌석 수 편집 + 판매율 바 */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-bold items-center">
          <span className="text-slate-400">판매율 {soldPct}%</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">{cls.sold} /</span>
            {isEditingSeats ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={editState!.value}
                  onChange={(e) => onEditChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") onCommit(); if (e.key === "Escape") onCancel(); }}
                  className="w-14 border border-blue-400 rounded px-1 py-0.5 text-center text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-300"
                  autoFocus
                />
                <button onClick={onCommit} className="text-emerald-600"><CheckCircle size={13} /></button>
                <button onClick={onCancel} className="text-red-400"><XIcon size={13} /></button>
              </div>
            ) : (
              <button
                onClick={() => onStartEdit(flightId, cls.code, "seats", cls.seats)}
                className="text-slate-600 font-black hover:text-blue-600 underline decoration-dotted transition-colors"
                title="클릭하여 좌석 수 수정"
              >
                {cls.seats}석
              </button>
            )}
          </div>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ${classBarColor(cls.name)}`}
            style={{ width: `${soldPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
