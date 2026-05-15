# NFR Design Patterns — UOW-01: RM-System

---

## 적용 패턴 요약

해커톤 데모 환경 + 단일 사용자 기준으로 **실용적 최소 패턴**만 적용합니다.
복잡한 분산 시스템 패턴(Circuit Breaker, Retry, Rate Limiting 등)은 적용하지 않습니다.

---

## 패턴 1: Input Validation Pattern (Pydantic)

**적용 NFR**: NFR-03 (입력 검증), NFR-04 (타입 안전성)

**설계**:
- 모든 API 요청 body/query는 Pydantic BaseModel로 정의
- FastAPI의 자동 검증 활용
- Pydantic ValidationError → 400 Bad Request로 커스텀 핸들러 처리

```python
# backend/app/main.py
from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=400,
        content={"detail": exc.errors()}
    )
```

**적용 위치**: 모든 Router 엔드포인트 입출력

---

## 패턴 2: Repository Pattern (데이터 접근 추상화)

**적용 NFR**: NFR-04 (유지보수성, 모듈화)

**설계**:
- Service Layer는 Repository를 통해서만 DB 접근
- SQLAlchemy Session은 Repository 내에서만 관리
- Service에서 직접 DB 쿼리 금지

```python
# 올바른 패턴
class FareService:
    def __init__(self, fare_repo: FareRepository):
        self.fare_repo = fare_repo

    def update_fare(self, flight_id: str, tier: str, new_price: int):
        fare = self.fare_repo.get_by_flight_tier(flight_id, tier)
        # 비즈니스 로직 적용
        self.fare_repo.update(fare)
```

**적용 위치**: 모든 Service 클래스

---

## 패턴 3: Strategy Pattern (AI Engine 교체 가능)

**적용 NFR**: NFR-04 (유지보수성, Mock → 실제 모델 교체)

**설계**:
- `AbstractAiEngine` 인터페이스 정의
- `MockAiEngine`이 구현체로 현재 사용
- 향후 실제 ML 모델은 새 구현체로 교체만 하면 됨

```python
# ai_engine/interfaces.py
from abc import ABC, abstractmethod

class AbstractAiEngine(ABC):
    @abstractmethod
    def generate_recommendation(self, flight, fare) -> dict: ...

    @abstractmethod
    def analyze_strategy(self, issue_text: str, context: dict) -> dict: ...

# ai_engine/mock_ai_engine.py
class MockAiEngine(AbstractAiEngine):
    def generate_recommendation(self, flight, fare) -> dict:
        # 규칙 기반 Mock 구현
        ...
```

**적용 위치**: `ai_engine/interfaces.py`, `AiRecommendationService` 의존성 주입

---

## 패턴 4: Property-Based Testing Pattern (Hypothesis)

**적용 NFR**: NFR-05 (PBT — BR-01, BR-04, BR-08)

**설계**:
- 가격 검증 로직을 순수 함수로 분리 → 테스트 용이성 확보
- `backend/tests/test_fare_invariants.py`에 PBT 작성
- 검증 함수는 Service 내부에서 직접 호출

```python
# backend/app/services/fare_service.py
def validate_tier_prices(prestige: int, economy_full: int,
                          economy_discount: int, economy_special: int) -> bool:
    """BR-01, BR-04, BR-08 검증 순수 함수"""
    if any(p <= 0 for p in [prestige, economy_full, economy_discount, economy_special]):
        return False  # BR-04
    if not (prestige >= economy_full * 1.5):
        return False  # BR-08
    if not (economy_full > economy_discount > economy_special):
        return False  # BR-01
    return True

# backend/tests/test_fare_invariants.py
from hypothesis import given, strategies as st
from app.services.fare_service import validate_tier_prices

@given(
    prestige=st.integers(min_value=1, max_value=10_000_000),
    economy_full=st.integers(min_value=1, max_value=10_000_000),
    economy_discount=st.integers(min_value=1, max_value=10_000_000),
    economy_special=st.integers(min_value=1, max_value=10_000_000),
)
def test_valid_prices_pass_validation(prestige, economy_full, economy_discount, economy_special):
    """유효한 가격 조합은 항상 검증을 통과해야 한다"""
    if (prestige >= economy_full * 1.5 and
        economy_full > economy_discount > economy_special and
        all(p > 0 for p in [prestige, economy_full, economy_discount, economy_special])):
        assert validate_tier_prices(prestige, economy_full, economy_discount, economy_special)

@given(price=st.integers(max_value=0))
def test_zero_or_negative_price_fails(price):
    """0 이하 운임은 항상 검증 실패해야 한다 (BR-04)"""
    assert not validate_tier_prices(price, 50000, 40000, 30000)
```

**적용 위치**: `backend/tests/test_fare_invariants.py`

---

## 패턴 5: CORS Middleware Pattern

**적용 NFR**: NFR-03 (CORS 전체 허용)

```python
# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 적용하지 않는 패턴 (이유)

| 패턴 | 미적용 이유 |
|---|---|
| Circuit Breaker | 외부 서비스 없음, 단일 로컬 환경 |
| Retry / Backoff | 해커톤 데모, 단일 사용자 |
| Rate Limiting | 인증 없음, 단일 사용자 |
| Caching (Redis 등) | SQLite 로컬, 성능 목표 없음 |
| JWT Authentication | 인증 생략 결정 |
| Health Check | 데모 환경 불필요 |
