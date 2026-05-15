# Integration Test Instructions

## Purpose

Test end-to-end data flows between Frontend, Backend API, and AI Engine to ensure all layers work together correctly.

## Prerequisites

Both services must be running:

```bash
# Terminal 1
cd backend && PYTHONPATH=.. uvicorn app.main:app --reload --port 8000

# Terminal 2
cd frontend && npm run dev
```

---

## Scenario 1: Fare Update Flow (Frontend → Backend → DB)

**Tests**: US-06, BR-01, BR-04, BR-08

### Steps

1. Open http://localhost:5173 → Navigate to "운임 관리" tab
2. Select any route (e.g., 김포-제주)
3. Select a flight from the list
4. Click the edit icon on the PRESTIGE fare card
5. Change the price to a valid value (e.g., 350000)
6. Click the checkmark to confirm
7. Verify the price updates in the UI immediately

### Expected Results

- Fare card shows updated price
- `PUT /fares/{flight_id}` returns HTTP 200
- Price history entry created (visible in "이력" section)

### Validation via API

```bash
curl -s -X PUT http://localhost:8000/fares/{flight_id} \
  -H "Content-Type: application/json" \
  -d '{"tier_code":"PRESTIGE","new_price":350000}'
# Expected: 200 OK with updated FlightFareSchema
```

### Business Rule Violation Test

```bash
# BR-04: price must be > 0
curl -s -X PUT http://localhost:8000/fares/{flight_id} \
  -H "Content-Type: application/json" \
  -d '{"tier_code":"PRESTIGE","new_price":0}'
# Expected: 400 Bad Request

# BR-08: prestige must be >= 1.5x economy_full
# (Set prestige lower than economy_full * 1.5 via consecutive updates)
```

---

## Scenario 2: AI Recommendation Manual Approval (Backend AI Engine → Frontend)

**Tests**: US-04, MockAiEngine

### Steps

1. Navigate to "AI 추천" tab
2. Review recommendation cards showing `PENDING` status
3. Click "승인" on one recommendation
4. Verify the recommendation moves to `APPROVED` status
5. Click "거부" on another — verify `REJECTED` status

### Validation via API

```bash
# Get pending recommendations
curl -s http://localhost:8000/recommendations/
# Expected: array with status=PENDING items

# Approve a recommendation (replace {id} with actual ID)
curl -s -X POST http://localhost:8000/recommendations/{id}/approve
# Expected: 200 OK, status=APPROVED in response
```

---

## Scenario 3: Simulation End-to-End (Frontend → Backend → MockSimulationEngine)

**Tests**: US-11, US-12

### Steps

1. Navigate to "시뮬레이터" tab
2. Select route "ICN-GMP"
3. Set fuel change: +20%
4. Enable competitor entry toggle
5. Set price change: -5%
6. Click "시뮬레이션 실행"
7. Verify chart appears with 8 months of baseline vs simulation data

### Validation via API

```bash
curl -s -X POST http://localhost:8000/simulation/run \
  -H "Content-Type: application/json" \
  -d '{
    "route": "ICN-GMP",
    "fuel_change_percent": 20,
    "new_competitor_entry": true,
    "price_change_percent": -5
  }'
# Expected: chart_data array with 8 entries (month 1-8)
# expected_demand_change should be negative (fuel up + competitor entry)
```

---

## Scenario 4: Report Generation (Frontend → Backend → ReportService)

**Tests**: US-13, US-14

### Steps

1. Navigate to "보고서" tab
2. Select route and date range
3. Click "보고서 생성"
4. Verify report preview appears with route performance data
5. Click "PDF 다운로드" — verify file download initiates
6. Enter email address and click "이메일 전송"
7. Verify success toast message

### Validation via API

```bash
curl -s -X POST http://localhost:8000/reports/generate \
  -H "Content-Type: application/json" \
  -d '{"route_id":"ICN-GMP","start_date":"2026-06-01","end_date":"2026-06-30","report_type":"monthly"}'
# Expected: 200 OK with ReportSchema (title, sections, generated_at)
```

---

## Scenario 5: CORS Validation (Frontend origin → Backend)

**Tests**: NFR CORS all-origins policy

```bash
curl -s -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS http://localhost:8000/health -v
# Expected: 200 OK with Access-Control-Allow-Origin: *
```

---

## Cleanup

No persistent cleanup required. The SQLite database at `backend/rm_system.db` retains all test data. To reset to seed state:

```bash
rm backend/rm_system.db
cd backend && PYTHONPATH=.. python seed_data.py
```
