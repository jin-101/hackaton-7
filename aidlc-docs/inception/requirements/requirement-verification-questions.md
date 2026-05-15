# 요구사항 확인 질문 (Requirement Verification Questions)

항공사 Revenue Management 가격관리 프로그램의 요구사항을 구체화하기 위한 질문들입니다.
각 질문의 `[Answer]:` 태그 뒤에 선택한 알파벳을 입력해주세요.
선택지 중 해당하는 것이 없으면 마지막 옵션(Other)을 선택하고 직접 설명해주세요.

---

## Question 1

이 프로그램의 주요 사용자는 누구입니까?

A) 항공사 내부 Revenue Manager (수익 관리 담당자)
B) 항공사 내부 Revenue Manager + 예약 담당자 (복수 역할)
C) 항공사 경영진 (대시보드/리포팅 위주)
D) SaaS 형태로 여러 항공사에 제공
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2

가격 관리의 주요 대상은 무엇입니까?

A) 국내선 항공권 운임 (좌석 등급별)
B) 국제선 항공권 운임 (좌석 등급별)
C) 국내선 + 국제선 모두
D) 화물 운임 포함
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3

가격 결정 방식은 어떻게 하시겠습니까?

A) 규칙 기반 (Rule-based): 조건별 가격 규칙을 수동으로 정의
B) 수요 예측 기반: 과거 데이터 분석으로 수요 예측 후 가격 자동 산정
C) 두 방식 혼합: 규칙 기반 + 수요 예측 보조
D) AI/ML 기반 완전 자동화 가격 최적화
X) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## Question 4

좌석 등급(Fare Class) 관리는 어느 수준까지 필요합니까?

A) 기본 클래스만 (Economy, Business, First)
B) 서브클래스까지 (Y, B, M, K, H, Q... 등 세부 Booking Class)
C) 가상 클래스(Virtual Class) 포함 복잡한 Inventory 관리
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 5

가격 자동 조정 기능이 필요합니까? (Dynamic Pricing)

A) 필요 없음 - 수동으로만 가격 설정
B) 제한적 자동화 - 특정 조건 충족 시 알림 후 수동 승인
C) 반자동 - 시스템이 추천 가격 제시, 담당자가 승인
D) 완전 자동 - 규칙/알고리즘에 따라 자동 적용
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 6

GDS(Global Distribution System) 또는 외부 예약 시스템과의 연동이 필요합니까?

A) 연동 불필요 - 독립 시스템으로만 운영
B) 내부 예약 시스템(PSS)과만 연동
C) GDS 연동 필요 (Amadeus, Sabre, Travelport 등)
D) GDS + OTA(Online Travel Agency) 연동 필요
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 7

경쟁사 가격 모니터링 기능이 필요합니까?

A) 불필요
B) 필요 - 수동으로 경쟁사 가격 입력하여 비교
C) 필요 - 외부 데이터 소스에서 자동으로 경쟁사 가격 수집
X) Other (please describe after [Answer]: tag below)

[Answer]: X 필요 - mock data 를 ai 가 만들어서 활용

---

## Question 8

O&D(Origin & Destination) 기반 Revenue Management가 필요합니까?

A) 단순 Leg(구간) 기반 관리만으로 충분
B) O&D 기반 - 전체 여정 단위 수익 최적화 필요
C) Network/Hub-and-Spoke 기반 복잡한 최적화 필요
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 9

리포팅 및 분석 기능의 범위는 어느 수준입니까?

A) 기본 리포트 - 현재 가격 현황, 예약 현황 조회
B) 중간 수준 - 수익 분석, 좌석 가용률(Load Factor), 예측 대비 실적
C) 고급 분석 - 실시간 대시보드, BI 도구 연동, 커스텀 리포트
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 10

프로그램의 기술 스택 선호도가 있습니까?

A) 특별한 선호 없음 - 최적 기술 선택에 일임
B) Python 기반 백엔드 (Django/FastAPI) + React 프론트엔드
C) Java/Spring 기반 백엔드 + React 프론트엔드
D) Node.js 기반 백엔드 + React 프론트엔드
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 11

배포 환경은 어디입니까?

A) 클라우드 (AWS/Azure/GCP)
B) 온프레미스 (자사 서버)
C) 하이브리드 (클라우드 + 온프레미스)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 12

예상 동시 사용자 수는 어느 정도입니까?

A) 소규모 - 10명 이하
B) 중규모 - 10~50명
C) 대규모 - 50명 이상
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 13

이 프로그램은 해커톤/프로토타입용입니까, 실제 운영 시스템입니까?

A) 해커톤/데모/프로토타입 - 빠른 구현, 핵심 기능 우선
B) MVP(최소 기능 제품) - 실제 운영 가능한 기본 기능
C) 완전한 운영 시스템 - 엔터프라이즈급 안정성 필요
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 14 (Security Extension)

이 프로젝트에 보안 확장 규칙을 적용하시겠습니까?

A) Yes - 모든 보안 규칙을 필수 제약으로 적용 (운영 환경용 애플리케이션에 권장)
B) No - 보안 규칙 생략 (PoC, 프로토타입, 실험적 프로젝트에 적합)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 15 (Property-Based Testing Extension)

이 프로젝트에 속성 기반 테스팅(Property-Based Testing) 규칙을 적용하시겠습니까?

A) Yes - 모든 PBT 규칙을 필수 제약으로 적용 (비즈니스 로직, 데이터 변환이 있는 프로젝트에 권장)
B) Partial - 순수 함수와 직렬화 왕복 테스트에만 PBT 규칙 적용
C) No - PBT 규칙 생략 (단순 CRUD, UI 전용 프로젝트에 적합)
X) Other (please describe after [Answer]: tag below)

[Answer]: A
