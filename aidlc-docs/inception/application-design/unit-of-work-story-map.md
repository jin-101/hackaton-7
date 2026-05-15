# Unit of Work - Story Map
## 항공사 Revenue Management 가격관리 프로그램

---

## 전체 스토리 → 유닛 매핑

모든 스토리(US-01~15)는 단일 유닛 **UOW-01: RM-System**에 속합니다.
구현 레이어별로 분류합니다.

---

## Frontend Layer 구현 스토리

| Story ID | 제목 | 우선순위 | 주요 컴포넌트 | Phase |
|---|---|---|---|---|
| US-01 | 노선/편별 실시간 현황 조회 | 🔴 MVP | DashboardPage, DashboardStore | Phase 1 |
| US-02 | 주간 달력 기반 날짜별 현황 탐색 | 🔴 MVP | DashboardPage | Phase 1 |
| US-03 | 좌석 등급별 현황 카드 확인 | 🔴 MVP | DashboardPage | Phase 1 |
| US-04 | AI 추천 가격 수동 승인/거부 | 🔴 MVP | AiRecommendationsPage, AiStore | Phase 1 |
| US-05 | AI 자동 승인 (허용 범위 내 자동 확정) | 🔴 MVP | AiRecommendationsPage, AiStore | Phase 1 |
| US-06 | 수동 가격 직접 조정 | 🔴 MVP | FareManagementPage, FareStore | Phase 1 |
| US-07 | AI 전략 분석 요청 및 긴급 전략 제안 검토 | 🔴 MVP | DashboardPage, AiStore | Phase 1 |
| US-08 | 비상 가격 잠금 | 🟡 MVP+ | AiRecommendationsPage, AiStore | Phase 1 |
| US-09 | 경쟁사 가격 모니터링 및 비교 | 🟡 MVP+ | CompetitorMonitoringPage | Phase 1 |
| US-10 | 가격 변동 알림 수신 및 확인 | 🟡 MVP+ | 공통 알림 컴포넌트 | Phase 1 |
| US-11 | What-if 시뮬레이션 | 🟡 MVP+ | SimulatorPage, SimulationStore | Phase 1 |
| US-12 | 수요 예측 결과 확인 | 🟡 MVP+ | SimulatorPage | Phase 1 |
| US-13 | 수익 보고서 자동 생성 및 미리보기 | 🟢 Nice | ReportPage, ReportStore | Phase 1 |
| US-14 | 보고서 PDF/docx 다운로드 및 이메일 전송 | 🟢 Nice | ReportPage | Phase 1 |
| US-15 | 가격 변경 이력 조회 | 🟢 Nice | FareManagementPage | Phase 1 |

---

## Backend API Layer 구현 스토리

| Story ID | 제목 | 주요 서비스 | Phase |
|---|---|---|---|
| US-01 | 노선/편별 실시간 현황 조회 | DashboardRouter, FareService | Phase 2 |
| US-02 | 주간 달력 기반 날짜별 현황 탐색 | FareService | Phase 2 |
| US-03 | 좌석 등급별 현황 카드 확인 | FareService | Phase 2 |
| US-04 | AI 추천 가격 수동 승인/거부 | AiRecommendationService | Phase 2 |
| US-05 | AI 자동 승인 (허용 범위 내 자동 확정) | AiRecommendationService | Phase 2 |
| US-06 | 수동 가격 직접 조정 | FareService | Phase 2 |
| US-07 | AI 전략 분석 요청 및 긴급 전략 제안 검토 | AiRecommendationService | Phase 2 |
| US-08 | 비상 가격 잠금 | AiRecommendationService | Phase 2 |
| US-09 | 경쟁사 가격 모니터링 및 비교 | CompetitorService | Phase 2 |
| US-10 | 가격 변동 알림 수신 및 확인 | FareService, CompetitorService | Phase 2 |
| US-11 | What-if 시뮬레이션 | SimulationService | Phase 2 |
| US-12 | 수요 예측 결과 확인 | SimulationService | Phase 2 |
| US-13 | 수익 보고서 자동 생성 및 미리보기 | ReportService | Phase 2 |
| US-14 | 보고서 PDF/docx 다운로드 및 이메일 전송 | ReportService | Phase 2 |
| US-15 | 가격 변경 이력 조회 | FareService, PriceHistoryRepository | Phase 2 |

---

## AI Engine Layer 구현 스토리

| Story ID | 제목 | 주요 엔진 | Phase |
|---|---|---|---|
| US-04 | AI 추천 가격 수동 승인/거부 | AiMockEngine | Phase 3 |
| US-05 | AI 자동 승인 | AiMockEngine | Phase 3 |
| US-07 | AI 전략 분석 요청 | AiMockEngine | Phase 3 |
| US-11 | What-if 시뮬레이션 | SimulationMockEngine | Phase 3 |
| US-12 | 수요 예측 결과 확인 | SimulationMockEngine | Phase 3 |

---

## PBT (Property-Based Testing) 대상 스토리

| Story ID | 검증 불변 속성 | 테스트 파일 |
|---|---|---|
| US-04 | 승인 후 운임 > 0, 프레스티지 > 일반석 | test_fare_invariants.py |
| US-05 | 자동 확정 운임 > 0, 범위 내 확정 보장 | test_ai_recommendation.py |
| US-06 | 저장된 운임 > 0, 클래스 순서 불변 | test_fare_invariants.py |
| US-08 | 잠금 시 AI 추천가 ≤ 상한, ≥ 하한 | test_ai_recommendation.py |
| US-11 | 시뮬레이션 결과 수익 값 유효 범위 | test_simulation.py |

---

## 스토리 커버리지 확인

- **전체 스토리**: 15개 (US-01 ~ US-15)
- **UOW-01 할당**: 15개 ✅
- **미할당**: 0개 ✅
- **MVP 스토리 (US-01~07)**: Phase 1+2 우선 구현
- **MVP+ 스토리 (US-08~12)**: Phase 1+2 후속 구현
- **Nice-to-have (US-13~15)**: 여유 시간 구현
