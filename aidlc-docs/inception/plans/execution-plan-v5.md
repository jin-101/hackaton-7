# Execution Plan — v5

**기준 요구사항**: requirements_delta_v5.md + requirement_fix_260520.pdf  
**작성일**: 2026-05-20  
**프로젝트 유형**: Brownfield

---

## 변경 영향 분석

### 변경 범위
- **변경 유형**: 기존 컴포넌트 기능 추가 + UI 수정
- **주요 변경**:
  1. 인벤토리 변경 이력 로그 팝업/모달 (신규)
  2. 대시보드 기간 필터(1/3/7/10일) + 노선 필터 드롭다운 (UI 수정)
  3. 운임관리 달력 오늘 이후만 선택, 운항편 현 시간 이후만 표시, 새로고침 버튼, 헤더 명칭 변경
  4. 운임관리 세부(Step2) 레이아웃 개편 — SeatMap+ClassEditCard 좌우 배치, 인벤토리 조정 하단 전체 너비

### 영향 범위

| 항목 | 영향 | 설명 |
|---|---|---|
| 사용자 UI 변경 | Yes | 대시보드, 운임관리, 운임관리 세부 |
| 구조 변경 | No | 기존 컴포넌트 수정 |
| 데이터 모델 변경 | 부분 | 인벤토리 로그 데이터 구조 추가 |
| API 변경 | 부분 | 인벤토리 로그 응답 필드 추가 |
| NFR 영향 | No | 기존 NFR 충족 |

### 위험도
- **위험 수준**: Low
- **롤백 복잡도**: Easy (프론트엔드 중심 변경)
- **테스트 복잡도**: Simple

---

## 워크플로우 실행 계획

### 🔵 INCEPTION PHASE
- [x] Workspace Detection — COMPLETED
- [x] Reverse Engineering — COMPLETED
- [x] Requirements Analysis — COMPLETED (v5)
- [x] User Stories — SKIPPED (UI 수정 + 소규모 기능)
- [x] Workflow Planning — EXECUTE (현재)
- [ ] Application Design — **SKIP** (기존 컴포넌트 범위 내 수정, 새 컴포넌트 불필요)
- [ ] Units Generation — **SKIP** (단일 작업 단위)

### 🟢 CONSTRUCTION PHASE
- [ ] Functional Design — **SKIP** (UI 수정 + 로그 패턴 명확)
- [ ] NFR Requirements — **SKIP** (기존 NFR 충족)
- [ ] NFR Design — **SKIP**
- [ ] Infrastructure Design — **SKIP**
- [ ] Code Generation — **EXECUTE**
- [ ] Build and Test — **EXECUTE**

### 🟡 OPERATIONS PHASE
- [ ] Operations — PLACEHOLDER

---

## 코드 생성 단위

단일 단위(v5-changes)로 진행:

### Unit: v5-changes

**영역 1 — 인벤토리 변경 로그 (requirements_delta_v5.md)**
- 대상 파일: `frontend/src/components/FareManagement.tsx`
- 인벤토리 조정 시 변경 이유 로그를 경영층 친화적 문구로 생성
- 별도 팝업/모달("인벤토리 변경 이력") 컴포넌트 추가

**영역 2 — UI 수정 (requirement_fix_260520.pdf)**

A. 대시보드 (`frontend/src/components/Dashboard.tsx`)
- 기간 필터 버튼 그룹 추가 (최근 1/3/7/10일)
- 노선 필터 드롭다운 추가 (국내선 전체 + 8개 노선)
- 폰트 사이즈 확대
- 제목 기준 명시 ("국내선 판매현황 (최근 N일)")
- 기간/노선 필터 → KPI, 운항 현황 테이블, 차트 모두 적용

B. 운임관리 Step1 (`frontend/src/components/FareManagement.tsx`)
- 달력: 오늘 이후 날짜만 선택 가능 (과거 비활성화)
- 운항편: 현재 시간 이후 출발편만 표시
- 새로고침 버튼 추가
- 운항 현황 테이블 헤더: "운항 현황" → "YY-MM-DD 운항편 판매현황 (현재기준)" (선택 날짜 동적 반영)

C. 운임관리 Step2 레이아웃 (`frontend/src/components/FareManagement.tsx`)
- SeatMap + ClassEditCard: 좌/우 나란히 배치 (grid 2열)
- 인벤토리 조정 패널: 하단 전체 너비로 확대

---

## 성공 기준
- 인벤토리 조정 시 경영층 친화적 변경 이유 로그 팝업 표시
- 대시보드 기간/노선 필터 작동 (KPI·테이블·차트 연동)
- 운임관리 달력 과거 날짜 비활성화, 현재 시간 이전 편 미표시
- 운임관리 세부 SeatMap+ClassEditCard 좌우 배치 확인
- `npm run build` 오류 없음
