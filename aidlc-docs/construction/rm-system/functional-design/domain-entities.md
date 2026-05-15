# Domain Entities — UOW-01: RM-System

---

## 엔티티 관계 개요

```
Route (노선)
  └── Flight (편명/운항)
        └── FareTier (4개 등급별 운임)
              └── PriceHistory (변경 이력)

CompetitorPrice (경쟁사 가격) → Route 참조
SimulationResult (시뮬레이션 결과) → Route 참조
AiRecommendation (AI 추천) → FareTier 참조
Report (보고서) → Route/기간 참조
```

---

## 엔티티 상세

### Route (노선)
| 필드 | 타입 | 설명 |
|---|---|---|
| route_code | str PK | 노선 코드 (예: GMP-CJU) |
| origin | str | 출발 공항 |
| destination | str | 도착 공항 |
| base_cost | int | 노선 고정 운항비 (원) |

**노선 목록 (고정값):**
- GMP-CJU (김포-제주), GMP-PUS (김포-부산), GMP-CJJ (김포-청주)
- GMP-TAE (김포-대구), GMP-RSU (김포-여수), GMP-KWJ (김포-광주)
- ICN-CJU (인천-제주), GMP-WJU (김포-원주), GMP-YNY (김포-양양)

---

### Flight (운항편)
| 필드 | 타입 | 설명 |
|---|---|---|
| flight_id | str PK | 편명 (예: KE1201) |
| route_code | str FK | 노선 코드 |
| flight_date | date | 운항 날짜 |
| departure_time | time | 출발 시각 |
| time_slot | enum | 시간대 (MORNING/FORENOON/AFTERNOON/EVENING) |
| aircraft_type | str | 기종 (고정: B737-900) |
| total_prestige_seats | int | 프레스티지 좌석 수 (고정: 8) |
| total_economy_seats | int | 이코노미 좌석 수 (고정: 165) |

**시간대 기준:**
- MORNING: ~09:00 (기본가 +20~25%)
- FORENOON: 09:00~12:00 (기본가 기준)
- AFTERNOON: 12:00~17:00 (기본가 기준)
- EVENING: 17:00~ (기본가 +30~35%)

---

### FareTier (등급별 운임)
| 필드 | 타입 | 설명 |
|---|---|---|
| fare_tier_id | str PK | UUID |
| flight_id | str FK | 편명 |
| tier | enum | PRESTIGE / ECONOMY_FULL / ECONOMY_DISCOUNT / ECONOMY_SPECIAL |
| class_codes | str | 해당 티어의 클래스 코드들 (예: Y,B,M) |
| current_price | int | 현재 운임 (원) |
| sold_seats | int | 판매된 좌석 수 |
| total_seats | int | 전체 좌석 수 |
| status | enum | OPEN / CLOSED / SOLD_OUT |
| is_weekend | bool | 주말 여부 |
| is_peak_season | bool | 성수기 여부 |

**Tier별 클래스 코드:**
- PRESTIGE: C (8석)
- ECONOMY_FULL: Y, B, M
- ECONOMY_DISCOUNT: S, K, L
- ECONOMY_SPECIAL: T, V, G (총 165석 분할)

---

### PriceHistory (가격 이력)
| 필드 | 타입 | 설명 |
|---|---|---|
| history_id | str PK | UUID |
| fare_tier_id | str FK | 운임 티어 |
| change_type | enum | MANUAL / AI |
| price_before | int | 변경 전 운임 |
| price_after | int | 변경 후 운임 |
| changed_at | datetime | 변경 일시 |
| changed_by | str | 변경자 (담당자명 또는 'AI') |
| note | str | 비고 (AI 추천 근거 등) |

---

### AiRecommendation (AI 추천)
| 필드 | 타입 | 설명 |
|---|---|---|
| recommendation_id | str PK | UUID |
| fare_tier_id | str FK | 대상 운임 티어 |
| recommended_price | int | 추천 운임 |
| change_percent | float | 현재가 대비 변동률 (%) |
| rationale | str | 추천 근거 텍스트 |
| status | enum | PENDING / APPROVED / REJECTED |
| created_at | datetime | 생성 일시 |
| decided_at | datetime | 승인/거부 일시 |

---

### CompetitorPrice (경쟁사 가격)
| 필드 | 타입 | 설명 |
|---|---|---|
| competitor_price_id | str PK | UUID |
| route_code | str FK | 노선 |
| competitor_name | str | 경쟁사명 (예: 아시아나, 제주항공, 티웨이) |
| flight_date | date | 운항 날짜 |
| time_slot | enum | 시간대 |
| price | int | 경쟁사 운임 |
| tier | enum | PRESTIGE / ECONOMY_FULL / ECONOMY_DISCOUNT / ECONOMY_SPECIAL |

---

### SimulationResult (시뮬레이션 결과)
| 필드 | 타입 | 설명 |
|---|---|---|
| simulation_id | str PK | UUID |
| route_code | str | 노선 |
| flight_date | date | 대상 날짜 |
| fuel_change_pct | float | 유가 변동율 (%) |
| new_competitor_entry | bool | 신규 경쟁사 진입 여부 |
| price_change_pct | float | 가격 변동율 (%) |
| expected_demand_change | float | 예상 수요 변화율 (%) |
| expected_revenue_change | float | 예상 수익 변화율 (%) |
| optimal_price_min | int | 최적 가격 범위 하한 |
| optimal_price_max | int | 최적 가격 범위 상한 |
| created_at | datetime | 생성 일시 |

---

### Report (보고서)
| 필드 | 타입 | 설명 |
|---|---|---|
| report_id | str PK | UUID |
| route_code | str | 노선 (null이면 전체) |
| period_start | date | 기간 시작 |
| period_end | date | 기간 종료 |
| total_revenue | int | 총 수익 |
| target_revenue | int | 목표 수익 |
| achievement_rate | float | 달성율 (%) |
| optimization_score | float | 수익 최적화 점수 (0~100) |
| created_at | datetime | 생성 일시 |
