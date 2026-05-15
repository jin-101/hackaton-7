# Unit Test Execution

## Backend: Property-Based Tests (Hypothesis PBT)

These tests validate core business rule invariants defined in BR-01, BR-04, and BR-08.

### Run PBT Tests

```bash
cd /path/to/workspace
PYTHONPATH=backend:. python -m pytest backend/tests/test_fare_invariants.py -v
```

### Expected Output

```
backend/tests/test_fare_invariants.py::test_valid_prices_pass_validation PASSED      [ 25%]
backend/tests/test_fare_invariants.py::test_zero_or_negative_price_fails PASSED      [ 50%]
backend/tests/test_fare_invariants.py::test_prestige_must_be_at_least_1_5x_economy_full PASSED [ 75%]
backend/tests/test_fare_invariants.py::test_economy_class_ordering_enforced PASSED   [100%]

4 passed in X.XXs
```

All 4 tests must pass. 0 failures.

### Test Details

| Test | Business Rule | Description | Examples |
|---|---|---|---|
| `test_valid_prices_pass_validation` | BR-01/04/08 | Valid price combinations always pass | 500 random examples |
| `test_zero_or_negative_price_fails` | BR-04 | Any price ≤ 0 → validation fails | Random negative/zero |
| `test_prestige_must_be_at_least_1_5x_economy_full` | BR-08 | prestige < economy_full × 1.5 → fails | Random violations |
| `test_economy_class_ordering_enforced` | BR-01 | economy_full > discount > special ordering | Random order violations |

### Run with Verbose Hypothesis Output

```bash
PYTHONPATH=backend:. python -m pytest backend/tests/test_fare_invariants.py -v --hypothesis-show-statistics
```

---

## Frontend: TypeScript Type Check

TypeScript strict mode validation counts as a static analysis unit test.

```bash
cd frontend
npx tsc --noEmit
```

Expected: 0 errors. This validates all 22 DTO interfaces, Zustand store types, and component prop types.

---

## Backend: Smoke Test via HTTP

Verify all 6 router modules respond correctly:

```bash
# Health check
curl -s http://localhost:8000/health
# Expected: {"status":"ok"}

# Dashboard summary
curl -s http://localhost:8000/dashboard/summary
# Expected: JSON with revenue, bookings, lf, pendingRecs fields

# Fares by route (ICN-GMP is route 1)
curl -s "http://localhost:8000/fares/ICN-GMP?date=2026-06-01"
# Expected: JSON array of FlightFareSchema objects

# AI recommendations
curl -s http://localhost:8000/recommendations/
# Expected: JSON array (may be empty initially)

# Competitor prices
curl -s "http://localhost:8000/competitors/ICN-GMP?date=2026-06-01"
# Expected: JSON array of CompetitorPriceSchema

# Simulation run
curl -s -X POST http://localhost:8000/simulation/run \
  -H "Content-Type: application/json" \
  -d '{"route":"ICN-GMP","fuel_change_percent":10,"new_competitor_entry":false,"price_change_percent":5}'
# Expected: JSON with expected_demand_change, expected_revenue_change, optimal_price_range, chart_data
```

---

## Fix Failing Tests

If PBT tests fail:
1. Review Hypothesis shrunk counterexample in output
2. Identify which business rule is violated
3. Fix `validate_tier_prices()` in `backend/app/services/fare_service.py`
4. Rerun until all 4 tests pass
