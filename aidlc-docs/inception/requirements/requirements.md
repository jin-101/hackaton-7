# 요구사항 문서 (Requirements Document)
# 항공사 Revenue Management 가격관리 프로그램

---

## 1. 의도 분석 요약 (Intent Analysis)

- **사용자 요청**: 항공사 Revenue Management를 위한 가격관리 프로그램
- **요청 유형**: New Project (Greenfield)
- **범위 추정**: Multiple Components (가격 관리, AI/ML 추천, 대시보드, Inventory 관리)
- **복잡도 추정**: Moderate-Complex (AI/ML 가격 추천 + 실시간 대시보드)
- **프로젝트 목적**: 해커톤/데모/프로토타입 — 핵심 기능 우선, 빠른 구현

---

## 2. 이해관계자 및 사용자

### 주요 사용자
- **Revenue Manager**: 항공사 내부 수익 관리 담당자
  - 가격 정책 수립 및 관리
  - AI 추천 가격 검토 및 승인/거부
  - 수익 현황 모니터링

---

## 3. 기능 요구사항 (Functional Requirements)

### FR-01: 운임 관리 (Fare Management)
- 국내선 항공권 운임 관리
- 좌석 서브클래스(Booking Class) 관리: Y, B, M, K, H, Q 등 세부 등급별 운임 설정
- 항공편(Flight) 단위 운임 조회, 등록, 수정
- Leg(구간) 기반 Inventory 관리 (좌석 가용 수량)

### FR-02: AI/ML 기반 가격 추천 (AI-Powered Price Recommendation)
- ML 모델을 활용한 최적 가격 자동 계산
- Revenue Manager에게 추천 가격 제시 (자동 적용 아님)
- 추천 근거 설명 제공 (탑승률 예측, 수요 트렌드 등)
- 담당자가 추천 가격 승인 시 시스템 반영, 거부 시 현행 유지

### FR-03: 경쟁사 가격 모니터링 (Competitor Price Monitoring)
- AI가 생성한 Mock 경쟁사 가격 데이터 활용
- 동일 노선 경쟁사 가격 현황 조회
- 자사 vs 경쟁사 가격 비교 뷰

### FR-04: 실시간 대시보드 (Real-Time Dashboard)
- **KPI 지표**: 전체 수익(Revenue), 예약 건수, 평균 운임
- **Load Factor**: 항공편별 좌석 가용률 (예약된 좌석 / 전체 좌석)
- **수익 현황**: 노선별, 날짜별 수익 추이 차트
- **Booking Class별 현황**: 클래스별 예약 현황 및 잔여 좌석
- 실시간 업데이트 (폴링 또는 WebSocket)
- BI 도구 연동 제외 (프로토타입 범위)

### FR-05: 가격 이력 관리 (Price History)
- 운임 변경 이력 추적
- 변경 일시, 변경자, 변경 전/후 가격 기록
- AI 추천 승인/거부 이력 포함

### FR-06: 알림 기능 (Notifications/Alerts)
- 특정 조건 충족 시 알림 (예: Load Factor 임계값 초과 시)
- AI 새 추천 가격 발생 시 알림

---

## 4. 비기능 요구사항 (Non-Functional Requirements)

### NFR-01: 성능
- 대시보드 초기 로딩: 3초 이내
- API 응답 시간: 1초 이내 (일반 조회)
- 동시 사용자: 10명 이하 (소규모)

### NFR-02: 가용성
- 해커톤 데모 환경 — 고가용성 불필요
- 클라우드(AWS) 배포

### NFR-03: 보안
- 보안 확장 규칙 미적용 (프로토타입)
- 기본 인증(JWT 또는 세션) 정도만 구현

### NFR-04: 유지보수성
- 코드 가독성 우선
- 모듈화된 구조 (가격 로직, AI 추천 로직 분리)

### NFR-05: 테스팅
- **Property-Based Testing(PBT) 전면 적용** (사용자 선택: Full)
- Python 환경: **Hypothesis** 프레임워크 사용
- 대상: 가격 계산 로직, 데이터 변환, AI 추천 로직의 불변 속성

---

## 5. 기술 스택 (Technology Stack)

| 영역 | 기술 |
|---|---|
| 백엔드 | Python + FastAPI |
| 프론트엔드 | React + TypeScript |
| 데이터베이스 | PostgreSQL (또는 SQLite - 데모용) |
| AI/ML | Python (scikit-learn / pandas) |
| PBT 프레임워크 | Hypothesis |
| 배포 | AWS (EC2 or ECS) |
| 차트 라이브러리 | Recharts 또는 Chart.js |

---

## 6. 데이터 범위 (Data Scope)

### Mock 데이터 (AI 생성)
- 국내선 노선 (예: GMP-CJU, GMP-PUS, ICN-CJU 등)
- 항공편 스케줄 (3개월치 샘플)
- Booking Class별 좌석 수 및 현재 예약 현황
- 경쟁사 가격 데이터 (AI 생성 mock)
- 과거 수요 데이터 (AI/ML 학습용)

---

## 7. 주요 비즈니스 규칙 (Business Rules)

- BR-01: 상위 Booking Class 운임은 하위 클래스보다 항상 높아야 한다
- BR-02: Load Factor = 예약 좌석 수 / 전체 좌석 수 × 100 (%)
- BR-03: AI 추천 가격은 현행 가격의 -30% ~ +50% 범위를 초과할 수 없다
- BR-04: 운임은 0보다 커야 한다 (음수 불가)
- BR-05: 승인된 가격 변경은 즉시 시스템에 반영된다

---

## 8. 범위 외 사항 (Out of Scope)

- GDS/OTA 연동 (Amadeus, Sabre 등)
- 국제선 운임 관리
- 화물 운임 관리
- O&D(Origin & Destination) 기반 네트워크 최적화
- BI 도구 연동 (Tableau, Power BI 등)
- 다중 항공사 SaaS 기능
- 완전 자동 가격 적용 (담당자 승인 필수)

---

## 9. 제약사항 (Constraints)

- 해커톤 데모용: 핵심 기능 우선, 완전한 운영 환경 불필요
- 동시 사용자 10명 이하 기준 설계
- Mock 데이터 기반 AI/ML (실제 항공사 데이터 연동 불필요)
