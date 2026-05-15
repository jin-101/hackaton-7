# Functional Design Plan — UOW-01: RM-System

## 결정 요약
| 항목 | 결정 |
|---|---|
| 운임 저장 단위 | Flight + 4개 Tier |
| 가격 이력 유형 | MANUAL / AI |
| 승인 방식 | 수동 승인만 (자동 승인 제거) |
| 비상 가격 잠금 | 제거 (불필요) |
| Seed Data | 랜덤 생성 (노선/날짜/시간대 기준) |
| 에러 처리 | 콘솔 로그만 |

## 실행 체크리스트

- [x] domain-entities.md 생성
- [x] business-rules.md 생성
- [x] business-logic-model.md 생성
- [x] frontend-components.md 생성
