import { useState, useCallback } from "react";
import { Table2, LayoutDashboard, Eye, FlaskConical, FileText, Plane, RefreshCw } from "lucide-react";
import FareManagement from "./components/FareManagement";
import Dashboard from "./components/Dashboard";
import CompetitorMonitor from "./components/CompetitorMonitor";
import Simulator from "./components/Simulator";
import Report from "./components/Report";

const NAV = [
  { id: "dashboard",  label: "대시보드",         icon: LayoutDashboard },
  { id: "fares",      label: "운임 관리",         icon: Table2 },
  { id: "competitor", label: "경쟁사 모니터링",   icon: Eye },
  { id: "simulator",  label: "시뮬레이터",        icon: FlaskConical },
  { id: "report",     label: "보고서",            icon: FileText },
] as const;

type PageId = (typeof NAV)[number]["id"];

function formatNow() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function App() {
  const [page, setPage] = useState<PageId>("dashboard");
  const [lastUpdated, setLastUpdated] = useState(formatNow);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setLastUpdated(formatNow());
      setRefreshKey((k) => k + 1);
      setRefreshing(false);
    }, 600);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex" data-testid="app-root">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shadow-sm fixed h-full z-10">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#002561,#0051c8)" }}
          >
            <Plane size={16} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-800 text-sm leading-tight">Revenue</div>
            <div className="font-bold text-sm leading-tight" style={{ color: "#002561" }}>Manager</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1" data-testid="sidebar-nav">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = page === id;
            return (
              <button
                key={id}
                data-testid={`nav-${id}`}
                onClick={() => setPage(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active ? "text-white shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                style={active ? { backgroundColor: "#002561" } : {}}
              >
                <Icon size={17} />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: "#002561" }}
            >
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
            <p className="text-xs text-gray-400 mt-0.5">대한항공 Revenue Management 시스템</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              📅 {lastUpdated} 기준
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1.5 rounded-full border border-gray-100 bg-gray-50 text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all disabled:opacity-50"
              title="데이터 새로고침"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        <div className={page === "fares" ? "" : "p-8"}>
          {page === "dashboard"  && <Dashboard key={refreshKey} />}
          {page === "fares"      && <FareManagement key={refreshKey} />}
          {page === "competitor" && <CompetitorMonitor key={refreshKey} />}
          {page === "simulator"  && <Simulator key={refreshKey} />}
          {page === "report"     && <Report key={refreshKey} />}
        </div>
      </main>
    </div>
  );
}
