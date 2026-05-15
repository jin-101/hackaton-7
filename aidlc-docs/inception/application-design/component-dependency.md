# Component Dependencies
## 항공사 Revenue Management 가격관리 프로그램

---

## 의존성 매트릭스

| 컴포넌트 | 의존 대상 | 의존 유형 |
|---|---|---|
| FE-01 DashboardPage | ApiClient, DashboardStore | Direct |
| FE-02 FareManagementPage | ApiClient, FareStore | Direct |
| FE-03 AiRecommendationsPage | ApiClient, AiRecommendationStore | Direct |
| FE-04 CompetitorMonitoringPage | ApiClient, CompetitorStore | Direct |
| FE-05 SimulatorPage | ApiClient, SimulationStore | Direct |
| FE-06 ReportPage | ApiClient, ReportStore | Direct |
| FE-07 ApiClient | Backend REST API | HTTP |
| BE-R01 FareRouter | BE-S01 FareService | Direct |
| BE-R02 AiRecommendationRouter | BE-S02 AiRecommendationService | Direct |
| BE-R03 CompetitorRouter | BE-S03 CompetitorService | Direct |
| BE-R04 SimulationRouter | BE-S04 SimulationService | Direct |
| BE-R05 ReportRouter | BE-S05 ReportService | Direct |
| BE-R06 DashboardRouter | BE-S01, BE-S02 | Direct |
| BE-S01 FareService | BE-REPO01, BE-REPO02 | Direct |
| BE-S02 AiRecommendationService | BE-REPO01, BE-REPO02, AI-01 | Direct |
| BE-S03 CompetitorService | BE-REPO01, BE-REPO03 | Direct |
| BE-S04 SimulationService | BE-REPO01, AI-02 | Direct |
| BE-S05 ReportService | BE-REPO01, BE-REPO02 | Direct |
| AI-01 AiMockEngine | (없음 - 독립 모듈) | None |
| AI-02 SimulationMockEngine | (없음 - 독립 모듈) | None |

---

## 데이터 흐름 다이어그램

### 흐름 1: 대시보드 조회
```
사용자
  → DashboardPage (FE-01)
  → ApiClient (FE-07) GET /api/v1/dashboard
  → DashboardRouter (BE-R06)
  → FareService (BE-S01) + AiRecommendationService (BE-S02)
  → FareRepository (BE-REPO01)
  → SQLite DB
  → FlightFareDTO[] 반환
```

### 흐름 2: AI 추천 수동 승인
```
사용자
  → AiRecommendationsPage (FE-03)
  → ApiClient (FE-07) POST /api/v1/recommendations/{id}/approve
  → AiRecommendationRouter (BE-R02)
  → AiRecommendationService (BE-S02)
    ├── 비상 잠금 확인 (BR-07)
    ├── FareRepository.update() → SQLite
    └── PriceHistoryRepository.create() → SQLite
  → ApprovalResultDTO 반환
```

### 흐름 3: AI 자동 승인 실행
```
스케줄/트리거
  → AiRecommendationService (BE-S02)
  → AiMockEngine (AI-01) → 추천가 생성
  → [BR-06: 자동 승인 범위 확인]
    ├── 범위 내 → FareRepository.update() + PriceHistoryRepository(AUTO_APPROVED)
    └── 범위 초과 → 수동 승인 대기 상태로 저장
```

### 흐름 4: What-if 시뮬레이션
```
사용자
  → SimulatorPage (FE-05)
  → ApiClient (FE-07) POST /api/v1/simulation/run
  → SimulationRouter (BE-R04)
  → SimulationService (BE-S04)
    ├── FareRepository (현재 운임 조회)
    └── SimulationMockEngine (AI-02) → 시뮬레이션 계산
  → SimulationResultDTO 반환
```

### 흐름 5: 보고서 생성 및 다운로드
```
사용자
  → ReportPage (FE-06)
  → ApiClient (FE-07) POST /api/v1/reports/generate
  → ReportRouter (BE-R05)
  → ReportService (BE-S05)
    ├── FareRepository + PriceHistoryRepository (데이터 집계)
    └── ReportGenerator (reportlab/python-docx)
  → ReportDTO 반환

  → ApiClient (FE-07) GET /api/v1/reports/{id}/pdf
  → ReportService.download_pdf() → bytes 스트림
```

---

## 패키지 경계

```
hackaton-7/
├── frontend/                    # Unit 1: React/TypeScript
│   ├── src/
│   │   ├── components/          # Page 컴포넌트 (FE-01~06)
│   │   ├── stores/              # Zustand stores
│   │   ├── api/                 # ApiClient (FE-07)
│   │   └── types/               # DTO 타입 정의
│   └── package.json
│
├── backend/                     # Unit 2: FastAPI/Python
│   ├── app/
│   │   ├── routers/             # Router Layer (BE-R01~06)
│   │   ├── services/            # Service Layer (BE-S01~05)
│   │   ├── repositories/        # Repository Layer (BE-REPO01~03)
│   │   ├── models/              # SQLAlchemy ORM 모델
│   │   ├── schemas/             # Pydantic DTO 스키마
│   │   └── main.py
│   └── requirements.txt
│
└── ai_engine/                   # Unit 3: AI/ML Mock Engine
    ├── mock_ai_engine.py        # AI-01 AiMockEngine
    ├── mock_simulation_engine.py # AI-02 SimulationMockEngine
    ├── interfaces.py            # 추상 인터페이스
    └── tests/                   # Hypothesis PBT 테스트
```

---

## 통신 패턴

| 구간 | 프로토콜 | 형식 |
|---|---|---|
| 브라우저 ↔ Frontend | - | React SPA |
| Frontend ↔ Backend | HTTP REST | JSON |
| Backend Services 내부 | Python 함수 호출 | - |
| Backend ↔ DB | SQLAlchemy ORM | SQL/SQLite |
| Backend ↔ AI Engine | Python 함수 호출 (같은 프로세스) | - |
