# Build Instructions

## Prerequisites

- **Node.js**: v20 LTS
- **Python**: 3.9+
- **pip**: 22+
- **npm**: 10+
- **System Requirements**: 4GB RAM minimum, 1GB free disk space

---

## Unit 1: Frontend (React/TypeScript/Vite)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

Expected output: `added XXX packages` — no `npm ERR!` lines.

### 2. TypeScript Type Check

```bash
cd frontend
npx tsc --noEmit
```

Expected output: no errors (0 diagnostics).

### 3. Production Build

```bash
cd frontend
npm run build
```

Expected output:
```
✓ built in XXXms
dist/index.html           X.XX kB
dist/assets/index-*.js    XXX kB
```

Acceptable warning: `Some chunks are larger than 500 kB` — this is expected given Recharts bundle size.

### 4. Build Artifacts

| Artifact | Location |
|---|---|
| HTML entry | `frontend/dist/index.html` |
| JS bundle | `frontend/dist/assets/index-*.js` |
| CSS bundle | `frontend/dist/assets/index-*.css` |

---

## Unit 2: Backend (FastAPI/Python)

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Expected: all 8 packages installed without errors.

### 2. Seed Database (First Run Only)

```bash
cd backend
PYTHONPATH=..  python seed_data.py
```

Expected output:
```
Seeding routes...
Seeding flights and fare tiers...
Seeding competitor prices...
Done! 9 routes, 3240 flights, 12960 fare tiers, XXX competitor prices created.
```

If data already exists, the script skips seeding automatically.

### 3. Start Backend Server

```bash
cd backend
PYTHONPATH=.. uvicorn app.main:app --reload --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

### 4. Verify Health Check

```bash
curl http://localhost:8000/health
```

Expected: `{"status":"ok"}`

### 5. Build Artifacts

| Artifact | Location |
|---|---|
| SQLite DB | `backend/rm_system.db` |
| API Docs | `http://localhost:8000/docs` |
| OpenAPI JSON | `http://localhost:8000/openapi.json` |

---

## Unit 3: AI Engine

The AI Engine (`ai_engine/`) is a Python package imported by the Backend. No separate build step is required — it is validated via backend imports.

### Verify AI Engine Import

```bash
cd /path/to/workspace
python -c "from ai_engine.mock_ai_engine import MockAiEngine; from ai_engine.mock_simulation_engine import MockSimulationEngine; print('AI Engine OK')"
```

Expected: `AI Engine OK`

---

## Full System Startup (Combined)

Start both services for end-to-end testing:

```bash
# Terminal 1 — Backend
cd backend
PYTHONPATH=.. uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Access points:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/docs

---

## Troubleshooting

### `ModuleNotFoundError: No module named 'ai_engine'`
**Cause**: `PYTHONPATH` not set to workspace root.  
**Solution**: Run with `PYTHONPATH=.. uvicorn ...` from `backend/` directory, or `PYTHONPATH=backend:. python ...` from workspace root.

### `npm install` fails with peer dependency errors
**Cause**: Node version mismatch.  
**Solution**: Use `nvm use 20` or install Node v20 LTS.

### `rm_system.db` already exists with stale data
**Cause**: Previous seed run with different schema.  
**Solution**: `rm backend/rm_system.db && python seed_data.py`

### Port 8000 already in use
**Cause**: Previous uvicorn process still running.  
**Solution**: `lsof -ti:8000 | xargs kill` then restart.
