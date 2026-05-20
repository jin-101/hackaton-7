# Code Generation Plan — v5-changes

**작성일**: 2026-05-20  
**단위**: v5-changes (단일 단위)  
**대상 파일**:
- `frontend/src/components/Dashboard.tsx` (수정)
- `frontend/src/components/FareManagement.tsx` (수정)

---

## 컨텍스트

### 구현할 요구사항
1. **인벤토리 변경 로그 팝업** — 좌석 수 조정 시 경영층 친화적 변경 이유 모달 표시
2. **대시보드 기간/노선 필터** — 최근 1/3/7/10일 + 노선 선택 → KPI·테이블·차트 연동
3. **운임관리 Step1 UX 개선** — 달력 과거 비활성화, 현재 시간 이후 편만 표시, 새로고침 버튼, 헤더 동적 날짜
4. **운임관리 Step2 레이아웃 개편** — SeatMap+ClassEditCard 좌우 배치, 인벤토리 조정 패널 하단 전체 너비

### 의존 관계
- 기존 `aiReallocateSeats()` 함수에 로그 생성 로직 추가 (반환값 확장)
- Dashboard는 독립 컴포넌트 (다른 컴포넌트와 상태 미공유)

---

## Part 1 — 플랜

### Step 1: Dashboard — 기간/노선 필터 추가
- [ ] `useState`로 `periodDays: number` (기본값 1), `dashboardRoute: string` (기본값 "전체") 추가
- [ ] `revenueHistory` 데이터를 `periodDays` 기준으로 필터링하는 `filteredHistory` 계산값 추가
- [ ] `loadFactorData`, `classData`, KPI 수치를 `dashboardRoute`/`periodDays` 기준으로 필터링
- [ ] 상단에 기간 버튼 그룹 (1일/3일/7일/10일) + 노선 드롭다운 UI 추가
- [ ] 제목 "실시간 대시보드" → `국내선 판매현황 (최근 {N}일)` 동적 표시 (노선 선택 시 노선명 포함)
- [ ] KPI "최근 8일 수익" 레이블 → `최근 {N}일 수익` 동적 변경
- [ ] 차트 타이틀도 선택 기간/노선 반영

### Step 2: FareManagement — 달력 과거 날짜 비활성화
- [ ] `monthDays` 버튼에서 `d.date < todayStr` 이면 `disabled` 처리 + 회색 스타일 적용
- [ ] 주간 피커 버튼도 오늘 이전 날짜 클릭 비활성화 (시각적 dimming + pointer-events-none)

### Step 3: FareManagement Step1 — 현재 시간 이후 운항편만 표시
- [ ] `flights` 목록 렌더링 시 `f.time`(HH:mm 형식)과 현재 시각을 비교
- [ ] `selectedDate === todayStr` 인 경우에만 현재 시간 이후 편 필터 적용 (다른 날짜는 전체 표시)
- [ ] 필터 후 목록이 비면 "현재 시간 이후 운항편이 없습니다" 안내 표시

### Step 4: FareManagement Step1 — 새로고침 버튼 + 헤더 동적 날짜
- [ ] 운항 현황 테이블 헤더 우측에 새로고침 버튼(`RefreshCw` 아이콘) 추가
- [ ] 클릭 시 `buildDashboardFlights(selectedRoute, selectedDate)` 재호출로 flights 상태 갱신
- [ ] 테이블 헤더 텍스트: `{selectedDate} 운항 현황` → `{selectedDate} 운항편 판매현황 (현재기준)` 변경

### Step 5: FareManagement Step2 — 레이아웃 개편
- [ ] Step2 현재 구조: 좌측 8열(ClassEditCard 위 + SeatMap 아래) + 우측 4열
- [ ] 변경: 상단 2열 그리드(SeatMap 왼쪽 / ClassEditCard 오른쪽) + 하단 전체 너비 인벤토리 조정 패널
- [ ] 인벤토리 조정 패널: Profit Analysis + AI 전략 분석 요청을 하단 전체 너비(col-span-12)로 이동
- [ ] 우측 사이드(confirm 버튼 포함)도 하단 배치로 재구성

### Step 6: FareManagement — 인벤토리 변경 로그 팝업
- [ ] `aiReallocateSeats()` 반환값에 `logMessages: string[]` 필드 추가
- [ ] 변경 이유를 경영층 친화적 문구로 생성:
  - 예) `"[정상석 → 할인석 이관] 정상석(Y) 5석 증가 → 수익 기여 낮은 할인석(M)에서 5석 차감. 이유: 할인석 잔여 수익(₩xxx) < 정상석 기회비용"`
  - 예) `"[EMSRb 보호 수준 적용] 정상석 보호 수준 23석 → 특가(V) 예약 한도 42석으로 자동 조정"`
- [ ] `useState`로 `inventoryLogPopup: { messages: string[]; flightId: string } | null` 상태 추가
- [ ] `commitEdit()` 에서 `aiReallocateSeats` 호출 후 `logMessages` 있으면 팝업 상태 업데이트
- [ ] 팝업 모달 UI: 타이틀 "인벤토리 변경 이력", 변경 이유 목록, 닫기 버튼
- [ ] 팝업 스타일: dimmed 오버레이 + 중앙 카드 (기존 aiPopup 모달과 동일한 패턴)

---

## Part 2 — 체크리스트 (생성 시 순서대로 진행)

- [x] Step 1: Dashboard 기간/노선 필터
- [x] Step 2: 달력 과거 날짜 비활성화
- [x] Step 3: 현재 시간 이후 운항편 필터
- [x] Step 4: 새로고침 버튼 + 헤더 동적 날짜
- [x] Step 5: Step2 레이아웃 개편
- [x] Step 6: 인벤토리 변경 로그 팝업
- [x] Step 7: `npm run build` 검증
