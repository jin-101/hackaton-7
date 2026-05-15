import { create } from 'zustand';
import { revenueHistory } from '../data/mockData';
import type { ReportDTO, ReportStatus } from '../types';

const ROUTE_PERF = [
  { route: 'GMP-CJU', revenue: 182_400_000, target: 160_000_000, loadFactor: 87 },
  { route: 'GMP-PUS', revenue: 94_500_000, target: 110_000_000, loadFactor: 58 },
  { route: 'ICN-CJU', revenue: 138_200_000, target: 130_000_000, loadFactor: 86 },
  { route: 'GMP-TAE', revenue: 41_800_000, target: 50_000_000, loadFactor: 48 },
];

const YIELD_DATA = [
  { month: '2월', yield: 82, target: 78 },
  { month: '3월', yield: 89, target: 82 },
  { month: '4월', yield: 85, target: 84 },
  { month: '5월', yield: 91, target: 86 },
];

interface ReportStore {
  reportData: ReportDTO | null;
  reportStatus: ReportStatus;
  emailInput: string;

  setEmailInput: (email: string) => void;
  generateReport: (route: string | null, start: string, end: string) => Promise<void>;
  downloadPdf: (reportId: string) => void;
  downloadDocx: (reportId: string) => void;
  sendEmail: (reportId: string, email: string) => Promise<boolean>;
}

export const useReportStore = create<ReportStore>((set, get) => ({
  reportData: null,
  reportStatus: 'idle',
  emailInput: '',

  setEmailInput: (email) => set({ emailInput: email }),

  generateReport: async (route, start, end) => {
    set({ reportStatus: 'generating' });
    await new Promise((r) => setTimeout(r, 1200));
    const totalRevenue = ROUTE_PERF.reduce((s, r) => s + r.revenue, 0);
    const totalTarget = ROUTE_PERF.reduce((s, r) => s + r.target, 0);
    set({
      reportData: {
        reportId: `RPT-${Date.now()}`,
        route,
        periodStart: start,
        periodEnd: end,
        totalRevenue,
        totalTarget,
        achieveRate: Math.round((totalRevenue / totalTarget) * 100),
        routePerformance: ROUTE_PERF,
        yieldTrend: YIELD_DATA,
        aiStats: { approvedCount: 3, rejectedCount: 1 },
        revenueHistory: revenueHistory,
        createdAt: new Date().toISOString(),
      },
      reportStatus: 'ready',
    });
  },

  downloadPdf: (_reportId) => {
    const { reportData } = get();
    if (!reportData) return;
    const content = `REVENUE MANAGEMENT REPORT\n\n총 수익: ${reportData.totalRevenue.toLocaleString()}원\n목표 달성률: ${reportData.achieveRate}%\n생성일: ${reportData.createdAt}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RM_Report_${reportData.reportId}.pdf.txt`;
    a.click();
    URL.revokeObjectURL(url);
  },

  downloadDocx: (_reportId) => {
    const { reportData } = get();
    if (!reportData) return;
    const content = `REVENUE MANAGEMENT REPORT\n\n총 수익: ${reportData.totalRevenue.toLocaleString()}원\n목표 달성률: ${reportData.achieveRate}%\n생성일: ${reportData.createdAt}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RM_Report_${reportData.reportId}.docx.txt`;
    a.click();
    URL.revokeObjectURL(url);
  },

  sendEmail: async (_reportId, _email) => {
    await new Promise((r) => setTimeout(r, 800));
    return true;
  },
}));
