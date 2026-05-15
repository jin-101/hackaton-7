export const ROUTES = ["GMP-CJU", "GMP-PUS", "ICN-CJU", "ICN-PUS", "GMP-TAE"];

export const BOOKING_CLASSES = ["Y", "B", "M", "K", "H", "Q"];

export interface Flight {
  id: string;
  route: string;
  flightNo: string;
  date: string;
  departureTime: string;
  totalSeats: number;
  bookedSeats: number;
}

export interface FareClass {
  flightId: string;
  bookingClass: string;
  fare: number;
  availableSeats: number;
  bookedSeats: number;
  status: "open" | "closed" | "waitlist";
}

export interface AiRecommendation {
  id: string;
  flightId: string;
  bookingClass: string;
  currentFare: number;
  recommendedFare: number;
  confidence: number;
  reason: string;
  predictedLoadFactor: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface CompetitorPrice {
  route: string;
  airline: string;
  bookingClass: string;
  fare: number;
  date: string;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  bookings: number;
}

export const flights: Flight[] = [
  { id: "F001", route: "GMP-CJU", flightNo: "KE1201", date: "2026-05-20", departureTime: "07:00", totalSeats: 180, bookedSeats: 142 },
  { id: "F002", route: "GMP-CJU", flightNo: "KE1203", date: "2026-05-20", departureTime: "10:30", totalSeats: 180, bookedSeats: 98 },
  { id: "F003", route: "GMP-CJU", flightNo: "KE1205", date: "2026-05-20", departureTime: "14:00", totalSeats: 180, bookedSeats: 160 },
  { id: "F004", route: "GMP-PUS", flightNo: "KE1401", date: "2026-05-20", departureTime: "08:00", totalSeats: 150, bookedSeats: 87 },
  { id: "F005", route: "ICN-CJU", flightNo: "OZ8901", date: "2026-05-20", departureTime: "09:00", totalSeats: 200, bookedSeats: 173 },
  { id: "F006", route: "GMP-CJU", flightNo: "KE1207", date: "2026-05-21", departureTime: "07:00", totalSeats: 180, bookedSeats: 65 },
  { id: "F007", route: "GMP-PUS", flightNo: "KE1403", date: "2026-05-21", departureTime: "11:00", totalSeats: 150, bookedSeats: 110 },
];

export const fareClasses: FareClass[] = [
  { flightId: "F001", bookingClass: "Y", fare: 158000, availableSeats: 10, bookedSeats: 10, status: "closed" },
  { flightId: "F001", bookingClass: "B", fare: 128000, availableSeats: 14, bookedSeats: 14, status: "closed" },
  { flightId: "F001", bookingClass: "M", fare: 108000, availableSeats: 20, bookedSeats: 20, status: "closed" },
  { flightId: "F001", bookingClass: "K", fare: 88000, availableSeats: 28, bookedSeats: 26, status: "open" },
  { flightId: "F001", bookingClass: "H", fare: 72000, availableSeats: 48, bookedSeats: 46, status: "open" },
  { flightId: "F001", bookingClass: "Q", fare: 58000, availableSeats: 60, bookedSeats: 26, status: "open" },
  { flightId: "F002", bookingClass: "Y", fare: 158000, availableSeats: 10, bookedSeats: 4, status: "open" },
  { flightId: "F002", bookingClass: "B", fare: 128000, availableSeats: 14, bookedSeats: 8, status: "open" },
  { flightId: "F002", bookingClass: "M", fare: 108000, availableSeats: 20, bookedSeats: 12, status: "open" },
  { flightId: "F002", bookingClass: "K", fare: 88000, availableSeats: 28, bookedSeats: 18, status: "open" },
  { flightId: "F002", bookingClass: "H", fare: 72000, availableSeats: 48, bookedSeats: 36, status: "open" },
  { flightId: "F002", bookingClass: "Q", fare: 58000, availableSeats: 60, bookedSeats: 20, status: "open" },
  { flightId: "F003", bookingClass: "Y", fare: 158000, availableSeats: 10, bookedSeats: 10, status: "closed" },
  { flightId: "F003", bookingClass: "B", fare: 128000, availableSeats: 14, bookedSeats: 14, status: "closed" },
  { flightId: "F003", bookingClass: "M", fare: 108000, availableSeats: 20, bookedSeats: 20, status: "closed" },
  { flightId: "F003", bookingClass: "K", fare: 88000, availableSeats: 28, bookedSeats: 28, status: "closed" },
  { flightId: "F003", bookingClass: "H", fare: 72000, availableSeats: 48, bookedSeats: 48, status: "waitlist" },
  { flightId: "F003", bookingClass: "Q", fare: 58000, availableSeats: 60, bookedSeats: 40, status: "open" },
];

export const aiRecommendations: AiRecommendation[] = [
  {
    id: "REC001",
    flightId: "F002",
    bookingClass: "Q",
    currentFare: 58000,
    recommendedFare: 48000,
    confidence: 87,
    reason: "출발 5일 전 저조한 탑승률(54%). 수요 탄력성 분석 결과 가격 인하 시 Load Factor 75% 달성 예상.",
    predictedLoadFactor: 75,
    status: "pending",
    createdAt: "2026-05-15T09:30:00Z",
  },
  {
    id: "REC002",
    flightId: "F003",
    bookingClass: "Q",
    currentFare: 58000,
    recommendedFare: 72000,
    confidence: 92,
    reason: "상위 클래스 전체 매진. 잔여 Q클래스 수요 집중 예상. 경쟁사 대비 14% 낮은 현행 운임.",
    predictedLoadFactor: 95,
    status: "pending",
    createdAt: "2026-05-15T09:32:00Z",
  },
  {
    id: "REC003",
    flightId: "F006",
    bookingClass: "H",
    currentFare: 72000,
    recommendedFare: 55000,
    confidence: 78,
    reason: "내일 출발 편 탑승률 36%로 매우 저조. 경쟁사 동일 시간대 운임 53,000원 대비 높은 수준.",
    predictedLoadFactor: 68,
    status: "pending",
    createdAt: "2026-05-15T09:35:00Z",
  },
  {
    id: "REC004",
    flightId: "F005",
    bookingClass: "K",
    currentFare: 88000,
    recommendedFare: 96000,
    confidence: 83,
    reason: "ICN-CJU 노선 주말 전 높은 수요. 현재 탑승률 86.5%. 수요 예측 모델 기준 인상 여력 있음.",
    predictedLoadFactor: 90,
    status: "approved",
    createdAt: "2026-05-15T08:10:00Z",
  },
  {
    id: "REC005",
    flightId: "F004",
    bookingClass: "M",
    currentFare: 108000,
    recommendedFare: 88000,
    confidence: 71,
    reason: "GMP-PUS 노선 탑승률 58%. 비성수기 패턴 감지. 가격 민감 고객층 유입 필요.",
    predictedLoadFactor: 72,
    status: "rejected",
    createdAt: "2026-05-15T07:50:00Z",
  },
];

export const competitorPrices: CompetitorPrice[] = [
  { route: "GMP-CJU", airline: "항공사 A", bookingClass: "Y", fare: 162000, date: "2026-05-20" },
  { route: "GMP-CJU", airline: "항공사 B", bookingClass: "Y", fare: 155000, date: "2026-05-20" },
  { route: "GMP-CJU", airline: "항공사 A", bookingClass: "M", fare: 112000, date: "2026-05-20" },
  { route: "GMP-CJU", airline: "항공사 B", bookingClass: "M", fare: 105000, date: "2026-05-20" },
  { route: "GMP-CJU", airline: "항공사 A", bookingClass: "Q", fare: 62000, date: "2026-05-20" },
  { route: "GMP-CJU", airline: "항공사 B", bookingClass: "Q", fare: 53000, date: "2026-05-20" },
  { route: "GMP-PUS", airline: "항공사 A", bookingClass: "Y", fare: 142000, date: "2026-05-20" },
  { route: "GMP-PUS", airline: "항공사 B", bookingClass: "Y", fare: 138000, date: "2026-05-20" },
  { route: "GMP-PUS", airline: "항공사 A", bookingClass: "Q", fare: 48000, date: "2026-05-20" },
  { route: "GMP-PUS", airline: "항공사 B", bookingClass: "Q", fare: 45000, date: "2026-05-20" },
  { route: "ICN-CJU", airline: "항공사 A", bookingClass: "Y", fare: 168000, date: "2026-05-20" },
  { route: "ICN-CJU", airline: "항공사 B", bookingClass: "Y", fare: 161000, date: "2026-05-20" },
];

export const revenueHistory: RevenueDataPoint[] = [
  { date: "5/8", revenue: 42800000, bookings: 412 },
  { date: "5/9", revenue: 38500000, bookings: 378 },
  { date: "5/10", revenue: 51200000, bookings: 498 },
  { date: "5/11", revenue: 47900000, bookings: 461 },
  { date: "5/12", revenue: 63400000, bookings: 612 },
  { date: "5/13", revenue: 71200000, bookings: 687 },
  { date: "5/14", revenue: 58700000, bookings: 563 },
  { date: "5/15", revenue: 44300000, bookings: 425 },
];
