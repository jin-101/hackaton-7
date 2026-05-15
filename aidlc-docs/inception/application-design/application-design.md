# Application Design (통합)
## 항공사 Revenue Management 가격관리 프로그램

---

## 설계 결정 요약

| 항목 | 결정 |
|---|---|
| 백엔드 아키텍처 | Layered Architecture (Router → Service → Repository) |
| 통신 방식 | REST API (JSON) |
| AI/ML 구현 | Mock 우선, 추상 인터페이스로 교체 가능 |
| 데이터베이스 | SQLite (SQLAlchemy ORM) |
| 프론트엔드 상태 관리 | Zustand |
| 서비스 분리 | 기능별 독립 서비스 (5개) |

---

## 1. 전체 아키텍처

```
[Browser]
    │
    ▼
[Frontend - React/TypeScript]
  ├── Pages: Dashboard, FareManagement, AiRecommendations,
  │          CompetitorMonitoring, Simulator, Report
  ├── Stores: Zustand (DashboardStore, FareStore, AiStore,
  │           SimulationStore, ReportStore)
  └── ApiClient: REST API 호출 추상화
    │
    │ HTTP REST / JSON
    ▼
[Backend - FastAPI]
  ├── Router Layer: FareRouter, AiRecommendationRouter,
  │                 CompetitorRouter, SimulationRouter,
  │                 ReportRouter, DashboardRouter
  ├── Service Layer: FareService, AiRecommendationService,
  │                  CompetitorService, SimulationService,
  │                  ReportService
  └── Repository Layer: FareRepository, PriceHistoryRepository,
                        CompetitorRepository
    │
    │ SQLAlchemy ORM
    ▼
[SQLite Database]

[AI/ML Mock Engine - Python Modules]
  ├── AiMockEngine (AbstractAiEngine 구현)
  └── SimulationMockEngine (AbstractSimulationEngine 구현)
```

---

## 2. 컴포넌트 목록

상세 내용: `components.md`

### Frontend (6 Pages + 1 ApiClient)
- FE-01 DashboardPage
- FE-02 FareManagementPage
- FE-03 AiRecommendationsPage
- FE-04 CompetitorMonitoringPage
- FE-05 SimulatorPage
- FE-06 ReportPage
- FE-07 ApiClient

### Backend (6 Routers + 5 Services + 3 Repositories)
- Routers: BE-R01~R06
- Services: BE-S01(Fare), BE-S02(AiRecommendation), BE-S03(Competitor), BE-S04(Simulation), BE-S05(Report)
- Repositories: BE-REPO01(Fare), BE-REPO02(PriceHistory), BE-REPO03(Competitor)

### AI/ML Mock Engine
- AI-01 AiMockEngine
- AI-02 SimulationMockEngine

---

## 3. 핵심 비즈니스 규칙 적용 위치

| 규칙 | 적용 서비스 |
|---|---|
| BR-01: 상위 클래스 운임 > 하위 클래스 | FareService.update_fare() |
| BR-02: L/F = 예약석/전체석 × 100 | FareService (계산) |
| BR-03: AI 추천 -30%~+50% 범위 | AiRecommendationService |
| BR-04: 운임 > 0 | FareService.update_fare() |
| BR-05: 승인 즉시 반영 | AiRecommendationService.approve_recommendation() |
| BR-06: 자동 확정 허용 범위 | AiRecommendationService.run_auto_approval() |
| BR-07: 수동 범위가 AI보다 우선 | AiRecommendationService (비상 잠금 확인) |
| BR-08: 등급별 가격 계층 | FareService.update_fare() |
| BR-09: 주말 > 주중, 성수기 > 비성수기 | FareService (데이터 조회 시 반영) |

---

## 4. 메서드 시그니처

상세 내용: `component-methods.md`

---

## 5. 서비스 오케스트레이션

상세 내용: `services.md`

---

## 6. 의존성 및 데이터 흐름

상세 내용: `component-dependency.md`

---

## 7. 패키지 구조 (예상)

```
hackaton-7/
├── frontend/          # Unit 1 - React/TypeScript/Zustand
├── backend/           # Unit 2 - FastAPI/Python/SQLite
└── ai_engine/         # Unit 3 - AI/ML Mock Python
```

Units Generation 단계에서 확정됩니다.
