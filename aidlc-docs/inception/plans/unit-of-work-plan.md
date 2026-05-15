# Unit of Work Plan
## 항공사 Revenue Management 가격관리 프로그램

---

## 답변 요약

| 항목 | 결정 |
|---|---|
| 유닛 수 | 1개 (전체 시스템 단일 유닛) |
| 개발 순서 | Frontend 우선 → Backend 연동 |
| 디렉토리 구조 | Monorepo (frontend/ backend/ ai_engine/) |

---

## 모순/모호성 분석 결과
- 모순 없음
- 단일 유닛 + Frontend 우선은 해커톤 범위에 적합한 일관된 선택

---

## 실행 체크리스트

### Step 1: unit-of-work.md 생성
- [x] 단일 유닛 정의 (RM-System)
- [x] 유닛 내 레이어별 개발 순서 명세
- [x] 디렉토리 구조 정의

### Step 2: unit-of-work-dependency.md 생성
- [x] 레이어 간 의존성 매트릭스
- [x] 개발 순서 기반 의존성 흐름

### Step 3: unit-of-work-story-map.md 생성
- [x] US-01~15 전체 스토리를 단일 유닛에 매핑
- [x] Frontend/Backend/AI 레이어별 분류
