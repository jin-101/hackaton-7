import { create } from 'zustand';
import { buildDashboardFlights, KE_DOMESTIC_ROUTES } from '../data/mockData';
import type {
  FlightFareDTO, ProfitAnalysisDTO, StrategyAnalysisDTO,
} from '../types';

interface DashboardStore {
  selectedRoute: string;
  selectedDate: string;
  flights: FlightFareDTO[];
  profitAnalysis: ProfitAnalysisDTO | null;
  pendingStrategy: StrategyAnalysisDTO | null;
  isLoadingStrategy: boolean;

  setRoute: (route: string) => void;
  setDate: (date: string) => void;
  fetchFlights: (route: string, date: string) => Promise<void>;
  requestStrategyAnalysis: (issueText: string, flightId: string) => Promise<void>;
  approveStrategy: (strategyId: string) => void;
  dismissStrategy: () => void;
  computeProfitAnalysis: (flightId: string) => void;
}

function toFlightFareDTO(raw: ReturnType<typeof buildDashboardFlights>[number]): FlightFareDTO {
  return {
    flightId: raw.id,
    flightNumber: raw.id,
    route: '',
    departureTime: raw.time,
    timeSlot: raw.timeSlot === '아침' ? 'morning'
      : raw.timeSlot === '오전' ? 'forenoon'
      : raw.timeSlot === '오후' ? 'afternoon'
      : 'evening',
    loadFactor: raw.lf,
    pace: parseInt(raw.pace.replace('%', '').replace('+', ''), 10) || 0,
    currentPrice: raw.currentPrice,
    aiRecommendedPrice: raw.aiRecommended !== raw.currentPrice ? raw.aiRecommended : null,
    status: raw.status === '수요 급증' ? 'demand_surge'
      : raw.status === '안정적' ? 'stable'
      : raw.status === '수요 저조' ? 'low_demand'
      : 'critical',
    classes: raw.classes.map((c) => ({
      classCode: c.code,
      tier: c.name.includes('일등석') ? 'prestige'
        : c.name.includes('프레스티지') ? 'prestige'
        : c.name.includes('일반석') ? 'economy_full'
        : 'economy_special',
      status: c.status === 'Open' ? 'open'
        : c.status === 'Sold Out' ? 'sold_out'
        : 'closed',
      currentPrice: c.price,
      aiRecommendedPrice: c.aiPrice !== c.price ? c.aiPrice : null,
      soldSeats: c.sold,
      totalSeats: c.seats,
    })),
    baseCost: raw.baseCost,
    analysisReason: raw.reason,
  };
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  selectedRoute: KE_DOMESTIC_ROUTES[0],
  selectedDate: new Date().toISOString().slice(0, 10),
  flights: buildDashboardFlights(KE_DOMESTIC_ROUTES[0]).map(toFlightFareDTO).map((f) => ({
    ...f,
    route: KE_DOMESTIC_ROUTES[0],
  })),
  profitAnalysis: null,
  pendingStrategy: null,
  isLoadingStrategy: false,

  setRoute: (route) => {
    const flights = buildDashboardFlights(route).map(toFlightFareDTO).map((f) => ({
      ...f,
      route,
    }));
    set({ selectedRoute: route, flights });
  },

  setDate: (date) => set({ selectedDate: date }),

  fetchFlights: async (route, _date) => {
    const flights = buildDashboardFlights(route).map(toFlightFareDTO).map((f) => ({
      ...f,
      route,
    }));
    set({ flights, selectedRoute: route });
  },

  requestStrategyAnalysis: async (issueText, flightId) => {
    set({ isLoadingStrategy: true });
    await new Promise((r) => setTimeout(r, 1400));
    const { flights } = get();
    const flight = flights.find((f) => f.flightId === flightId);
    const recPrice = flight?.aiRecommendedPrice ?? flight?.currentPrice ?? 0;
    const up = flight ? (flight.aiRecommendedPrice ?? 0) > flight.currentPrice : false;
    set({
      pendingStrategy: {
        strategyId: `STRAT-${Date.now()}`,
        description: `"${issueText}" 분석 결과 — 고수요 고객 유입 약 15% 증가 예측. ${up ? '하위 클래스 인벤토리 즉시 회수 및 ' : ''}${flightId} 운임을 ₩${recPrice.toLocaleString()}으로 ${up ? '인상' : '조정'} 권고.`,
        flightId,
        recommendedPrice: recPrice,
        createdAt: new Date().toISOString(),
      },
      isLoadingStrategy: false,
    });
  },

  approveStrategy: (strategyId) => {
    const { pendingStrategy, flights } = get();
    if (!pendingStrategy || pendingStrategy.strategyId !== strategyId) return;
    const updated = flights.map((f) => {
      if (f.flightId !== pendingStrategy.flightId) return f;
      return {
        ...f,
        currentPrice: pendingStrategy.recommendedPrice,
        classes: f.classes.map((c) => ({
          ...c,
          currentPrice: c.aiRecommendedPrice ?? c.currentPrice,
        })),
      };
    });
    set({ flights: updated, pendingStrategy: null });
  },

  dismissStrategy: () => set({ pendingStrategy: null }),

  computeProfitAnalysis: (flightId) => {
    const { flights } = get();
    const flight = flights.find((f) => f.flightId === flightId);
    if (!flight) return;
    const revenue = flight.classes.reduce((s, c) => s + c.soldSeats * c.currentPrice, 0);
    const cost = flight.baseCost;
    const profit = revenue - cost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const soldSeats = flight.classes.reduce((s, c) => s + c.soldSeats, 0);
    set({
      profitAnalysis: {
        flightId,
        revenue,
        cost,
        profit,
        margin,
        soldSeats,
        loadFactor: flight.loadFactor,
      },
    });
  },
}));
