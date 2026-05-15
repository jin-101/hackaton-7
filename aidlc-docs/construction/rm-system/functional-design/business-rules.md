# Business Rules — UOW-01: RM-System

---

## 가격 제약 규칙

### BR-01: 클래스 계층 순서
**규칙**: 상위 Tier 운임은 하위 Tier보다 항상 높아야 한다.
```
PRESTIGE > ECONOMY_FULL > ECONOMY_DISCOUNT > ECONOMY_SPECIAL
```
**적용**: FareService.update_fare() 저장 전 검증
**위반 시**: 저장 거부 + 오류 메시지 반환
**PBT 불변 속성**: 어떤 운임 값 조합이 입력되어도 저장 후 위 순서가 유지된다

---

### BR-02: Load Factor 계산
**규칙**: L/F = (sold_seats / total_seats) × 100
**범위**: 항상 0 ≤ L/F ≤ 100
**색상 기준**:
- L/F ≥ 90% → 적색 (CRITICAL)
- L/F ≥ 70% → 황색 (WARNING)
- 그 외 → 네이비 (NORMAL)
**PBT 불변 속성**: sold_seats와 total_seats가 어떤 값이어도 L/F는 0~100 범위

---

### BR-03: AI 추천 가격 생성 범위
**규칙**: AI 추천가는 현재 운임 대비 -30% ~ +50% 범위 내에서만 생성 가능
```
current_price × 0.7 ≤ recommended_price ≤ current_price × 1.5
```
**적용**: AiMockEngine.generate_recommendation()
**위반 시**: 범위 내 값으로 클리핑 처리
**PBT 불변 속성**: 어떤 현재가가 입력되어도 추천가는 위 범위 내에 있다

---

### BR-04: 운임 최솟값
**규칙**: 모든 운임은 0보다 커야 한다 (음수/0 불가)
```
current_price > 0
recommended_price > 0
```
**적용**: FareService.update_fare(), AiMockEngine
**위반 시**: 저장 거부 + 오류 메시지
**PBT 불변 속성**: 어떤 값이 입력되어도 저장된 운임은 항상 양수

---

### BR-05: 승인 즉시 반영
**규칙**: 담당자가 AI 추천 가격을 승인하면 즉시 FareTier.current_price에 반영
**적용**: AiRecommendationService.approve_recommendation()
**부작용**: PriceHistory 레코드 자동 생성 (change_type=AI)

---

### BR-07: 수동 가격이 AI보다 우선
**규칙**: 담당자가 수동으로 직접 입력한 가격은 AI 추천보다 우선 적용
**적용**: FareService.update_fare() 호출 시 해당 FareTier의 PENDING 상태 AI 추천은 REJECTED 처리

---

### BR-08: Tier별 가격 계층
**규칙**: 4개 Tier의 운임 순서 유지 (BR-01과 동일, 명시적 적용 위치 추가)
```
PRESTIGE ≥ ECONOMY_FULL × 1.5   (프레스티지는 일반석 정상가의 1.5배 이상)
ECONOMY_FULL > ECONOMY_DISCOUNT > ECONOMY_SPECIAL
```
**적용**: 운임 저장 및 Seed Data 생성 시 검증

---

### BR-09: 시간대/시즌 가격 보정
**규칙**: Seed Data 생성 시 기본가에 보정 적용
- MORNING: 기본가 × 1.20~1.25
- FORENOON: 기본가 × 1.00
- AFTERNOON: 기본가 × 1.00
- EVENING: 기본가 × 1.30~1.35
- 주말(is_weekend=True): 기본가 × 1.10
- 성수기(is_peak_season=True): 기본가 × 1.20

---

## 운임 승인 흐름 규칙

### AR-01: 수동 승인 전용
**규칙**: 모든 AI 추천은 Revenue Manager의 수동 승인/거부 필요
- 자동 승인 없음
- 추천 상태: PENDING → APPROVED 또는 REJECTED

### AR-02: 승인 이력 기록
**규칙**: 모든 가격 변경(수동/AI 승인)은 PriceHistory에 기록
- change_type=MANUAL: 담당자 직접 수정
- change_type=AI: AI 추천 승인

---

## 시뮬레이션 고정값 규칙

### SR-01: Cost 항목 고정
**규칙**: 시뮬레이션에서 아래 항목은 변경 불가 고정값으로 처리
| 항목 | GMP-CJU | GMP-PUS | 기타 노선 |
|---|---|---|---|
| 항공기 임차료 | 800,000원 | 900,000원 | 850,000원 |
| CREW 비용 | 300,000원 | 320,000원 | 310,000원 |
| 공항 사용료 | 150,000원 | 160,000원 | 155,000원 |
| 기타 고정비 | 50,000원 | 50,000원 | 50,000원 |

---

## 보고서 계산 규칙

### RR-01: 수익 계산
```
total_revenue = Σ(FareTier.current_price × FareTier.sold_seats)
```

### RR-02: 달성율 계산
```
achievement_rate = (total_revenue / target_revenue) × 100
```

### RR-03: 최적화 점수 계산
```
optimization_score = min(100, (total_revenue / max_possible_revenue) × 100)
max_possible_revenue = Σ(FareTier.current_price × FareTier.total_seats)
```
