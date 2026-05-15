# Story Generation Plan
## 항공사 Revenue Management 가격관리 프로그램

---

## 답변 요약

| 항목 | 결정 |
|---|---|
| 스토리 분해 방식 | User Journey-Based |
| 상세 수준 | Mid-Level (기능별 2~5개 스토리, 핵심 인수 기준 포함) |
| Persona | 단일 — Revenue Manager |
| 인수 기준 형식 | 혼합 (핵심 스토리: Given-When-Then, 나머지: Checklist) |
| PBT 표기 | 인수 기준 내 자연스럽게 통합 |
| 우선순위 | Core MVP 우선 (대시보드 + 운임관리 + AI 추천 승인/거부) |

---

## 모순/모호성 분석 결과

- **모순 없음**: 모든 답변이 일관됨
- **모호성 없음**: 각 선택이 명확하고 서로 충돌하지 않음
- **PBT 통합 방식(C)과 혼합 인수 기준(C)**: 핵심 스토리(AI 승인, 가격 계산)에 Given-When-Then + PBT 조건을 함께 기술하는 방식으로 자연스럽게 통합 가능

---

## User Journey 정의

Revenue Manager의 핵심 업무 흐름을 5개 Journey로 구성:

| Journey | 설명 | 우선순위 |
|---|---|---|
| J1. 일일 현황 파악 | 출근 후 노선/편별 수익 현황, L/F, AI 추천 확인 | 🔴 MVP |
| J2. 가격 결정 | AI 추천 승인/거부/자동확정, 수동 가격 조정 | 🔴 MVP |
| J3. 이상 상황 대응 | 비상 가격 잠금, 경쟁사 가격 모니터링, 알림 대응 | 🟡 MVP+ |
| J4. 미래 전략 분석 | 시뮬레이터(What-if), 수요 예측 확인 | 🟡 MVP+ |
| J5. 보고 및 기록 | 보고서 생성/다운로드/이메일 전송, 가격 이력 조회 | 🟢 Nice-to-have |

---

## 실행 체크리스트

### Step 1: Persona 생성
- [x] personas.md 생성
- [x] Revenue Manager 페르소나 정의 (이름, 역할, 목표, 불편함, 기술 수준)

### Step 2: Journey J1 스토리 생성 (일일 현황 파악)
- [x] US-01: 노선/편별 실시간 현황 조회
- [x] US-02: 주간 달력 기반 날짜별 현황 탐색
- [x] US-03: 좌석 등급별(프레스티지/정상/할인/특가) 현황 카드 확인

### Step 3: Journey J2 스토리 생성 (가격 결정)
- [x] US-04: AI 추천 가격 검토 및 수동 승인/거부
- [x] US-05: AI 자동 승인 (허용 범위 내 자동 확정)
- [x] US-06: 수동 가격 직접 조정 (AI 없이 담당자가 직접 설정)
- [x] US-07: AI 전략 분석 요청 및 긴급 전략 제안 검토

### Step 4: Journey J3 스토리 생성 (이상 상황 대응)
- [x] US-08: 비상 가격 잠금 (수동 상·하한 범위 설정)
- [x] US-09: 경쟁사 가격 모니터링 및 비교
- [x] US-10: 가격 변동 알림 수신 및 확인

### Step 5: Journey J4 스토리 생성 (미래 전략 분석)
- [x] US-11: What-if 시뮬레이션 (유가/경쟁사/가격 변수 조정)
- [x] US-12: 수요 예측 결과 확인

### Step 6: Journey J5 스토리 생성 (보고 및 기록)
- [x] US-13: 수익 보고서 자동 생성 및 미리보기
- [x] US-14: 보고서 PDF/docx 다운로드 및 이메일 전송
- [x] US-15: 가격 변경 이력 조회

### Step 7: 검증
- [x] 모든 스토리 INVEST 기준 충족 확인
- [x] MVP 스토리(US-01~US-07) Given-When-Then 형식 적용 확인
- [x] PBT 조건(가격 불변 속성) 인수 기준 내 통합 확인
- [x] stories.md 최종 저장

---

## 파일 경로
- 생성 대상: `aidlc-docs/inception/user-stories/personas.md`
- 생성 대상: `aidlc-docs/inception/user-stories/stories.md`
