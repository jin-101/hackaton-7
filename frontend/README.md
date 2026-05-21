# Frontend — Revenue Manager

React + TypeScript 기반의 항공 운임 수익 관리 시스템 프론트엔드입니다.
EMSRb 알고리즘으로 산출된 좌석 인벤토리 데이터를 시각화하고, 노선별 탑승률·수익을 실시간으로 모니터링합니다.

---

## 기술 스택

| 항목 | 버전 | 용도 |
|------|------|------|
| React | 19 | UI 프레임워크 |
| TypeScript | — | 타입 안전성 |
| Vite | 6+ | 빌드 도구 / 개발 서버 |
| Tailwind CSS | 4 | 유틸리티 기반 스타일링 |
| Zustand | 5 | 전역 상태 관리 (노선별 flights 실시간 공유) |
| Recharts | 3 | 차트 및 데이터 시각화 |
| Lucide React | — | 아이콘 |
| jsPDF | — | 보고서 PDF 내보내기 |
| html-to-image | — | 화면 캡처 (보고서 이미지, oklch 색상 호환) |
| docx | — | 보고서 DOCX 내보내기 |

---

## 디렉터리 구조

```
src/
├── App.tsx                    # 루트 컴포넌트 (사이드바 네비게이션, 전역 새로고침)
├── main.tsx                   # 앱 진입점
├── components/
│   ├── Dashboard.tsx          # 대시보드 (KPI 카드, 수익·LF 추이 차트, 실시간 연동)
│   ├── FareManagement.tsx     # 운임 관리 (항공편·클래스별 운임, AI 추천, EMSRb, 좌석 배치도)
│   ├── CompetitorMonitor.tsx  # 경쟁사 모니터링
│   ├── Simulator.tsx          # 시나리오 시뮬레이터 (수요 탄력성 기반)
│   ├── Report.tsx             # 수익 보고서 (PDF/DOCX 내보내기)
│   └── AiRecommendations.tsx  # AI 추천 (FareManagement 내부에 임베드, 별도 탭 없음)
├── stores/
│   ├── flightsStore.ts        # 노선별 DashboardFlight 공유 (운임관리 ↔ 대시보드 연동)
│   ├── dashboardStore.ts
│   ├── fareStore.ts
│   ├── aiRecommendationStore.ts
│   ├── simulationStore.ts
│   └── reportStore.ts
├── data/
│   └── mockData.ts            # EMSRb 시뮬레이션, 기종별 좌석 구성, 노선·스케줄 데이터
├── api/
│   └── apiClient.ts           # fetch 기반 API 클라이언트 (VITE_API_URL or /api prefix)
└── types/
    └── index.ts               # TypeScript 인터페이스 정의
```

---

## 실행 환경

- Node.js 18 이상
- npm 9 이상

---

## 설치 및 실행

```bash
# frontend/ 디렉터리에서 실행
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행 (기본 포트: 5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```

브라우저에서 `http://localhost:5173` 에 접속합니다.

> **백엔드 서버가 먼저 실행되어 있어야 합니다.** (`http://localhost:8000`)  
> 프론트엔드는 `/api/*` 요청을 Vite proxy를 통해 백엔드로 전달합니다.

---

## 환경 설정

기본적으로 API 요청은 `/api` prefix를 사용하며, Vite proxy가 `http://localhost:8000`으로 전달합니다.

```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
}
```

백엔드 URL을 변경하려면 `.env` 파일에 `VITE_API_URL`을 설정하세요.

```
VITE_API_URL=http://your-backend-url
```

---

## 페이지 구성 (URL 라우팅)

History API 기반 pathname 라우팅 (Hash URL 없음, react-router 미사용).

| 페이지 | URL 경로 | 설명 |
|--------|---------|------|
| 대시보드 | `/` 또는 `/dashboard` | KPI 요약 카드, 수익·예약·LF 추이 차트 |
| 운임 관리 (목록) | `/fares` | 날짜·노선 선택 → 항공편 목록 (Step 1) |
| 운임 관리 (상세) | `/fares/:flightNo` | 항공편 클래스별 운임 편집 (Step 2), 새로고침 유지 |
| 경쟁사 모니터링 | `/competitor` | 노선별 경쟁사 운임 현황 |
| 시뮬레이터 | `/simulator` | 연료비·신규 경쟁사·가격 변동 시나리오 |
| 보고서 | `/report` | 기간·노선별 수익 달성률 리포트, PDF/DOCX 내보내기 |

---

## 핵심 상태 관리

### flightsStore (Zustand)

운임관리 탭과 대시보드 탭 간 실시간 데이터 연동을 담당합니다.

```typescript
// 운임관리에서 LF·운임 변경 시
setFlightsForRoute(selectedRoute, updatedFlights);

// 대시보드에서 읽기 → useMemo로 KPI 자동 계산
const liveStats = useMemo(() => {
  // flightsByRoute에서 routeLf, classLf, avgLf, todayRevenue 집계
}, [flightsByRoute]);
```

### 전역 새로고침

우측 상단 🔄 버튼은 `refreshKey`를 증가시켜 모든 탭에 전파합니다.

모든 탭 컴포넌트는 항상 마운트된 상태로 유지되며(**CSS `hidden` 방식**), 탭 전환 시 내부 상태가 보존됩니다.

| 컴포넌트 | refreshKey 처리 |
|----------|----------------|
| `<Dashboard refreshKey={refreshKey} />` | useEffect로 API 데이터 재조회 |
| `<FareManagement refreshKey={refreshKey} />` | useEffect로 재시뮬레이션, `appliedFlights`/`confirmedClasses`/`routeDateCache` 초기화 |
| `<CompetitorMonitor refreshKey={refreshKey} />` | 데이터 재조회 |
| `<Simulator />` | refreshKey 미전달 — 내부 상태 유지 |
| `<Report />` | refreshKey 미전달 — 내부 상태 유지 |

**CSS hidden 방식**: `App.tsx`에서 각 탭을 `className={active ? "" : "hidden"}`으로 show/hide — 언마운트 없이 상태 보존.

---

## FareManagement 날짜별 상태 격리

운임관리 탭에서 날짜를 이동해도 "적용 완료" 상태가 날짜별로 독립 유지됩니다.

- `appliedFlights`: key = `"${date}:${flightId}"` — 날짜별 AI 적용 완료 여부
- `confirmedClasses`: key = `"${date}:${flightId}-${classCode}"` — 날짜별 확정 클래스
- `routeDateCache`: `useRef<Map<"route:date", DashboardFlight[]>>` — 날짜 이동 시 서버 재요청 없이 캐시 반환
- 새로고침 버튼 클릭 시에만 전체 초기화

---

## mockData.ts 핵심 데이터

### 대상 노선 (KE_DOMESTIC_ROUTES)

`GMP-CJU`, `GMP-PUS`, `GMP-TAE`, `GMP-KWJ`, `ICN-CJU`, `ICN-PUS`, `GMP-KPO`, `GMP-RSU` (8개 노선)

### 기종별 좌석 구성 (seed_data.py / backend DB 기준)

| 기종 | C (프레스티지) | Y (정상) | M (할인) | V (특가) | 합계 |
|------|--------------|----------|----------|----------|------|
| B737-900ER | 8 | 35 | 95 | 62 | 200석 |
| B737-800 | 8 | 28 | 76 | 46 | 158석 |
| A220-300 | 4 | 22 | 62 | 42 | 130석 |

### EMSRb 적용 방식 (mockData.ts 내부)

- 프론트엔드 EMSRb는 A&S 26.2.17 유리 근사식 기반 `_normInv()` 사용
- CV(변동계수): LF ≥ 80% → 0.20, LF ≥ 60% → 0.25, LF < 60% → 0.40
- 좌석 수 증가 시 eligible 등급 중 기회비용 최소 등급에서 차감
- 좌석 수 감소 시 수익 기여 최대 등급으로 이관
- 좌석 수 합이 전체 좌석 초과 시 에러 배너 표시
