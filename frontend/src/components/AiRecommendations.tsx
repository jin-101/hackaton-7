import { useAiRecommendationStore } from "../stores/aiRecommendationStore";
import { TrendingUp, TrendingDown, CheckCircle, XCircle, Clock, Sparkles } from "lucide-react";
import type { AiRecommendationDTO } from "../types";

const statusConfig = {
  pending: { label: "대기중", icon: <Clock size={14} />, cls: "bg-amber-100 text-amber-700" },
  approved: { label: "승인됨", icon: <CheckCircle size={14} />, cls: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "거부됨", icon: <XCircle size={14} />, cls: "bg-red-100 text-red-600" },
};

export default function AiRecommendations() {
  const { recommendations, approveRecommendation, rejectRecommendation } = useAiRecommendationStore();

  const pendingCount = recommendations.filter((r) => r.status === "pending").length;
  const approvedCount = recommendations.filter((r) => r.status === "approved").length;
  const rejectedCount = recommendations.filter((r) => r.status === "rejected").length;

  return (
    <div className="space-y-5" data-testid="ai-recommendations-page">
      <div className="flex items-center gap-2">
        <Sparkles size={20} className="text-purple-500" />
        <h2 className="text-xl font-bold text-gray-800">AI 가격 추천</h2>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3 flex-wrap" data-testid="recommendation-summary">
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-center min-w-[90px]">
          <div className="text-2xl font-bold text-amber-600" data-testid="pending-count">{pendingCount}</div>
          <div className="text-xs text-gray-500 mt-0.5">승인 대기</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-center min-w-[90px]">
          <div className="text-2xl font-bold text-emerald-600" data-testid="approved-count">{approvedCount}</div>
          <div className="text-xs text-gray-500 mt-0.5">승인됨</div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-center min-w-[90px]">
          <div className="text-2xl font-bold text-red-400" data-testid="rejected-count">{rejectedCount}</div>
          <div className="text-xs text-gray-500 mt-0.5">거부됨</div>
        </div>
      </div>

      {/* Recommendation list */}
      <div className="space-y-3" data-testid="recommendation-list">
        {recommendations.map((rec) => (
          <RecommendationCard
            key={rec.recommendationId}
            rec={rec}
            onApprove={approveRecommendation}
            onReject={rejectRecommendation}
          />
        ))}
        {recommendations.length === 0 && (
          <div className="text-center py-12 text-gray-400" data-testid="empty-state">
            <Sparkles size={32} className="mx-auto mb-2 opacity-30" />
            <p>AI 추천이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RecommendationCard({
  rec,
  onApprove,
  onReject,
}: {
  rec: AiRecommendationDTO;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const isUp = rec.recommendedPrice > rec.currentPrice;
  const diff = Math.abs(rec.recommendedPrice - rec.currentPrice);
  const pct = Math.round((diff / rec.currentPrice) * 100);
  const cfg = statusConfig[rec.status];

  return (
    <div
      data-testid={`recommendation-card-${rec.recommendationId}`}
      className={`bg-white rounded-xl border shadow-sm p-5 transition-all ${
        rec.status === "pending"
          ? "border-amber-200"
          : rec.status === "approved"
          ? "border-emerald-200"
          : "border-gray-100 opacity-70"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {rec.classCode}
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-800">{rec.flightNumber}</span>
              <span className="text-gray-500 text-sm">{rec.route}</span>
              <span className="text-gray-400 text-sm">{rec.departureTime}</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="text-gray-400 text-sm">
                <span className="line-through">{rec.currentPrice.toLocaleString()}원</span>
              </div>
              <span className="text-gray-300">→</span>
              <div className={`font-bold text-lg ${isUp ? "text-red-600" : "text-blue-600"}`}>
                {rec.recommendedPrice.toLocaleString()}원
              </div>
              <div className={`flex items-center gap-0.5 text-sm font-semibold ${isUp ? "text-red-500" : "text-blue-500"}`}>
                {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {isUp ? "+" : "-"}{pct}%
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{rec.rationale}</p>
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

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.cls}`}>
            {cfg.icon}{cfg.label}
          </span>
          {rec.status === "pending" && (
            <div className="flex gap-2 mt-1">
              <button
                data-testid={`reject-btn-${rec.recommendationId}`}
                onClick={() => onReject(rec.recommendationId)}
                className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
              >
                거부
              </button>
              <button
                data-testid={`approve-btn-${rec.recommendationId}`}
                onClick={() => onApprove(rec.recommendationId)}
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
}
