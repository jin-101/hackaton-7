# Component Methods
## 항공사 Revenue Management 가격관리 프로그램

> **Note**: 상세 비즈니스 로직은 CONSTRUCTION 단계 Functional Design에서 정의됩니다.
> 여기서는 메서드 시그니처와 입출력 타입을 정의합니다.

---

## Backend Service Methods

### BE-S01: FareService

```python
class FareService:
    def get_fares_by_route_date(
        self, route: str, date: date
    ) -> list[FlightFareDTO]
    # 특정 노선/날짜의 전체 편 운임 조회

    def get_fare_by_flight(
        self, flight_id: str
    ) -> FlightFareDTO
    # 특정 편의 클래스별 운임 조회

    def update_fare(
        self, flight_id: str, class_code: str, new_price: int, updated_by: str
    ) -> FareUpdateResultDTO
    # 운임 수동 수정 (BR-01, BR-04, BR-08 검증 포함)

    def get_price_history(
        self, flight_id: str, class_code: str | None = None
    ) -> list[PriceHistoryDTO]
    # 가격 변경 이력 조회

    def get_monthly_fares(
        self, route: str, year: int, month: int
    ) -> list[MonthlyFareDTO]
    # 월별 운임 조회
```

---

### BE-S02: AiRecommendationService

```python
class AiRecommendationService:
    def get_recommendations(
        self, route: str, date: date
    ) -> list[AiRecommendationDTO]
    # 특정 노선/날짜의 AI 추천 가격 목록 조회

    def approve_recommendation(
        self, recommendation_id: str, approved_by: str
    ) -> ApprovalResultDTO
    # AI 추천 수동 승인 (즉시 운임 반영, 이력 기록)

    def reject_recommendation(
        self, recommendation_id: str, rejected_by: str
    ) -> RejectionResultDTO
    # AI 추천 거부 (현행 운임 유지, 이력 기록)

    def run_auto_approval(
        self, flight_id: str
    ) -> AutoApprovalResultDTO
    # 허용 범위 내 자동 확정 실행 (BR-06)

    def set_auto_approval_config(
        self, config: AutoApprovalConfigDTO
    ) -> None
    # 자동 승인 허용 범위(상·하한) 설정

    def set_emergency_lock(
        self, flight_id: str | None, price_min: int, price_max: int, locked_by: str
    ) -> EmergencyLockResultDTO
    # 비상 가격 잠금 활성화 (BR-07)

    def release_emergency_lock(
        self, flight_id: str | None
    ) -> None
    # 비상 가격 잠금 해제

    def request_strategy_analysis(
        self, issue_text: str, route: str, date: date
    ) -> StrategyAnalysisDTO
    # AI 전략 분석 요청 (돌발 이슈 입력 → 전략 제안)

    def approve_strategy(
        self, strategy_id: str
    ) -> StrategyApprovalResultDTO
    # 전략 제안 승인 (운임/인벤토리 즉시 반영)
```

---

### BE-S03: CompetitorService

```python
class CompetitorService:
    def get_competitors_by_route(
        self, route: str, date: date
    ) -> list[CompetitorPriceDTO]
    # 노선/날짜 기준 경쟁사 가격 조회

    def get_price_comparison(
        self, route: str, date: date
    ) -> PriceComparisonDTO
    # 자사 vs 경쟁사 가격 비교 데이터 반환
```

---

### BE-S04: SimulationService

```python
class SimulationService:
    def run_simulation(
        self, params: SimulationParamsDTO
    ) -> SimulationResultDTO
    # What-if 시뮬레이션 실행
    # params: 유가변동율, 경쟁사진입여부, 가격변동율, 노선, 날짜

    def get_demand_forecast(
        self, route: str, date: date
    ) -> DemandForecastDTO
    # 수요 예측 결과 조회 (Mock)
```

---

### BE-S05: ReportService

```python
class ReportService:
    def generate_report(
        self, route: str | None, period_start: date, period_end: date
    ) -> ReportDTO
    # Yield Management 보고서 자동 생성

    def download_pdf(
        self, report_id: str
    ) -> bytes
    # 보고서 PDF 변환 및 반환

    def download_docx(
        self, report_id: str
    ) -> bytes
    # 보고서 docx 변환 및 반환

    def send_email(
        self, report_id: str, recipient_email: str
    ) -> bool
    # 보고서 이메일 전송
```

---

## Frontend Store Methods (Zustand)

### DashboardStore

```typescript
interface DashboardStore {
  selectedRoute: string
  selectedDate: string
  flights: FlightFareDTO[]
  classes: BookingClassDTO[]
  profitAnalysis: ProfitAnalysisDTO | null

  setRoute: (route: string) => void
  setDate: (date: string) => void
  fetchFlights: (route: string, date: string) => Promise<void>
  fetchClasses: (flightId: string) => Promise<void>
  requestStrategyAnalysis: (issueText: string) => Promise<StrategyAnalysisDTO>
  approveStrategy: (strategyId: string) => Promise<void>
}
```

### FareStore

```typescript
interface FareStore {
  fareData: FlightFareDTO | null
  priceHistory: PriceHistoryDTO[]

  fetchFare: (flightId: string) => Promise<void>
  updateFare: (flightId: string, classCode: string, newPrice: number) => Promise<void>
  fetchPriceHistory: (flightId: string) => Promise<void>
}
```

### AiRecommendationStore

```typescript
interface AiRecommendationStore {
  recommendations: AiRecommendationDTO[]
  autoApprovalConfig: AutoApprovalConfigDTO | null
  emergencyLock: EmergencyLockDTO | null

  fetchRecommendations: (route: string, date: string) => Promise<void>
  approveRecommendation: (recommendationId: string) => Promise<void>
  rejectRecommendation: (recommendationId: string) => Promise<void>
  setAutoApprovalConfig: (config: AutoApprovalConfigDTO) => Promise<void>
  setEmergencyLock: (flightId: string | null, min: number, max: number) => Promise<void>
  releaseEmergencyLock: (flightId: string | null) => Promise<void>
}
```

### SimulationStore

```typescript
interface SimulationStore {
  simulationParams: SimulationParamsDTO
  simulationResult: SimulationResultDTO | null

  setParams: (params: Partial<SimulationParamsDTO>) => void
  runSimulation: () => Promise<void>
}
```

### ReportStore

```typescript
interface ReportStore {
  reportData: ReportDTO | null
  reportStatus: 'idle' | 'generating' | 'ready' | 'error'

  generateReport: (route: string | null, start: string, end: string) => Promise<void>
  downloadPdf: (reportId: string) => Promise<void>
  downloadDocx: (reportId: string) => Promise<void>
  sendEmail: (reportId: string, email: string) => Promise<void>
}
```

---

## DTO (Data Transfer Objects) 주요 타입

```typescript
// 공통
interface FlightFareDTO {
  flightId: string
  flightNumber: string
  route: string
  departureTime: string
  timeSlot: 'morning' | 'forenoon' | 'afternoon' | 'evening'
  loadFactor: number       // 0~100
  pace: number             // 전주 대비 %
  currentPrice: number
  aiRecommendedPrice: number | null
  status: 'demand_surge' | 'stable' | 'low_demand' | 'critical'
  classes: BookingClassDTO[]
}

interface BookingClassDTO {
  classCode: string        // C, Y, B, M, S, K, L, T, V, G
  tier: 'prestige' | 'economy_full' | 'economy_discount' | 'economy_special'
  status: 'open' | 'closed' | 'sold_out'
  currentPrice: number
  aiRecommendedPrice: number | null
  soldSeats: number
  totalSeats: number
}

interface AiRecommendationDTO {
  recommendationId: string
  flightId: string
  classCode: string
  currentPrice: number
  recommendedPrice: number
  rationale: string        // 추천 근거 텍스트
  changePercent: number    // 현재가 대비 변동률
  requiresManualApproval: boolean
  createdAt: string
}

interface SimulationParamsDTO {
  route: string
  date: string
  fuelChangePercent: number        // 유가 변동율
  newCompetitorEntry: boolean      // 경쟁사 신규 진입
  priceChangePercent: number       // 가격 변동율
}

interface SimulationResultDTO {
  expectedDemandChange: number     // 예상 수요 변화율
  expectedRevenueChange: number    // 예상 수익 변화율
  optimalPriceRange: { min: number; max: number }
  chartData: { price: number; revenue: number }[]
}
```
