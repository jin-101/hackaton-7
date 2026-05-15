import { useState } from "react";
import { LayoutDashboard, Table2, Sparkles, Eye, Plane } from "lucide-react";
import Dashboard from "./components/Dashboard";
import FareManagement from "./components/FareManagement";
import AiRecommendations from "./components/AiRecommendations";
import CompetitorMonitor from "./components/CompetitorMonitor";
import { aiRecommendations } from "./data/mockData";

const NAV = [
  { id: "dashboard", label: "대시보드", icon: LayoutDashboard },
  { id: "fares", label: "운임 관리", icon: Table2 },
  { id: "ai", label: "AI 추천", icon: Sparkles },
  { id: "competitor", label: "경쟁사 모니터링", icon: Eye },
] as const;

type PageId = (typeof NAV)[number]["id"];

export default function App() {
  const [page, setPage] = useState<PageId>("dashboard");
  const pendingCount = aiRecommendations.filter((r) => r.status === "pending").length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shadow-sm fixed h-full z-10">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
            <Plane size={16} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-800 text-sm leading-tight">Revenue</div>
            <div className="font-bold text-blue-600 text-sm leading-tight">Manager</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = page === id;
            return (
              <button
                key={id}
                onClick={() => setPage(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={17} />
                {label}
                {id === "ai" && pendingCount > 0 && (
                  <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold ${active ? "bg-white/25 text-white" : "bg-amber-100 text-amber-700"}`}>
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
              RM
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-700">Revenue Manager</div>
              <div className="text-xs text-gray-400">관리자</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-56 min-h-screen">
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h1 className="font-bold text-gray-800">{NAV.find((n) => n.id === page)?.label}</h1>
            <p className="text-xs text-gray-400 mt-0.5">항공사 Revenue Management 시스템</p>
          </div>
          <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            📅 2026-05-15 기준
          </div>
        </header>

        <div className="p-8">
          {page === "dashboard" && <Dashboard />}
          {page === "fares" && <FareManagement />}
          {page === "ai" && <AiRecommendations />}
          {page === "competitor" && <CompetitorMonitor />}
        </div>
      </main>
    </div>
  );
}
