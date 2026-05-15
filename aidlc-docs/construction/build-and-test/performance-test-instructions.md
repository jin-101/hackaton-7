# Performance Test Instructions

## Status: N/A — Not Required

Per NFR Requirements decision (Q1=B: 성능목표없음), **no formal performance targets** were defined for this project. This is a hackathon demo system and performance testing is out of scope.

---

## Informal Response Time Observations

While not a formal test, these should be verified manually during development:

| Endpoint | Expected Response |
|---|---|
| `GET /health` | < 100ms |
| `GET /fares/{route_id}` | < 500ms |
| `POST /simulation/run` | < 1000ms |
| `POST /reports/generate` | < 1500ms |
| Frontend initial load | < 3000ms |

---

## If Performance Testing Becomes Required

Install k6:
```bash
brew install k6
```

Basic load test script (`k6-basic.js`):
```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const res = http.get('http://localhost:8000/health');
  check(res, { 'status is 200': (r) => r.status === 200 });
}
```

Run: `k6 run k6-basic.js`
