# Code Summary — UOW-01: RM-System

## 생성 완료 현황

**Frontend**: 16개 파일 생성/수정  
**Backend**: 19개 파일 생성  
**AI Engine**: 3개 파일 생성  
**Tests**: 1개 파일 생성 (4 PBT tests PASS)

---

## Frontend 파일 목록

### 신규 생성
| 파일 | 설명 |
|---|---|
| `frontend/src/types/index.ts` | 전체 DTO 타입 정의 (FlightFareDTO, AiRecommendationDTO, SimulationParamsDTO 등 22개 인터페이스) |
| `frontend/src/api/apiClient.ts` | REST API 추상화 클라이언트 (GET/POST/PUT, console.error 에러처리, BASE_URL=localhost:8000) |
| `frontend/src/stores/dashboardStore.ts` | 대시보드 전역 상태 (노선/날짜 선택, 항공편 목록, AI 전략 분석 팝업, Profit 계산) |
| `frontend/src/stores/fareStore.ts` | 운임 관리 전역 상태 (항공편 목록, 운임 업데이트, 가격 이력) |
| `frontend/src/stores/aiRecommendationStore.ts` | AI 추천 전역 상태 (추천 목록, 수동 승인/거부) |
| `frontend/src/stores/simulationStore.ts` | 시뮬레이션 전역 상태 (파라미터 입력, 실행, 결과 차트 데이터) |
| `frontend/src/stores/reportStore.ts` | 보고서 전역 상태 (생성, PDF/DOCX 다운로드, 이메일 전송) |

### 수정된 파일
| 파일 | 변경 사항 |
|---|---|
| `frontend/package.json` | zustand ^5.0.5 의존성 추가 |
| `frontend/tsconfig.app.json` | strict: true 활성화 |
| `frontend/src/App.tsx` | 6탭 네비게이션 (AI 추천 탭 추가), data-testid 추가 |
| `frontend/src/components/Dashboard.tsx` | AiRecommendationStore 연동, data-testid 추가 |
| `frontend/src/components/FareManagement.tsx` | FareStore 연동, 자동승인 섹션 제거, data-testid 추가 |
| `frontend/src/components/AiRecommendations.tsx` | 자동승인/비상잠금 완전 제거, 수동 승인 전용으로 재작성, data-testid 추가 |
| `frontend/src/components/Simulator.tsx` | SimulationStore 연동, 노선 선택 추가, data-testid 추가 |
| `frontend/src/components/Report.tsx` | ReportStore 연동, 노선/기간 선택 폼 추가, data-testid 추가 |

---

## Backend 파일 목록

### 초기화
| 파일 | 설명 |
|---|---|
| `backend/requirements.txt` | fastapi, uvicorn, sqlalchemy, pydantic, hypothesis, pytest, httpx |
| `backend/app/database.py` | SQLite SQLAlchemy 설정, SessionLocal, Base, get_db() |
| `backend/app/main.py` | FastAPI 앱 진입점, CORS 전체 허용, ValidationError/ValueError 핸들러 |

### Models
| 파일 | 설명 |
|---|---|
| `backend/app/models/models.py` | 8개 SQLAlchemy 모델: Route, Flight, FareTier, PriceHistory, AiRecommendation, CompetitorPrice, SimulationResult, Report |

### Schemas
| 파일 | 설명 |
|---|---|
| `backend/app/schemas/schemas.py` | 30개 Pydantic 스키마: 요청/응답 DTO 전체, field_validator로 price > 0 검증 |

### Repositories
| 파일 | 설명 |
|---|---|
| `backend/app/repositories/fare_repository.py` | Flight/FareTier/Route CRUD |
| `backend/app/repositories/price_history_repository.py` | PriceHistory 생성/조회 |
| `backend/app/repositories/competitor_repository.py` | CompetitorPrice 조회 |

### Services
| 파일 | 설명 |
|---|---|
| `backend/app/services/fare_service.py` | validate_tier_prices() (BR-01/04/08), get_fares_by_route_date(), update_fare(), get_price_history() |
| `backend/app/services/ai_recommendation_service.py` | get_recommendations(), approve_recommendation(), reject_recommendation(), request_strategy_analysis() |
| `backend/app/services/competitor_service.py` | get_competitors_by_route(), get_price_comparison() |
| `backend/app/services/simulation_service.py` | run_simulation() (MockSimulationEngine 주입) |
| `backend/app/services/report_service.py` | generate_report(), send_email() |

### Routers
| 파일 | 엔드포인트 |
|---|---|
| `backend/app/routers/dashboard.py` | GET /dashboard/summary |
| `backend/app/routers/fare.py` | GET /fares/{route_id}, PUT /fares/{flight_id}, GET /fares/{flight_id}/history |
| `backend/app/routers/ai_recommendation.py` | GET /recommendations/, POST /recommendations/{id}/approve, POST /recommendations/{id}/reject, POST /recommendations/strategy |
| `backend/app/routers/competitor.py` | GET /competitors/{route_id}, GET /competitors/{route_id}/comparison |
| `backend/app/routers/simulation.py` | POST /simulation/run |
| `backend/app/routers/report.py` | POST /reports/generate, POST /reports/email |

### Seed Data
| 파일 | 설명 |
|---|---|
| `backend/seed_data.py` | 9개 노선 × 90일 × 4편 = 3240 flights, 각 4 FareTier = 12960 tiers, 경쟁사 3사 가격 데이터 |

---

## AI Engine 파일 목록

| 파일 | 설명 |
|---|---|
| `ai_engine/interfaces.py` | AbstractAiEngine, AbstractSimulationEngine ABC |
| `ai_engine/mock_ai_engine.py` | MockAiEngine: LF 기반 규칙 추천 + BR-03 ±30% 범위 적용 |
| `ai_engine/mock_simulation_engine.py` | MockSimulationEngine: 선형 수요 모델 (유가/경쟁사/가격 변동 영향 계산) |

---

## PBT 테스트

| 파일 | 테스트 | 결과 |
|---|---|---|
| `backend/tests/test_fare_invariants.py` | test_valid_prices_pass_validation (500 examples) | PASS |
| | test_zero_or_negative_price_fails (BR-04) | PASS |
| | test_prestige_must_be_at_least_1_5x_economy_full (BR-08) | PASS |
| | test_economy_class_ordering_enforced (BR-01) | PASS |

---

## 실행 방법

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Backend
```bash
cd backend
pip install -r requirements.txt
python seed_data.py      # 최초 1회 DB 시딩
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000
```

### PBT 테스트
```bash
PYTHONPATH=backend:. python -m pytest backend/tests/ -v
```

---

## 아키텍처 요약

```
[Frontend React/TS]
  └─ App.tsx (6탭)
       ├─ Dashboard (AiRecommendationStore)
       ├─ FareManagement (FareStore)
       ├─ AiRecommendations (AiRecommendationStore) ← 수동 승인 전용
       ├─ CompetitorMonitor (mockData)
       ├─ Simulator (SimulationStore)
       └─ Report (ReportStore)
  
  stores/ → apiClient → [Backend FastAPI]
                              ├─ Router
                              ├─ Service (validate_tier_prices, MockAiEngine)
                              ├─ Repository
                              └─ SQLite DB

[AI Engine] MockAiEngine / MockSimulationEngine
```
