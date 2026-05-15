# Tech Stack Decisions — UOW-01: RM-System

---

## 확정 기술 스택

| 영역 | 기술 | 버전 | 선택 이유 |
|---|---|---|---|
| **Frontend 프레임워크** | React + TypeScript | 18.x / 5.x | 기존 프로토타입 기반, 재사용 |
| **Frontend 빌드** | Vite | 5.x | 빠른 HMR, 기존 설정 유지 |
| **Frontend 상태관리** | Zustand | 4.x | 경량, Redux보다 단순 |
| **Frontend 타입** | TypeScript strict mode | 5.x | 타입 안전성 강화 |
| **차트 라이브러리** | Recharts | 2.x | 기존 프로토타입 의존성 |
| **Backend 프레임워크** | FastAPI | 0.110.x | Python 비동기, 자동 OpenAPI 문서 |
| **Backend 언어** | Python | 3.11+ | AI/ML 생태계, Hypothesis PBT |
| **ORM** | SQLAlchemy | 2.x | 성숙한 Python ORM |
| **데이터베이스** | SQLite | 내장 | 설치 불필요, 파일 기반 |
| **데이터 검증** | Pydantic | 2.x | FastAPI 기본 통합 |
| **ASGI 서버** | Uvicorn | 0.29.x | FastAPI 표준 서버 |
| **PBT 프레임워크** | Hypothesis | 6.x | Python PBT 표준 |
| **보고서 PDF** | ReportLab | 4.x | Python PDF 생성 |
| **보고서 docx** | python-docx | 1.x | Word 문서 생성 |
| **HTTP 클라이언트** | fetch API (내장) | - | 추가 라이브러리 불필요 |
| **CORS** | FastAPI CORSMiddleware | - | `allow_origins=["*"]` |

---

## 패키지 의존성

### frontend/package.json (주요)
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "zustand": "^4.0.0",
    "recharts": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@types/react": "^18.0.0"
  }
}
```

### backend/requirements.txt
```
fastapi==0.110.0
uvicorn==0.29.0
sqlalchemy==2.0.0
pydantic==2.0.0
python-multipart==0.0.9
reportlab==4.0.0
python-docx==1.0.0
hypothesis==6.100.0
pytest==8.0.0
```

---

## 아키텍처 결정 기록 (ADR)

### ADR-01: SQLite 선택
- **결정**: PostgreSQL 대신 SQLite 사용
- **이유**: 해커톤 데모 환경, 별도 DB 서버 설치 불필요
- **트레이드오프**: 동시 쓰기 제한 → 단일 사용자이므로 무관

### ADR-02: 인증 생략
- **결정**: JWT/세션 인증 없이 모든 API 공개
- **이유**: 해커톤 데모, 내부 도구 성격
- **트레이드오프**: 보안 취약 → 프로덕션 환경에서는 반드시 추가 필요

### ADR-03: AI Engine을 Backend 모듈로 통합
- **결정**: 별도 서비스 분리 없이 Backend 내 Python 모듈로 통합
- **이유**: 단일 유닛 개발, 배포 단순화
- **트레이드오프**: 향후 실제 ML 모델 교체 시 재배포 필요 → 추상 인터페이스로 완화

### ADR-04: TypeScript strict mode
- **결정**: `tsconfig.json`에 `"strict": true` 활성화
- **이유**: 런타임 오류 사전 방지, API 응답 타입 안전성
- **트레이드오프**: 초기 개발 속도 소폭 감소 → 디버깅 시간 절약으로 상쇄

### ADR-05: Zustand 상태관리
- **결정**: Redux 대신 Zustand 사용
- **이유**: 보일러플레이트 없음, 해커톤 속도 우선
- **트레이드오프**: Redux DevTools 일부 기능 미지원 → 데모 환경에서 무관
