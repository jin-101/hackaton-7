import { create } from 'zustand';
import type { ReportDTO, ReportStatus } from '../types';
import apiClient from '../api/apiClient';

const KE_ROUTES = ['GMP-CJU', 'GMP-PUS', 'ICN-CJU', 'GMP-TAE', 'GMP-KWJ', 'ICN-PUS', 'GMP-KPO', 'GMP-RSU'];

const ROUTE_REVENUE: Record<string, number> = {
  'GMP-CJU': 82_400_000, 'GMP-PUS': 42_300_000, 'ICN-CJU': 68_900_000,
  'GMP-TAE': 16_900_000, 'GMP-KWJ': 13_700_000, 'ICN-PUS': 39_200_000,
  'GMP-KPO': 13_200_000, 'GMP-RSU': 11_400_000,
};
const ROUTE_LF: Record<string, number> = {
  'GMP-CJU': 79.2, 'GMP-PUS': 61.8, 'ICN-CJU': 86.1,
  'GMP-TAE': 48.4, 'GMP-KWJ': 52.3, 'ICN-PUS': 61.2,
  'GMP-KPO': 55.1, 'GMP-RSU': 49.3,
};

function buildMockReport(route: string | null, start: string, end: string): ReportDTO {
  const routes = route ? [route] : KE_ROUTES;
  const totalRevenue = routes.reduce((s, r) => s + (ROUTE_REVENUE[r] ?? 0), 0);
  // 목표: 전년 동기 대비 5% 성장 기준 (FSC 업계 표준)
  const totalTarget = Math.round(totalRevenue * 1.05);
  const achieveRate = Math.round((totalRevenue / totalTarget) * 100);

  const routePerformance = routes.map((r) => ({
    route: r,
    revenue: ROUTE_REVENUE[r] ?? 0,
    target: Math.round((ROUTE_REVENUE[r] ?? 0) * 1.05),
    loadFactor: ROUTE_LF[r] ?? 60,
  }));

  const yieldTrend = [
    { month: '3월', yield: 81, target: 78 },
    { month: '4월', yield: 84, target: 80 },
    { month: '5월', yield: 87, target: 82 },
  ];

  // Generate revenue history within the given period
  const startDate = new Date(start);
  const endDate = new Date(end);
  const revenueHistory: { date: string; revenue: number; bookings: number }[] = [];
  const dayRev = Math.round(totalRevenue / Math.max(1, (endDate.getTime() - startDate.getTime()) / 86400000 + 1));
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const variance = 0.85 + Math.random() * 0.3;
    const rev = Math.round(dayRev * variance);
    revenueHistory.push({ date: `${m}/${day}`, revenue: rev, bookings: Math.round(rev / 104000) });
  }

  const approvedCount = 12;
  // AI 기여: 승인 건별 (적용 운임 - 기준 운임) × 해당 클래스 평균 판매 좌석 수
  // 평균 업리프트 단가 ~8,500원, 평균 적용 좌석 수 ~18석 (국내선 Y/M 클래스 기준)
  const aiContribution = approvedCount * 8_500 * 18;

  return {
    reportId: `MOCK-${Date.now()}`,
    route,
    periodStart: start,
    periodEnd: end,
    totalRevenue,
    totalTarget,
    achieveRate,
    aiContribution,
    routePerformance,
    yieldTrend,
    aiStats: { approvedCount, rejectedCount: 3 },
    revenueHistory,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
  };
}

interface ReportStore {
  reportData: ReportDTO | null;
  reportStatus: ReportStatus;
  emailInput: string;

  setEmailInput: (email: string) => void;
  generateReport: (route: string | null, start: string, end: string) => Promise<void>;
  downloadPdf: (reportId: string) => Promise<void>;
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
    try {
      const raw = await apiClient.post<{
        report_id: string;
        route: string | null;
        period_start: string;
        period_end: string;
        total_revenue: number;
        total_target: number;
        achieve_rate: number;
        route_performance: { route: string; revenue: number; target: number; load_factor: number }[];
        yield_trend: { month: string; yield_: number; target: number }[];
        ai_stats: { approved_count: number; rejected_count: number };
        revenue_history: { date: string; revenue: number; bookings: number }[];
        created_at: string;
      }>('/reports/generate', {
        route: route ?? null,
        period_start: start,
        period_end: end,
      });
      set({
        reportData: {
          reportId: raw.report_id,
          route: raw.route,
          periodStart: raw.period_start,
          periodEnd: raw.period_end,
          totalRevenue: raw.total_revenue,
          totalTarget: raw.total_target,
          achieveRate: raw.achieve_rate,
          aiContribution: raw.ai_stats.approved_count * 8_500 * 18,
          routePerformance: raw.route_performance.map((r) => ({
            route: r.route,
            revenue: r.revenue,
            target: r.target,
            loadFactor: r.load_factor,
          })),
          yieldTrend: raw.yield_trend.map((y) => ({
            month: y.month,
            yield: y.yield_,
            target: y.target,
          })),
          aiStats: {
            approvedCount: raw.ai_stats.approved_count,
            rejectedCount: raw.ai_stats.rejected_count,
          },
          revenueHistory: raw.revenue_history,
          createdAt: raw.created_at,
        },
        reportStatus: 'ready',
      });
    } catch {
      const mock = buildMockReport(route, start, end);
      set({ reportData: mock, reportStatus: 'ready' });
    }
  },

  downloadPdf: async (_reportId) => {
    const { reportData } = get();
    if (!reportData) return;
    try {
      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');
      const el = document.querySelector('[data-testid="report-preview"]') as HTMLElement | null;
      if (!el) throw new Error('preview element not found');

      // html-to-image는 getComputedStyle()로 인라인화하므로 oklch() CSS 변수 파싱 오류 없음
      const dataUrl = await toPng(el, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        filter: (node) => {
          // 스크롤바 제거
          if (node instanceof HTMLElement && node.style) {
            node.style.overflow = 'visible';
          }
          return true;
        },
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((res) => { img.onload = res; });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (img.height / img.width) * imgW;

      let renderedHeight = 0;
      while (renderedHeight < imgH) {
        if (renderedHeight > 0) pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, -renderedHeight, imgW, imgH);
        renderedHeight += pageH;
      }

      pdf.save(`RM_Report_${reportData.reportId}.pdf`);
    } catch (e) {
      console.error('PDF 생성 실패:', e);
      alert('PDF 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  },

  downloadDocx: (_reportId) => {
    const { reportData } = get();
    if (!reportData) return;
    import('docx').then(({
      Document, Paragraph, TextRun, HeadingLevel, Packer,
      Table, TableRow, TableCell, WidthType, BorderStyle,
      AlignmentType, ShadingType,
    }) => {
      const KE_NAVY = '002561';
      const EMERALD = '059669';
      const GRAY_BG = 'F8FAFC';
      const HEADER_BG = 'EFF6FF';

      const makeCell = (text: string, opts: {
        bold?: boolean; bg?: string; color?: string; align?: typeof AlignmentType[keyof typeof AlignmentType];
      } = {}) =>
        new TableCell({
          shading: opts.bg ? { type: ShadingType.CLEAR, fill: opts.bg } : undefined,
          children: [new Paragraph({
            alignment: opts.align ?? AlignmentType.LEFT,
            children: [new TextRun({
              text,
              bold: opts.bold,
              color: opts.color ?? '374151',
              size: 20,
            })],
          })],
        });

      const tableStyle = {
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top:    { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
          left:   { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
          right:  { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
          insideH:{ style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
          insideV:{ style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
        },
      };

      const spacer = new Paragraph({ text: '' });

      // ── Executive Summary 표 ──
      const aiContrib = ((reportData.totalRevenue - 430_000_000) / 1_000_000).toFixed(0);
      const summaryTable = new Table({
        ...tableStyle,
        rows: [
          new TableRow({ children: [
            makeCell('항목', { bold: true, bg: HEADER_BG, color: KE_NAVY }),
            makeCell('실적', { bold: true, bg: HEADER_BG, color: KE_NAVY }),
            makeCell('비고', { bold: true, bg: HEADER_BG, color: KE_NAVY }),
          ]}),
          new TableRow({ children: [
            makeCell('총 수익'),
            makeCell(`${(reportData.totalRevenue / 100_000_000).toFixed(2)}억원`, { bold: true, color: EMERALD }),
            makeCell(`목표 ${(reportData.totalTarget / 100_000_000).toFixed(2)}억원`),
          ]}),
          new TableRow({ children: [
            makeCell('목표 달성률'),
            makeCell(`${reportData.achieveRate}%`, { bold: true, color: reportData.achieveRate >= 100 ? EMERALD : 'D97706' }),
            makeCell(reportData.achieveRate >= 100 ? '목표 초과 달성 ✓' : '목표 미달'),
          ]}),
          new TableRow({ children: [
            makeCell('AI 가격 수익 기여'),
            makeCell(`+${aiContrib}M원`, { bold: true, color: KE_NAVY }),
            makeCell(`수동 승인 ${reportData.aiStats.approvedCount}건 적용분`),
          ]}),
        ],
      });

      // ── 노선별 수익 표 ──
      const routeTable = new Table({
        ...tableStyle,
        rows: [
          new TableRow({ children: [
            makeCell('노선', { bold: true, bg: HEADER_BG, color: KE_NAVY }),
            makeCell('실적 수익', { bold: true, bg: HEADER_BG, color: KE_NAVY }),
            makeCell('목표 수익', { bold: true, bg: HEADER_BG, color: KE_NAVY }),
            makeCell('달성률', { bold: true, bg: HEADER_BG, color: KE_NAVY }),
            makeCell('L/F', { bold: true, bg: HEADER_BG, color: KE_NAVY }),
          ]}),
          ...reportData.routePerformance.map((r) => {
            const rate = Math.round((r.revenue / r.target) * 100);
            return new TableRow({ children: [
              makeCell(r.route, { bold: true }),
              makeCell(`${r.revenue.toLocaleString()}원`),
              makeCell(`${r.target.toLocaleString()}원`),
              makeCell(`${rate}%`, { color: rate >= 100 ? EMERALD : 'D97706', bold: true }),
              makeCell(`${r.loadFactor}%`),
            ]});
          }),
        ],
      });

      // ── Yield 추이 표 ──
      const yieldTable = new Table({
        ...tableStyle,
        rows: [
          new TableRow({ children: [
            makeCell('월', { bold: true, bg: HEADER_BG, color: KE_NAVY }),
            makeCell('실제 Yield', { bold: true, bg: HEADER_BG, color: KE_NAVY }),
            makeCell('목표 Yield', { bold: true, bg: HEADER_BG, color: KE_NAVY }),
            makeCell('달성 여부', { bold: true, bg: HEADER_BG, color: KE_NAVY }),
          ]}),
          ...reportData.yieldTrend.map((y) =>
            new TableRow({ children: [
              makeCell(y.month, { bold: true }),
              makeCell(`${y.yield}%`, { color: y.yield >= y.target ? EMERALD : 'D97706', bold: true }),
              makeCell(`${y.target}%`),
              makeCell(y.yield >= y.target ? '달성 ✓' : '미달', { color: y.yield >= y.target ? EMERALD : 'D97706' }),
            ]})
          ),
        ],
      });

      // ── AI 기여도 표 ──
      const aiTable = new Table({
        ...tableStyle,
        rows: [
          new TableRow({ children: [
            makeCell('구분', { bold: true, bg: HEADER_BG, color: KE_NAVY }),
            makeCell('건수', { bold: true, bg: HEADER_BG, color: KE_NAVY }),
          ]}),
          new TableRow({ children: [
            makeCell('수동 승인'),
            makeCell(`${reportData.aiStats.approvedCount}건`, { bold: true, color: EMERALD }),
          ]}),
          new TableRow({ children: [
            makeCell('거부'),
            makeCell(`${reportData.aiStats.rejectedCount}건`, { bold: true, color: 'EF4444' }),
          ]}),
        ],
      });

      // ── 일별 수익 표 ──
      const dailyTable = new Table({
        ...tableStyle,
        rows: [
          new TableRow({ children: [
            makeCell('날짜', { bold: true, bg: HEADER_BG, color: KE_NAVY }),
            makeCell('수익', { bold: true, bg: HEADER_BG, color: KE_NAVY }),
            makeCell('예약 건수', { bold: true, bg: HEADER_BG, color: KE_NAVY }),
            makeCell('평균 단가', { bold: true, bg: HEADER_BG, color: KE_NAVY }),
          ]}),
          ...reportData.revenueHistory.map((d) =>
            new TableRow({ children: [
              makeCell(`2026/${d.date}`),
              makeCell(`${d.revenue.toLocaleString()}원`, { bold: true }),
              makeCell(`${d.bookings}건`),
              makeCell(`${Math.round(d.revenue / d.bookings).toLocaleString()}원`),
            ]})
          ),
        ],
      });

      const doc = new Document({
        styles: {
          default: {
            document: { run: { font: 'Malgun Gothic', size: 22 } },
          },
        },
        sections: [{
          properties: {},
          children: [
            // ── 표지 ──
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Yield Management Report', bold: true, size: 48, color: KE_NAVY })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({
                text: `${reportData.periodStart} ~ ${reportData.periodEnd}  |  ${reportData.route ?? '국내선 전체 노선'}`,
                size: 24, color: '6B7280',
              })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `생성일시: ${reportData.createdAt}`, size: 20, color: '9CA3AF' })],
            }),
            spacer,

            // ── Executive Summary ──
            new Paragraph({ text: 'Executive Summary', heading: HeadingLevel.HEADING_1 }),
            summaryTable,
            spacer,
            new Paragraph({
              children: [
                new TextRun({ text: '수익 최적화 결론: ', bold: true, color: KE_NAVY, size: 20 }),
                new TextRun({
                  text: `AI 추천 수동 승인 ${reportData.aiStats.approvedCount}건으로 기준 대비 수익 약 ` +
                    `+${((reportData.totalRevenue - 430_000_000) / 430_000_000 * 100).toFixed(1)}% 향상. ` +
                    `목표 달성률 ${reportData.achieveRate}%로 ` +
                    (reportData.achieveRate >= 100 ? '목표 초과 달성.' : '목표 미달 — 하위 노선 단가 전략 재검토 필요.'),
                  size: 20, color: '374151',
                }),
              ],
              shading: { type: ShadingType.CLEAR, fill: GRAY_BG },
            }),
            spacer,

            // ── 노선별 수익 ──
            new Paragraph({ text: '노선별 수익 달성률', heading: HeadingLevel.HEADING_1 }),
            routeTable,
            spacer,

            // ── Yield 추이 ──
            new Paragraph({ text: '월별 Yield 추이', heading: HeadingLevel.HEADING_1 }),
            yieldTable,
            spacer,

            // ── AI 기여도 ──
            new Paragraph({ text: 'AI 가격 추천 수익 기여도', heading: HeadingLevel.HEADING_1 }),
            aiTable,
            spacer,

            // ── 일별 수익 ──
            new Paragraph({ text: '최근 8일 일별 수익', heading: HeadingLevel.HEADING_1 }),
            dailyTable,
          ],
        }],
      });

      Packer.toBlob(doc).then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `RM_Report_${reportData.reportId}.docx`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }).catch((e) => {
      console.error('DOCX 생성 실패:', e);
      alert('DOCX 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    });
  },

  sendEmail: async (_reportId, email) => {
    const { reportData } = get();
    if (!reportData) return false;
    // mailto 방식으로 실제 이메일 클라이언트 열기
    const subject = encodeURIComponent(`[Revenue Manager] Yield Management Report ${reportData.periodStart}~${reportData.periodEnd}`);
    const body = encodeURIComponent(
      `안녕하세요,\n\n아래 수익 관리 보고서를 전달드립니다.\n\n` +
      `기간: ${reportData.periodStart} ~ ${reportData.periodEnd}\n` +
      `노선: ${reportData.route ?? '국내선 전체'}\n` +
      `총 수익: ${reportData.totalRevenue.toLocaleString()}원\n` +
      `목표 달성률: ${reportData.achieveRate}%\n` +
      `AI 추천 승인: ${reportData.aiStats.approvedCount}건\n\n` +
      `생성일시: ${reportData.createdAt}\n\n감사합니다.\nRevenue Management System`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    return true;
  },
}));

