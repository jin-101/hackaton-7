# Unit of Work
## 항공사 Revenue Management 가격관리 프로그램

---

## 유닛 정의

| 항목 | 내용 |
|---|---|
| **유닛 ID** | UOW-01 |
| **유닛 명** | RM-System (Revenue Management System) |
| **유형** | Monolith (단일 유닛, 논리적 레이어 분리) |
| **범위** | 전체 시스템 — Frontend + Backend API + AI Engine |
| **배포 모델** | 단일 배포 (Frontend: Static/Vite, Backend: FastAPI 서버) |

---

## 레이어 구성

```
UOW-01: RM-System
├── Layer 1: Frontend (React/TypeScript/Zustand)    ← 개발 순서 1
├── Layer 2: Backend API (FastAPI/Python/SQLite)    ← 개발 순서 2
└── Layer 3: AI Engine (Python Mock)               ← 개발 순서 3 (Backend 내 통합)
```

---

## 개발 순서 (Frontend 우선)

### Phase 1 — Frontend 완성 (현재 프로토타입 기반 확장)
- 기존 React 프로토타입(6개 탭) 기반으로 UI 완성
- Zustand store 구조 구축
- Mock 데이터 기반으로 모든 화면 동작 확인
- ApiClient 인터페이스 정의 (Backend 연동 준비)

### Phase 2 — Backend API 구축
- FastAPI 프로젝트 초기화 (Layered Architecture)
- SQLite DB 스키마 + 초기 Mock 데이터 시딩
- REST API 엔드포인트 구현 (Routers + Services + Repositories)
- Business Rules (BR-01~09) 구현

### Phase 3 — AI Engine 통합
- AiMockEngine / SimulationMockEngine Mock 구현
- 추상 인터페이스 정의 (향후 실제 모델 교체 가능)
- Hypothesis PBT 테스트 작성

### Phase 4 — Frontend-Backend 연동
- ApiClient를 실제 Backend REST API에 연결
- Mock 데이터 → 실제 API 응답으로 교체
- E2E 통합 확인

---

## 디렉토리 구조 (Monorepo)

```
hackaton-7/                          # 프로젝트 루트
├── frontend/                        # Layer 1: React/TypeScript
│   ├── src/
│   │   ├── components/              # Page 컴포넌트 (6개 탭)
│   │   │   ├── Dashboard.tsx        # ✅ 기존 구현
│   │   │   ├── FareManagement.tsx   # ✅ 기존 구현
│   │   │   ├── AiRecommendations.tsx # ✅ 기존 구현
│   │   │   ├── CompetitorMonitoring.tsx
│   │   │   ├── Simulator.tsx        # ✅ 기존 구현
│   │   │   └── Report.tsx           # ✅ 기존 구현
│   │   ├── stores/                  # Zustand stores (신규)
│   │   │   ├── dashboardStore.ts
│   │   │   ├── fareStore.ts
│   │   │   ├── aiRecommendationStore.ts
│   │   │   ├── simulationStore.ts
│   │   │   └── reportStore.ts
│   │   ├── api/                     # ApiClient (신규)
│   │   │   └── apiClient.ts
│   │   ├── types/                   # DTO 타입 정의 (신규)
│   │   │   └── index.ts
│   │   ├── data/
│   │   │   └── mockData.ts          # ✅ 기존 구현
│   │   └── App.tsx                  # ✅ 기존 구현
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                         # Layer 2: FastAPI/Python
│   ├── app/
│   │   ├── routers/                 # Router Layer
│   │   │   ├── fare.py
│   │   │   ├── ai_recommendation.py
│   │   │   ├── competitor.py
│   │   │   ├── simulation.py
│   │   │   ├── report.py
│   │   │   └── dashboard.py
│   │   ├── services/                # Service Layer
│   │   │   ├── fare_service.py
│   │   │   ├── ai_recommendation_service.py
│   │   │   ├── competitor_service.py
│   │   │   ├── simulation_service.py
│   │   │   └── report_service.py
│   │   ├── repositories/            # Repository Layer
│   │   │   ├── fare_repository.py
│   │   │   ├── price_history_repository.py
│   │   │   └── competitor_repository.py
│   │   ├── models/                  # SQLAlchemy ORM 모델
│   │   │   └── models.py
│   │   ├── schemas/                 # Pydantic DTO 스키마
│   │   │   └── schemas.py
│   │   ├── database.py              # SQLite 연결 설정
│   │   └── main.py                  # FastAPI 앱 진입점
│   ├── seed_data.py                 # 초기 Mock 데이터 시딩
│   └── requirements.txt
│
├── ai_engine/                       # Layer 3: AI/ML Mock
│   ├── interfaces.py                # 추상 인터페이스
│   ├── mock_ai_engine.py            # AiMockEngine 구현
│   ├── mock_simulation_engine.py    # SimulationMockEngine 구현
│   └── tests/                       # Hypothesis PBT 테스트
│       ├── test_fare_invariants.py
│       ├── test_ai_recommendation.py
│       └── test_simulation.py
│
├── aidlc-docs/                      # AI-DLC 문서
└── README.md
```

---

## 성공 기준

- [ ] Frontend 6개 탭 전체 완성 및 Mock 데이터 기반 동작 확인
- [ ] Backend REST API 전체 엔드포인트 구현 및 테스트
- [ ] AI Engine Mock 구현 및 추상 인터페이스 정의
- [ ] Frontend-Backend 연동 완료
- [ ] Hypothesis PBT 테스트 통과 (가격 불변 속성 BR-01~09)
- [ ] 대시보드 초기 로딩 3초 이내, API 응답 1초 이내
