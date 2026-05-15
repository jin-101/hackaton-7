# Logical Components — UOW-01: RM-System

---

## 논리 컴포넌트 구성

해커톤 데모 환경 기준으로 최소한의 논리 컴포넌트만 정의합니다.

---

## Backend 논리 컴포넌트

### LC-01: ValidationLayer
**목적**: 입력 데이터 타입 및 비즈니스 규칙 검증
**구현**: Pydantic BaseModel + 커스텀 예외 핸들러
**위치**: `backend/app/schemas/`, `backend/app/main.py`

```
요청 수신
    → Pydantic 스키마 자동 검증 (타입/필수값)
    → ValidationError 발생 시 400 Bad Request 반환
    → 통과 시 Router → Service 흐름 계속
```

---

### LC-02: BusinessRuleValidator
**목적**: 가격 불변 속성 검증 (BR-01, BR-04, BR-08)
**구현**: `fare_service.py` 내 순수 함수 `validate_tier_prices()`
**위치**: `backend/app/services/fare_service.py`

```
운임 수정 요청
    → validate_tier_prices(prestige, economy_full, discount, special)
    → False 반환 시 → HTTP 400 + 오류 메시지
    → True 반환 시 → Repository 저장
```

---

### LC-03: PriceHistoryRecorder
**목적**: 모든 운임 변경 자동 이력 기록
**구현**: Service 메서드 내 PriceHistoryRepository 호출
**위치**: `FareService.update_fare()`, `AiRecommendationService.approve_recommendation()`

```
운임 변경 완료
    → PriceHistoryRepository.create(
           fare_tier_id, change_type, price_before, price_after, changed_by
       )
    → 트랜잭션 내 자동 처리
```

---

### LC-04: AiMockAdapter
**목적**: Mock AI Engine을 Service에 연결하는 어댑터
**구현**: AbstractAiEngine 인터페이스 + MockAiEngine 주입
**위치**: `backend/app/services/ai_recommendation_service.py`

```
AiRecommendationService(ai_engine=MockAiEngine())
    → ai_engine.generate_recommendation(flight, fare)
    → BR-03 범위 검증 후 AiRecommendation 저장
```

---

### LC-05: SeedDataGenerator
**목적**: 초기 Mock 데이터 생성 및 DB 시딩
**구현**: `backend/seed_data.py` 독립 스크립트
**위치**: `backend/seed_data.py`

```
python seed_data.py 실행
    → 9개 노선 × 90일 × 편당 3~5편 Flight 생성
    → 각 Flight × 4개 FareTier 생성 (랜덤 가격 + 시간대/시즌 보정)
    → 3개 경쟁사 × 동일 구조 CompetitorPrice 생성
    → SQLite DB 저장
```

---

## Frontend 논리 컴포넌트

### LC-06: ApiClient
**목적**: Backend REST API 호출 추상화, 타입 안전한 응답 처리
**구현**: `frontend/src/api/apiClient.ts`
**위치**: `frontend/src/api/`

```typescript
// 모든 API 호출은 ApiClient 통해서만
const apiClient = {
  async get<T>(url: string): Promise<T> { ... },
  async post<T>(url: string, body: unknown): Promise<T> { ... },
  async put<T>(url: string, body: unknown): Promise<T> { ... },
}
// 오류 시: console.error만 출력, throw로 Zustand store가 처리
```

---

### LC-07: ZustandStores
**목적**: 전역 상태 관리, API 데이터 캐싱
**구현**: 기능별 5개 독립 store
**위치**: `frontend/src/stores/`

```
dashboardStore  → DashboardPage 전용
fareStore       → FareManagementPage 전용
aiStore         → AiRecommendationsPage 전용
simulationStore → SimulatorPage 전용
reportStore     → ReportPage 전용
```

---

## 컴포넌트 간 상호작용

```
[HTTP 요청]
    → LC-01 ValidationLayer (Pydantic 자동 검증)
    → Router
    → Service
        ├── LC-02 BusinessRuleValidator (BR-01, BR-04, BR-08)
        ├── LC-03 PriceHistoryRecorder (변경 이력 자동 기록)
        └── LC-04 AiMockAdapter (AI 추천 생성)
    → Repository → SQLite

[Frontend]
    → LC-07 ZustandStore (상태 관리)
    → LC-06 ApiClient (HTTP 요청)
    → [Backend]

[초기화]
    → LC-05 SeedDataGenerator (최초 1회 실행)
```

---

## 테스트 컴포넌트

### LC-08: PBTTestSuite
**목적**: 가격 불변 속성 Property-Based Testing
**구현**: Hypothesis 기반 테스트 파일
**위치**: `backend/tests/test_fare_invariants.py`

```
pytest backend/tests/ 실행
    → Hypothesis가 자동으로 수천 가지 입력 조합 생성
    → validate_tier_prices() 불변 속성 검증
    → BR-01, BR-04, BR-08 위반 시 자동 발견
```
