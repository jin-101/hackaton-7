import { useState } from "react";
import { aiRecommendations as initialRecs, flights } from "../data/mockData";
import type { AiRecommendation } from "../data/mockData";
import { TrendingUp, TrendingDown, CheckCircle, XCircle, Clock, Sparkles } from "lucide-react";

const statusConfig = {
  pending: { label: "대기중", icon: <Clock size={14} />, cls: "bg-amber-100 text-amber-700" },
  approved: { label: "승인됨", icon: <CheckCircle size={14} />, cls: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "거부됨", icon: <XCircle size={14} />, cls: "bg-red-100 text-red-600" },
};

export default function AiRecommendations() {
  const [recs, setRecs] = useState<AiRecommendation[]>(initialRecs);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const approve = (id: string) =>
    setRecs((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved" } : r));
  const reject = (id: string) =>
    setRecs((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" } : r));

  const filtered = filter === "all" ? recs : recs.filter((r) => r.status === filter);

  const getFlight = (id: string) => flights.find((f) => f.id === id);

  const counts = {
    all: recs.length,
    pending: recs.filter((r) => r.status === "pending").length,
    approved: recs.filter((r) => r.status === "approved").length,
    rejected: recs.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles size={20} className="text-purple-500" />
        <h2 className="text-xl font-bold text-gray-800">AI 가격 추천</h2>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              filter === s
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-500 border-gray-200 hover:border-blue-300"
            }`}
          >
            {s === "all" ? "전체" : statusConfig[s].label}
            <span className="ml-1.5 text-xs opacity-75">({counts[s]})</span>
          </button>
        ))}
      </div>

      {/* Recommendation cards */}
      <div className="space-y-3">
        {filtered.map((rec) => {
          const flight = getFlight(rec.flightId);
          const isUp = rec.recommendedFare > rec.currentFare;
          const diff = Math.abs(rec.recommendedFare - rec.currentFare);
          const pct = Math.round((diff / rec.currentFare) * 100);
          const cfg = statusConfig[rec.status];

          return (
            <div
              key={rec.id}
              className={`bg-white rounded-xl border shadow-sm p-5 transition-all ${
                rec.status === "pending"
                  ? "border-amber-200"
                  : rec.status === "approved"
                  ? "border-emerald-200"
                  : "border-gray-100 opacity-70"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                {/* Left: flight info + recommendation */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {rec.bookingClass}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-800">{flight?.flightNo}</span>
                      <span className="text-gray-500 text-sm">{flight?.route}</span>
                      <span className="text-gray-400 text-sm">{flight?.date} {flight?.departureTime}</span>
                    </div>

                    {/* Fare comparison */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="text-gray-400 text-sm">
                        <span className="line-through">{rec.currentFare.toLocaleString()}원</span>
                      </div>
                      <span className="text-gray-300">→</span>
                      <div className={`font-bold text-lg ${isUp ? "text-red-600" : "text-blue-600"}`}>
                        {rec.recommendedFare.toLocaleString()}원
                      </div>
                      <div className={`flex items-center gap-0.5 text-sm font-semibold ${isUp ? "text-red-500" : "text-blue-500"}`}>
                        {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {isUp ? "+" : "-"}{pct}%
                      </div>
                    </div>

                    {/* AI reason */}
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">{rec.reason}</p>

                    {/* Confidence + predicted LF */}
                    <div className="flex items-center gap-4 mt-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">AI 신뢰도</span>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                            style={{ width: `${rec.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-purple-600">{rec.confidence}%</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        예측 LF <span className="font-semibold text-gray-700">{rec.predictedLoadFactor}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: status / action */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.cls}`}>
                    {cfg.icon}{cfg.label}
                  </span>
                  {rec.status === "pending" && (
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => reject(rec.id)}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
                      >
                        거부
                      </button>
                      <button
                        onClick={() => approve(rec.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        승인
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Sparkles size={32} className="mx-auto mb-2 opacity-30" />
            <p>해당하는 추천이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
