# User Stories Planning Questions

요구사항을 기반으로 User Stories를 생성하기 위해 아래 질문에 답해주세요.
각 질문 아래 `[Answer]:` 태그 뒤에 선택지 알파벳을 입력해주세요.
없는 경우 마지막 Other 선택 후 직접 설명을 추가해 주세요.

---

## Question 1
User Stories의 스토리 분해(Breakdown) 방식을 어떻게 할까요?

A) Feature-Based — 시스템 기능(운임관리, AI추천, 대시보드, 시뮬레이터, 보고서)별로 스토리 구성
B) User Journey-Based — Revenue Manager의 업무 흐름(가격 확인 → 추천 승인 → 모니터링 → 분석 → 보고)별로 스토리 구성
C) Epic-Based — 대형 Epic(예: 가격 관리 Epic, AI 추천 Epic)을 정의하고 하위 Story로 분해
D) Hybrid — Feature 기반으로 구성하되, 핵심 업무 흐름은 Journey로 표현
E) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 2
User Stories의 상세 수준(Granularity)을 어느 정도로 할까요?

A) High-Level (Epic 수준) — 큰 단위로만 작성, 인수 기준 최소화 (빠른 작성, 해커톤 우선)
B) Mid-Level — 각 기능별 2~5개 스토리, 핵심 인수 기준 포함
C) Detailed — 세부 시나리오까지 모두 포함, 엣지 케이스 및 예외 처리까지 명세
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 3
User Persona는 어떻게 정의할까요?
(요구사항 기준으로는 "Revenue Manager" 단일 사용자)

A) 단일 페르소나 — Revenue Manager 한 명으로 모든 스토리 작성
B) 역할 분리 — Revenue Manager + 시스템 관리자(Admin) 역할 구분
C) 업무 상황별 분리 — 일상 운영 담당자 / 비상 상황 대응 담당자 / 보고 담당자로 구분
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4
인수 기준(Acceptance Criteria) 형식을 어떻게 작성할까요?

A) Given-When-Then (BDD 형식) — 모든 스토리에 시나리오 기반 기준 작성
B) Checklist 형식 — 충족해야 할 조건을 체크리스트로 나열
C) 혼합 — 핵심 스토리는 Given-When-Then, 나머지는 Checklist
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 5
Property-Based Testing(PBT) 적용 대상 스토리를 어떻게 표시할까요?
(요구사항 NFR-05: Hypothesis 프레임워크 PBT 전면 적용)

A) 각 스토리에 `[PBT]` 태그 추가, 불변 속성(Invariant) 명세 포함
B) 별도 PBT 섹션을 스토리 내에 추가 (가격 계산, AI 추천 등 수치 로직 대상)
C) 인수 기준 내에 PBT 검증 조건을 자연스럽게 통합
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 6
해커톤 범위 내에서 어떤 스토리에 우선순위를 두어야 할까요?

A) Core MVP 우선 — 대시보드 + 운임관리 + AI 추천 승인/거부 중심
B) 차별화 기능 우선 — AI 하이브리드 자동 승인 + 시뮬레이터 + 비상 가격 잠금 중심
C) 전체 균등 — 모든 기능(FR-01~FR-11) 동일 우선순위로 작성
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

작성 완료 후 "완료"라고 알려주세요.
