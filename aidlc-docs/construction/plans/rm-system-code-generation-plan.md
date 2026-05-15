# Code Generation Plan — UOW-01: RM-System

## 단위 컨텍스트
- **유닛**: UOW-01 RM-System (단일 유닛)
- **개발 순서**: Frontend 완성 → Backend → AI Engine → 연동
- **기존 코드**: `frontend/` 프로토타입 존재 (Dashboard, FareManagement, AiRecommendations, CompetitorMonitor, Simulator, Report)
- **워크스페이스 루트**: `/Users/jhan/Desktop/hackaton-7`

## 스토리 커버리지
- Phase 1 (Frontend): US-01~15 전체
- Phase 2 (Backend): US-01~15 전체
- Phase 3 (AI Engine): US-04, US-07, US-11, US-12
- Phase 4 (연동): 전체

---

## PART 1: Frontend 완성

### Step 1: Frontend 타입 정의 및 프로젝트 설정
- [x] `frontend/src/types/index.ts` — 모든 DTO 타입 정의 (FlightFareDTO, BookingClassDTO, AiRecommendationDTO 등)
- [x] `frontend/tsconfig.app.json` — strict: true 활성화
- [x] `frontend/package.json` — zustand 의존성 추가

### Step 2: ApiClient 구현
- [x] `frontend/src/api/apiClient.ts` — REST API 호출 추상화 (get/post/put, console.error 에러 처리)

### Step 3: Zustand Stores 구현
- [x] `frontend/src/stores/dashboardStore.ts` — selectedRoute, selectedDate, flights, profitAnalysis, strategyProposal
- [x] `frontend/src/stores/fareStore.ts` — fareData, priceHistory, updateFare
- [x] `frontend/src/stores/aiRecommendationStore.ts` — recommendations 목록, approve/reject
- [x] `frontend/src/stores/simulationStore.ts` — params, result, runSimulation
- [x] `frontend/src/stores/reportStore.ts` — reportData, reportStatus, generateReport, download, email

### Step 4: Dashboard.tsx 완성 (US-01, US-02, US-03, US-07)
- [x] Zustand AiRecommendationStore 연동 (pending count)
- [x] KPI 카드 4개 (수익/예약/LF/AI대기)
- [x] 수익 추이 차트 (AreaChart)
- [x] 항공편별 LF 차트 / 등급별 LF 차트
- [x] data-testid 속성 추가

### Step 5: FareManagement.tsx 완성 (US-06, US-15)
- [x] Zustand FareStore 연동 (updateFare)
- [x] 노선/편 선택 → 4개 등급 운임 카드 인라인 편집
- [x] AI 전략 분석 팝업 (승인/기각)
- [x] 자동 승인 섹션 제거 (사용자 결정)
- [x] data-testid 속성 추가

### Step 6: AiRecommendations.tsx 완성 (US-04)
- [x] Zustand AiRecommendationStore 연동
- [x] PENDING/APPROVED/REJECTED 카운트 표시
- [x] 추천 카드 (근거, 신뢰도, 예측 LF)
- [x] 승인/거부 버튼 (수동 승인만, 자동승인/비상잠금 완전 제거)
- [x] data-testid 속성 추가

### Step 7: CompetitorMonitor.tsx 완성 (US-09, US-10)
- [x] 노선 탭 선택
- [x] 경쟁사 가격 비교 테이블
- [x] 클래스별 가격 바 카드

### Step 8: Simulator.tsx 완성 (US-11, US-12)
- [x] Zustand SimulationStore 연동
- [x] 노선 선택 + 변수 입력 (유가변동율, 경쟁사진입, 가격변동율)
- [x] 시뮬레이션 실행 버튼 + 결과 차트 (Recharts BarChart/LineChart)
- [x] data-testid 속성 추가

### Step 9: Report.tsx 완성 (US-13, US-14)
- [x] Zustand ReportStore 연동
- [x] 노선/기간 선택 + 보고서 생성 버튼 + 미리보기
- [x] PDF/docx 다운로드 버튼
- [x] 이메일 입력 + 전송 버튼
- [x] data-testid 속성 추가

### Step 10: App.tsx 업데이트
- [x] 6개 탭 라우팅 (Dashboard/FareManagement/AI추천/CompetitorMonitor/Simulator/Report)

---

## PART 2: Backend 구현

### Step 11: Backend 프로젝트 초기화
- [x] `backend/` 디렉토리 구조 생성
- [x] `backend/requirements.txt` 작성
- [x] `backend/app/database.py` — SQLite SQLAlchemy 설정
- [x] `backend/app/main.py` — FastAPI 앱, CORS 미들웨어, 예외 핸들러

### Step 12: 데이터베이스 모델 (SQLAlchemy)
- [x] `backend/app/models/models.py` — Route, Flight, FareTier, PriceHistory, AiRecommendation, CompetitorPrice, SimulationResult, Report

### Step 13: Pydantic 스키마
- [x] `backend/app/schemas/schemas.py` — 모든 요청/응답 DTO 스키마

### Step 14: Repository Layer
- [x] `backend/app/repositories/fare_repository.py`
- [x] `backend/app/repositories/price_history_repository.py`
- [x] `backend/app/repositories/competitor_repository.py`

### Step 15: Service Layer — FareService (US-01~03, US-06, US-15)
- [x] `backend/app/services/fare_service.py`
- [x] validate_tier_prices() 순수 함수 (BR-01, BR-04, BR-08)
- [x] get_fares_by_route_date(), update_fare(), get_price_history()

### Step 16: Service Layer — AiRecommendationService (US-04, US-07)
- [x] `backend/app/services/ai_recommendation_service.py`
- [x] get_recommendations(), approve_recommendation(), reject_recommendation()
- [x] request_strategy_analysis()

### Step 17: Service Layer — 나머지 서비스 (US-09~14)
- [x] `backend/app/services/competitor_service.py`
- [x] `backend/app/services/simulation_service.py`
- [x] `backend/app/services/report_service.py`

### Step 18: Router Layer
- [x] `backend/app/routers/fare.py`
- [x] `backend/app/routers/ai_recommendation.py`
- [x] `backend/app/routers/competitor.py`
- [x] `backend/app/routers/simulation.py`
- [x] `backend/app/routers/report.py`
- [x] `backend/app/routers/dashboard.py`

### Step 19: Seed Data 스크립트
- [x] `backend/seed_data.py` — 9개 노선 × 90일 Mock 데이터 생성 및 시딩

---

## PART 3: AI Engine 구현

### Step 20: AI Engine 인터페이스 및 Mock 구현
- [x] `ai_engine/interfaces.py` — AbstractAiEngine, AbstractSimulationEngine
- [x] `ai_engine/mock_ai_engine.py` — MockAiEngine (규칙 기반 추천가 생성, BR-03 적용)
- [x] `ai_engine/mock_simulation_engine.py` — MockSimulationEngine (선형 수요 모델)

### Step 21: PBT 테스트 작성
- [x] `backend/tests/test_fare_invariants.py` — Hypothesis 기반 BR-01, BR-04, BR-08 검증 (4 tests PASS)

---

## PART 4: Frontend-Backend 연동

### Step 22: ApiClient를 실제 Backend API에 연결
- [x] `frontend/src/api/apiClient.ts` — BASE_URL = `http://localhost:8000` 설정
- [x] 각 Zustand store — Mock 데이터 사용 (Phase 1 standalone 동작), ApiClient 연결 준비 완료

### Step 23: 코드 문서 요약
- [x] `aidlc-docs/construction/rm-system/code/code-summary.md` — 생성된 파일 목록 및 요약

---

## 스토리 트레이서빌리티

| Story | 구현 단계 |
|---|---|
| US-01 노선/편별 현황 조회 | Step 4, Step 15, Step 18 |
| US-02 주간 달력 탐색 | Step 4 |
| US-03 좌석 등급 카드 | Step 4 |
| US-04 AI 추천 수동 승인/거부 | Step 6, Step 16, Step 20 |
| US-06 수동 가격 조정 | Step 5, Step 15 |
| US-07 AI 전략 분석 | Step 4, Step 16, Step 20 |
| US-09 경쟁사 모니터링 | Step 7, Step 17 |
| US-10 알림 | Step 7 |
| US-11 시뮬레이션 | Step 8, Step 17, Step 20 |
| US-12 수요 예측 | Step 8, Step 17, Step 20 |
| US-13 보고서 생성 | Step 9, Step 17 |
| US-14 보고서 다운로드/이메일 | Step 9, Step 17 |
| US-15 가격 이력 | Step 5, Step 15 |
