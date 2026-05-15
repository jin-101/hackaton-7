# Components
## 항공사 Revenue Management 가격관리 프로그램

---

## 아키텍처 개요

```
[Frontend - React/TypeScript/Zustand]
        ↕ REST API (JSON)
[Backend - FastAPI / Layered Architecture]
  ├── Router Layer (Controllers)
  ├── Service Layer (Business Logic)
  └── Repository Layer (SQLite via SQLAlchemy)
        ↕
[Database - SQLite]

[AI/ML Engine - Python Mock Interface]
  └── (백엔드 내 모듈로 통합, Mock 구현)
```

---

## Frontend Components

### FE-01: DashboardPage
- **책임**: 실시간 대시보드 화면 렌더링 및 상태 관리
- **기능**: 노선/날짜 선택, 편별 현황 테이블, 좌석 등급 카드, Profit Analysis, AI 전략 분석 패널
- **상태**: Zustand store (selectedRoute, selectedDate, flights, classes)

### FE-02: FareManagementPage
- **책임**: 운임 조회/수정 화면
- **기능**: 노선/편 선택, 클래스별 운임 조회, 수동 가격 입력, 가격 이력 조회
- **상태**: Zustand store (fareData, priceHistory)

### FE-03: AiRecommendationsPage
- **책임**: AI 추천 가격 검토 및 승인/거부 화면
- **기능**: 추천 목록, 추천 근거 표시, 승인/거부 버튼, 하이브리드 자동 승인 설정, 비상 가격 잠금
- **상태**: Zustand store (recommendations, autoApprovalConfig, emergencyLock)

### FE-04: CompetitorMonitoringPage
- **책임**: 경쟁사 가격 모니터링 화면
- **기능**: 노선별 경쟁사 가격 조회, 자사 vs 경쟁사 비교 뷰, 알림 표시
- **상태**: Zustand store (competitorData, alerts)

### FE-05: SimulatorPage
- **책임**: What-if 시뮬레이션 화면
- **기능**: 변수 입력(유가/경쟁사/가격), 시뮬레이션 실행, 결과 차트 표시
- **상태**: Zustand store (simulationParams, simulationResult)

### FE-06: ReportPage
- **책임**: 보고서 자동 생성 및 다운로드 화면
- **기능**: 보고서 생성, 미리보기, PDF/docx 다운로드, 이메일 전송
- **상태**: Zustand store (reportData, reportStatus)

### FE-07: ApiClient
- **책임**: 백엔드 REST API 호출 추상화
- **기능**: fetch/axios 기반 API 요청, 에러 처리, 응답 타입 정의
- **의존**: 모든 Page 컴포넌트

---

## Backend Components (Layered Architecture)

### Router Layer (Controllers)

#### BE-R01: FareRouter
- **책임**: 운임 관련 HTTP 엔드포인트 정의
- **경로**: `/api/v1/fares`
- **의존**: FareService

#### BE-R02: AiRecommendationRouter
- **책임**: AI 추천 관련 HTTP 엔드포인트 정의
- **경로**: `/api/v1/recommendations`
- **의존**: AiRecommendationService

#### BE-R03: CompetitorRouter
- **책임**: 경쟁사 가격 관련 HTTP 엔드포인트 정의
- **경로**: `/api/v1/competitors`
- **의존**: CompetitorService

#### BE-R04: SimulationRouter
- **책임**: 시뮬레이션 관련 HTTP 엔드포인트 정의
- **경로**: `/api/v1/simulation`
- **의존**: SimulationService

#### BE-R05: ReportRouter
- **책임**: 보고서 관련 HTTP 엔드포인트 정의
- **경로**: `/api/v1/reports`
- **의존**: ReportService

#### BE-R06: DashboardRouter
- **책임**: 대시보드 집계 데이터 엔드포인트
- **경로**: `/api/v1/dashboard`
- **의존**: FareService, AiRecommendationService

---

### Service Layer (Business Logic)

#### BE-S01: FareService
- **책임**: 운임 조회/수정/이력 관리 비즈니스 로직
- **핵심 규칙**: BR-01(클래스 순서), BR-04(운임 > 0), BR-08(등급별 가격 계층)
- **의존**: FareRepository, PriceHistoryRepository

#### BE-S02: AiRecommendationService
- **책임**: AI 추천 생성, 하이브리드 자동 승인, 비상 잠금 로직
- **핵심 규칙**: BR-03(±30%~+50% 범위), BR-05(즉시 반영), BR-06(자동 확정 범위), BR-07(수동 우선)
- **의존**: FareRepository, AiMockEngine, PriceHistoryRepository

#### BE-S03: CompetitorService
- **책임**: 경쟁사 가격 조회 및 비교
- **핵심 규칙**: Mock 데이터 기반
- **의존**: CompetitorRepository

#### BE-S04: SimulationService
- **책임**: What-if 시뮬레이션 계산, 수요 예측 Mock
- **핵심 규칙**: 고정 Cost 항목(기종/임차료/CREW/공항비)
- **의존**: SimulationMockEngine, FareRepository

#### BE-S05: ReportService
- **책임**: Yield Management 보고서 자동 생성, PDF/docx 변환, 이메일 전송
- **의존**: FareRepository, PriceHistoryRepository, ReportGenerator

---

### Repository Layer (SQLite)

#### BE-REPO01: FareRepository
- **책임**: Flight, Fare, BookingClass CRUD
- **테이블**: flights, fares, booking_classes

#### BE-REPO02: PriceHistoryRepository
- **책임**: 가격 변경 이력 저장/조회
- **테이블**: price_history

#### BE-REPO03: CompetitorRepository
- **책임**: 경쟁사 Mock 가격 데이터 저장/조회
- **테이블**: competitor_prices

---

## AI/ML Mock Engine (백엔드 내 모듈)

### AI-01: AiMockEngine
- **책임**: AI 추천 가격 생성 Mock, 수요 예측 Mock, 전략 분석 Mock
- **인터페이스**: 실제 ML 모델로 교체 가능하도록 추상 인터페이스 정의
- **구현**: 규칙 기반 계산 + 랜덤 노이즈로 Mock 추천가 생성

### AI-02: SimulationMockEngine
- **책임**: What-if 시뮬레이션 계산 Mock
- **인터페이스**: 실제 시뮬레이션 엔진으로 교체 가능
- **구현**: 선형 수요 모델 기반 Mock 계산
