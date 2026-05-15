# Services
## 항공사 Revenue Management 가격관리 프로그램

---

## 서비스 계층 개요

```
Frontend (Zustand Stores)
    │  REST API calls
    ▼
FastAPI Routers (Controllers)
    │  Service calls
    ▼
Service Layer ──────────────────────────────────────────────
│  FareService  │  AiRecommendationService  │  CompetitorService  │
│  SimulationService  │  ReportService                           │
─────────────────────────────────────────────────────────────
    │  Repository calls
    ▼
Repository Layer
    │  SQLAlchemy ORM
    ▼
SQLite Database

AI/ML Mock Engines (백엔드 내 모듈)
    AiMockEngine ← AiRecommendationService
    SimulationMockEngine ← SimulationService
```

---

## 서비스별 오케스트레이션

### BE-S01: FareService — 운임 관리

**역할**: 운임 데이터의 모든 읽기/쓰기 비즈니스 로직 담당

**오케스트레이션 흐름**:
1. **운임 조회**: Router → FareService.get_fares_by_route_date() → FareRepository → DB
2. **운임 수정**: Router → FareService.update_fare() → [비즈니스 규칙 검증(BR-01, BR-04, BR-08)] → FareRepository → PriceHistoryRepository → DB
3. **이력 조회**: Router → FareService.get_price_history() → PriceHistoryRepository → DB

**외부 의존성**: 없음 (순수 데이터 서비스)

---

### BE-S02: AiRecommendationService — AI 추천 & 하이브리드 승인

**역할**: AI 추천 생성, 자동/수동 승인, 비상 잠금의 핵심 오케스트레이터

**오케스트레이션 흐름**:

1. **추천 생성**:
   Router → AiRecommendationService.get_recommendations()
   → FareRepository (현재 운임 조회)
   → AiMockEngine.generate_recommendation() (추천가 계산)
   → [BR-03 범위 검증: 현재가 -30%~+50%]
   → requiresManualApproval 플래그 설정
   → 결과 반환

2. **수동 승인**:
   Router → AiRecommendationService.approve_recommendation()
   → [비상 잠금 확인 (BR-07)]
   → FareRepository.update() (즉시 반영, BR-05)
   → PriceHistoryRepository.create() (이력 기록: AI_APPROVED)

3. **자동 승인 실행**:
   Router → AiRecommendationService.run_auto_approval()
   → [자동 승인 설정 범위 확인 (BR-06)]
   → 범위 내: FareRepository.update() → PriceHistoryRepository.create(AUTO_APPROVED)
   → 범위 초과: 수동 승인 요청 알림 반환

4. **비상 잠금**:
   Router → AiRecommendationService.set_emergency_lock()
   → EmergencyLockConfig 저장
   → 이후 모든 AI 자동 승인 차단 (BR-07)

5. **전략 분석**:
   Router → AiRecommendationService.request_strategy_analysis()
   → AiMockEngine.analyze_strategy(issue_text)
   → StrategyAnalysisDTO 반환 (변경 여부, 제안 내용, 근거)

**핵심 비즈니스 규칙**: BR-03, BR-05, BR-06, BR-07

---

### BE-S03: CompetitorService — 경쟁사 모니터링

**역할**: 경쟁사 Mock 데이터 조회 및 자사 가격과 비교

**오케스트레이션 흐름**:
1. **경쟁사 가격 조회**: Router → CompetitorService.get_competitors_by_route() → CompetitorRepository → DB
2. **비교 뷰**: Router → CompetitorService.get_price_comparison() → FareRepository + CompetitorRepository → 비교 데이터 조합 → 반환

**외부 의존성**: FareRepository (자사 가격 조회용)

---

### BE-S04: SimulationService — What-if 시뮬레이션

**역할**: 변수 기반 수익 시뮬레이션 및 수요 예측 Mock 제공

**오케스트레이션 흐름**:
1. **시뮬레이션 실행**:
   Router → SimulationService.run_simulation(params)
   → FareRepository (현재 운임/좌석 조회)
   → SimulationMockEngine.calculate(params, current_fares)
   → [고정 Cost 항목 적용: 기종/임차료/CREW/공항비]
   → SimulationResultDTO 반환

2. **수요 예측**:
   Router → SimulationService.get_demand_forecast()
   → SimulationMockEngine.forecast_demand()
   → DemandForecastDTO 반환

**외부 의존성**: FareRepository

---

### BE-S05: ReportService — 보고서 생성

**역할**: Yield Management 보고서 자동 생성, 형식 변환, 배포

**오케스트레이션 흐름**:
1. **보고서 생성**:
   Router → ReportService.generate_report()
   → FareRepository + PriceHistoryRepository (데이터 집계)
   → [수익 증대 기여도, 달성률, 최적화 정도 계산]
   → ReportDTO 생성 및 저장

2. **PDF 변환**: ReportService.download_pdf() → ReportGenerator.to_pdf() → bytes 반환

3. **docx 변환**: ReportService.download_docx() → ReportGenerator.to_docx() → bytes 반환

4. **이메일 전송**: ReportService.send_email() → EmailSender.send() → bool 반환

**외부 의존성**: FareRepository, PriceHistoryRepository, ReportGenerator(reportlab/python-docx)

---

## AI/ML Mock 엔진 인터페이스

### AiMockEngine (추상 인터페이스)

```python
class AbstractAiEngine(ABC):
    @abstractmethod
    def generate_recommendation(
        self, flight: FlightData, current_fare: FareData
    ) -> RecommendationResult:
        """AI 추천 가격 생성 - 실제 ML 모델로 교체 가능"""

    @abstractmethod
    def analyze_strategy(
        self, issue_text: str, context: FlightContext
    ) -> StrategyResult:
        """돌발 이슈 기반 전략 분석 - 실제 LLM으로 교체 가능"""

class MockAiEngine(AbstractAiEngine):
    """규칙 기반 + 랜덤 노이즈로 구현된 Mock"""
```

### SimulationMockEngine (추상 인터페이스)

```python
class AbstractSimulationEngine(ABC):
    @abstractmethod
    def calculate(
        self, params: SimulationParams, fares: list[FareData]
    ) -> SimulationResult:
        """시뮬레이션 계산 - 실제 수요 모델로 교체 가능"""

    @abstractmethod
    def forecast_demand(
        self, route: str, date: date
    ) -> DemandForecast:
        """수요 예측 - 실제 예측 모델로 교체 가능"""

class MockSimulationEngine(AbstractSimulationEngine):
    """선형 수요 모델 기반 Mock 구현"""
```
