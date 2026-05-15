# Business Logic Model — UOW-01: RM-System

---

## 핵심 비즈니스 프로세스

### BL-01: 운임 조회 및 표시

```
입력: route_code, flight_date
처리:
  1. 해당 노선/날짜의 Flight 목록 조회
  2. 각 Flight의 FareTier 4개 조회
  3. L/F 계산: sold_seats / total_seats × 100 (BR-02)
  4. Pace 계산: (현재 sold_seats - 전주 동일편 sold_seats) / 전주 × 100
  5. 시간대 분류 (MORNING/FORENOON/AFTERNOON/EVENING)
  6. 상태 결정: L/F ≥ 90% → CRITICAL, ≥ 70% → WARNING, else STABLE
출력: FlightFareDTO[] (편별 + 4개 Tier 포함)
```

---

### BL-02: 수동 운임 수정

```
입력: flight_id, tier, new_price, changed_by
처리:
  1. 현재 FareTier 조회
  2. new_price > 0 검증 (BR-04)
  3. 동일 Flight의 모든 Tier 운임 조회
  4. Tier 계층 순서 검증 (BR-01, BR-08):
     PRESTIGE ≥ ECONOMY_FULL × 1.5
     ECONOMY_FULL > ECONOMY_DISCOUNT > ECONOMY_SPECIAL
  5. 검증 통과 시 FareTier.current_price 업데이트
  6. PriceHistory 생성 (change_type=MANUAL)
  7. 해당 FareTier의 PENDING AI 추천 → REJECTED (BR-07)
출력: FareUpdateResultDTO (성공/실패, 변경된 가격)
```

---

### BL-03: AI 추천 생성 (Mock)

```
입력: flight_id, tier, current_price
처리 (AiMockEngine):
  1. 수요 지수 계산 (Mock):
     - L/F 기반: L/F > 80% → 수요 높음, < 50% → 수요 낮음
     - 시간대 보정 (MORNING/EVENING +, FORENOON/AFTERNOON 기준)
     - 성수기/주말 보정
  2. 추천가 계산:
     base_change = 수요지수 × 랜덤노이즈(±5%)
     recommended_price = current_price × (1 + base_change)
  3. BR-03 범위 클리핑:
     recommended_price = clamp(recommended_price,
                               current_price × 0.7,
                               current_price × 1.5)
  4. BR-04 최솟값 보장: recommended_price = max(1000, recommended_price)
  5. 추천 근거 텍스트 생성 (Mock):
     "탑승률 {L/F}%, {시간대} 선호도, 전주 대비 {Pace}% 변동"
출력: AiRecommendationDTO (추천가, 변동율, 근거)
```

---

### BL-04: AI 추천 수동 승인

```
입력: recommendation_id, approved_by
처리:
  1. AiRecommendation 조회 (status=PENDING 확인)
  2. FareTier 조회
  3. 동일 Flight Tier 계층 재검증 (BR-01)
  4. FareTier.current_price = recommended_price 업데이트 (BR-05)
  5. AiRecommendation.status = APPROVED 업데이트
  6. PriceHistory 생성 (change_type=AI)
출력: ApprovalResultDTO (승인된 가격)
```

---

### BL-05: AI 추천 거부

```
입력: recommendation_id, rejected_by
처리:
  1. AiRecommendation 조회 (status=PENDING 확인)
  2. AiRecommendation.status = REJECTED 업데이트
  3. FareTier.current_price 변경 없음
출력: RejectionResultDTO
```

---

### BL-06: What-if 시뮬레이션 (Mock)

```
입력: SimulationParamsDTO (route, date, fuel_change_pct, new_competitor, price_change_pct)
처리 (SimulationMockEngine):
  1. 현재 운임 및 L/F 조회
  2. 수요 탄력성 적용 (Mock 선형 모델):
     demand_change = -0.5 × price_change_pct   (가격 1% 상승 → 수요 0.5% 감소)
     demand_change += -2.0 (경쟁사 신규 진입 시 -2%)
  3. 수익 변화 계산:
     revenue_change = price_change_pct + demand_change
  4. 고정 Cost 차감 (SR-01)
  5. 최적 가격 범위 계산:
     optimal_min = current_price × 0.9
     optimal_max = current_price × 1.2
  6. 차트 데이터 생성 (가격 범위별 예상 수익 곡선)
출력: SimulationResultDTO
```

---

### BL-07: Seed Data 생성

```
처리:
  1. 9개 노선 × 90일 × 편당 3~5편 = 약 2,400~4,000개 Flight 생성
  2. 각 Flight에 4개 FareTier 생성
  3. 기본가 설정 (노선별 차등):
     GMP-CJU: PRESTIGE=180,000, ECONOMY_FULL=95,000, DISCOUNT=70,000, SPECIAL=50,000
     기타 노선: 거리/수요에 따라 비례 조정
  4. 시간대 보정 (BR-09) 적용 후 랜덤 노이즈(±10%) 추가
  5. 주말/성수기 보정 (BR-09) 적용
  6. sold_seats: 0 ~ total_seats × 0.9 범위 랜덤
  7. BR-01, BR-04, BR-08 최종 검증
  8. 경쟁사 Mock 데이터: 각 노선별 3개 경쟁사 × 동일 구조 생성
출력: DB 시딩 완료
```

---

### BL-08: 보고서 생성

```
입력: route_code(optional), period_start, period_end
처리:
  1. 기간 내 모든 Flight 조회
  2. 총 수익 계산 (RR-01): Σ(current_price × sold_seats)
  3. 목표 수익 = 총 수익 × 1.1 (10% 초과 목표로 Mock 설정)
  4. 달성율 계산 (RR-02)
  5. 최적화 점수 계산 (RR-03)
  6. 수요/유류비 추이: 30일치 Mock 시계열 데이터 생성
출력: ReportDTO
```
