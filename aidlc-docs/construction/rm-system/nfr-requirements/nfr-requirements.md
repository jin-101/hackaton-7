# NFR Requirements — UOW-01: RM-System

---

## 결정 요약

| NFR 항목 | 결정 |
|---|---|
| 성능 목표 | 없음 (동작 확인 우선, 해커톤) |
| 인증 | 없음 (모든 API 공개) |
| PBT 적용 범위 | 핵심 가격 불변 속성만 (BR-01, BR-04, BR-08) |
| CORS | 전체 허용 (`allow_origins=["*"]`) |
| 코드 품질 | 가독성 + 타입 안전성 모두 적용 |

---

## NFR-01: 성능

- **목표**: 해커톤 데모 환경, 별도 성능 SLA 없음
- **실질 기준**: 로컬 환경(SQLite + FastAPI + Vite)에서 정상 동작
- **동시 사용자**: 1명 (데모 시연 용도)
- **새로고침**: 수동 트리거 방식 (자동 폴링 없음)

---

## NFR-02: 가용성

- **목표**: 해커톤 데모 환경 — 고가용성 불필요
- **배포**: 로컬 개발 서버 기준 (AWS 배포는 선택)
- **백업/복구**: 불필요

---

## NFR-03: 보안

- **인증**: 없음 — 모든 API 엔드포인트 공개 접근 허용
- **CORS**: `allow_origins=["*"]` — 전체 오리진 허용
- **입력 검증**: Pydantic 스키마 기반 타입 검증만 (보안 목적 아님)
- **SQL Injection**: SQLAlchemy ORM 사용으로 자동 방지

---

## NFR-04: 유지보수성

### 가독성 기준
- 명확한 함수/변수명 (축약어 최소화)
- 모듈 분리: Router / Service / Repository / Model / Schema 계층 엄수
- Zustand store를 기능별로 분리 (dashboardStore, fareStore 등)
- 주석: 복잡한 비즈니스 로직(BR 적용 부분)에만 간단히 추가

### 타입 안전성 기준
**Frontend (TypeScript)**:
- `strict: true` 활성화 (tsconfig.json)
- 모든 API 응답에 타입 정의 (`src/types/index.ts`)
- `any` 타입 사용 금지

**Backend (Python)**:
- 모든 Router 입출력에 Pydantic 스키마 적용
- SQLAlchemy 모델과 Pydantic 스키마 분리 유지
- 함수 시그니처에 타입 힌트 100% 적용

---

## NFR-05: 테스팅 (PBT)

### 적용 대상 (핵심만)
- **BR-01**: 상위 Tier 운임 ≥ 하위 Tier 운임 불변 속성
- **BR-04**: 저장된 운임 > 0 불변 속성
- **BR-08**: PRESTIGE ≥ ECONOMY_FULL × 1.5 불변 속성

### 테스트 프레임워크
- **Python**: Hypothesis (`pip install hypothesis`)
- **대상 파일**: `ai_engine/tests/test_fare_invariants.py`

### 테스트 구조 예시
```python
from hypothesis import given, strategies as st

@given(
    prestige=st.integers(min_value=1, max_value=10_000_000),
    economy_full=st.integers(min_value=1, max_value=10_000_000),
    economy_discount=st.integers(min_value=1, max_value=10_000_000),
    economy_special=st.integers(min_value=1, max_value=10_000_000),
)
def test_tier_price_ordering(prestige, economy_full, economy_discount, economy_special):
    # BR-01: 저장 전 검증 로직 테스트
    ...
```

### 제외 대상
- AI 추천 범위(BR-03): Mock 로직 단순하여 일반 단위 테스트로 충분
- 시뮬레이션 계산: Mock 수치이므로 PBT 효용 낮음
- Frontend: JS/TS PBT 도구 미사용

---

## NFR-06: 접근성 및 사용성

- **대상 사용자**: Revenue Manager 단일 사용자 (내부 도구)
- **브라우저**: Chrome 최신 버전 기준
- **반응형**: 불필요 (데스크탑 전용)
- **접근성**: 해커톤 범위 외
