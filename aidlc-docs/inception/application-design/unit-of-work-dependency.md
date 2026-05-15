# Unit of Work Dependency
## 항공사 Revenue Management 가격관리 프로그램

---

## 유닛 구성 (단일 유닛)

단일 유닛(UOW-01: RM-System) 내 레이어 간 의존성을 정의합니다.

---

## 레이어 간 의존성 매트릭스

| 레이어 | 의존 대상 | 의존 방향 | 비고 |
|---|---|---|---|
| Frontend (React) | Backend API | HTTP REST | Phase 4 연동 전까지 Mock 사용 |
| Backend Routers | Backend Services | Python import | 직접 의존 |
| Backend Services | Backend Repositories | Python import | 직접 의존 |
| Backend Services | AI Engine | Python import | 같은 프로세스 내 모듈 호출 |
| Backend Repositories | SQLite DB | SQLAlchemy ORM | 파일 기반 DB |
| AI Engine | (없음) | — | 독립 모듈 |

---

## 개발 순서 기반 의존성 흐름

```
Phase 1: Frontend (Mock 데이터)
    └── mockData.ts → 모든 Page 컴포넌트
    └── Zustand stores (로컬 상태)
    (Backend 없이 독립 동작)

Phase 2: Backend API
    └── SQLite DB ← Repository Layer
    └── Repository Layer ← Service Layer
    └── AI Engine ← Service Layer (AiRecommendationService, SimulationService)
    └── Service Layer ← Router Layer

Phase 3: AI Engine (Backend 내 통합)
    └── mock_ai_engine.py ← AiRecommendationService
    └── mock_simulation_engine.py ← SimulationService

Phase 4: Frontend-Backend 연동
    └── Frontend ApiClient → Backend REST API
    └── Zustand stores → ApiClient (Mock 데이터 교체)
```

---

## 의존성 위험 요소

| 위험 | 영향 | 완화 방법 |
|---|---|---|
| Frontend-Backend 타입 불일치 | API 연동 시 런타임 오류 | 공통 DTO 타입 정의 선행 (types/index.ts) |
| SQLite 동시 접근 | 해커톤 환경에서는 단일 사용자이므로 무시 | N/A |
| AI Mock → 실제 모델 교체 | 인터페이스 불일치 | 추상 인터페이스(interfaces.py) 정의 선행 |

---

## 빌드 의존성

| 패키지 | 실행 방법 | 포트 |
|---|---|---|
| Frontend | `npm run dev` (Vite) | 5173 |
| Backend | `uvicorn app.main:app` | 8000 |
| AI Engine | Backend 내 모듈 (별도 실행 불필요) | — |
| SQLite | 파일 기반 (별도 서버 불필요) | — |
