# Frontend Components — UOW-01: RM-System

---

## 컴포넌트 계층 구조

```
App.tsx
├── Navigation (탭 바)
├── DashboardPage          ← US-01, US-02, US-03, US-07
├── FareManagementPage     ← US-06, US-15
├── AiRecommendationsPage  ← US-04, US-05(제거됨)
├── CompetitorMonitoringPage ← US-09, US-10
├── SimulatorPage          ← US-11, US-12
└── ReportPage             ← US-13, US-14
```

---

## DashboardPage

### Props / State (Zustand: DashboardStore)
```typescript
selectedRoute: string         // 선택된 노선 코드
selectedDate: string          // 선택된 날짜 (YYYY-MM-DD)
weekDays: WeekDay[]           // 주간 달력 7일
flights: FlightFareDTO[]      // 편 목록 + Tier 현황
selectedFlight: string | null // 선택된 편명
profitAnalysis: ProfitDTO     // Profit Analysis 패널 데이터
strategyInput: string         // AI 전략 분석 입력 텍스트
strategyProposal: StrategyDTO | null // AI 전략 제안 팝업 데이터
```

### 사용자 인터랙션 흐름
1. 노선 드롭다운 선택 → fetchFlights(route, date)
2. 달력 날짜 클릭 → setDate(date) → fetchFlights()
3. 이전/다음 주 버튼 → 주간 달력 이동
4. 편 행 클릭 → setSelectedFlight() → 등급 카드 갱신
5. AI 전략 분석 입력 → 분석 시작 버튼 → requestStrategyAnalysis()
6. 전략 제안 팝업 승인 → approveStrategy() / 기각 → 팝업 닫기

### API 연동 엔드포인트
- GET `/api/v1/dashboard?route={route}&date={date}`
- POST `/api/v1/recommendations/strategy`
- POST `/api/v1/recommendations/strategy/{id}/approve`

---

## FareManagementPage

### Props / State (Zustand: FareStore)
```typescript
selectedRoute: string
selectedFlight: string | null
fareData: FlightFareDTO | null
priceHistory: PriceHistoryDTO[]
editingTier: TierType | null   // 수정 중인 Tier
editPrice: number              // 입력 중인 가격
```

### 사용자 인터랙션 흐름
1. 노선/편 선택 → fetchFare(flightId)
2. Tier 카드 수정 버튼 클릭 → editingTier 설정
3. 가격 입력 → editPrice 업데이트
4. 저장 버튼 → updateFare(flightId, tier, editPrice)
   - 실패 시: 콘솔 로그 (에러 UI 없음)
5. 이력 탭 클릭 → fetchPriceHistory(flightId)

### 폼 검증 규칙
- editPrice > 0 필수 (저장 버튼 비활성화)
- Tier 계층 순서 경고 표시 (저장은 허용, 경고만)

### API 연동 엔드포인트
- GET `/api/v1/fares/{flightId}`
- PUT `/api/v1/fares/{flightId}/tiers/{tier}`
- GET `/api/v1/fares/{flightId}/history`

---

## AiRecommendationsPage

### Props / State (Zustand: AiRecommendationStore)
```typescript
selectedRoute: string
selectedDate: string
recommendations: AiRecommendationDTO[]  // status=PENDING인 목록
```

### 사용자 인터랙션 흐름
1. 노선/날짜 선택 → fetchRecommendations(route, date)
2. 추천 카드에서 근거 텍스트 확인
3. 승인 버튼 → approveRecommendation(recommendationId)
4. 거부 버튼 → rejectRecommendation(recommendationId)
5. 목록 자동 갱신 (승인/거부 후 해당 항목 제거)

### API 연동 엔드포인트
- GET `/api/v1/recommendations?route={route}&date={date}`
- POST `/api/v1/recommendations/{id}/approve`
- POST `/api/v1/recommendations/{id}/reject`

---

## CompetitorMonitoringPage

### Props / State
```typescript
selectedRoute: string
selectedDate: string
comparisonData: PriceComparisonDTO | null
```

### 사용자 인터랙션 흐름
1. 노선/날짜 선택 → fetchComparison(route, date)
2. 자사 vs 경쟁사 가격 비교 테이블/차트 표시

### API 연동 엔드포인트
- GET `/api/v1/competitors/comparison?route={route}&date={date}`

---

## SimulatorPage

### Props / State (Zustand: SimulationStore)
```typescript
params: SimulationParamsDTO
  route: string
  date: string
  fuelChangePct: number      // -50 ~ +100
  newCompetitorEntry: boolean
  priceChangePct: number     // -30 ~ +50
result: SimulationResultDTO | null
isLoading: boolean
```

### 사용자 인터랙션 흐름
1. 노선/날짜 선택
2. 슬라이더/체크박스로 변수 조정
3. 시뮬레이션 실행 버튼 → runSimulation()
4. 결과 차트 표시 (가격 vs 수익 곡선)

### API 연동 엔드포인트
- POST `/api/v1/simulation/run`

---

## ReportPage

### Props / State (Zustand: ReportStore)
```typescript
selectedRoute: string | null  // null = 전체 노선
periodStart: string
periodEnd: string
reportData: ReportDTO | null
reportStatus: 'idle' | 'generating' | 'ready' | 'error'
recipientEmail: string
```

### 사용자 인터랙션 흐름
1. 노선/기간 선택
2. 보고서 생성 버튼 → generateReport()
3. 미리보기 렌더링 (ReportDTO 기반)
4. PDF 다운로드 버튼 → downloadPdf()
5. docx 다운로드 버튼 → downloadDocx()
6. 이메일 입력 → 전송 버튼 → sendEmail()

### API 연동 엔드포인트
- POST `/api/v1/reports/generate`
- GET `/api/v1/reports/{id}/pdf`
- GET `/api/v1/reports/{id}/docx`
- POST `/api/v1/reports/{id}/email`

---

## 공통 사항

### 에러 처리
- 모든 API 실패: `console.error(error)` 출력, UI 변화 없음

### 상태 초기값
- 앱 시작 시 기본 노선: GMP-CJU
- 기본 날짜: 오늘

### Mock 데이터 전환
- Phase 1: `src/data/mockData.ts` 사용
- Phase 4: ApiClient를 통해 Backend REST API로 교체
