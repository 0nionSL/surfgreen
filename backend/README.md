# SurfGreen Backend

FastAPI backend for the SurfGreen mobile app — simple surf scores for Bali and Portugal.

## 1. Activate virtual environment

```powershell
cd C:\Users\Савелий\Projects\surfgreen\backend

# Create venv (first time only)
py -3 -m venv .venv

# Activate — Windows PowerShell
.venv\Scripts\Activate.ps1

# Activate — Windows CMD
.venv\Scripts\activate.bat

# Activate — macOS/Linux
source .venv/bin/activate
```

## 2. Install dependencies

```powershell
pip install -r requirements.txt
```

## 3. Start the server

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open http://localhost:8000/docs for interactive API documentation.

## 4. Test endpoints

### Health check
```powershell
curl http://localhost:8000/health
```
Expected: `{"status":"ok"}`

### List all spots
```powershell
curl http://localhost:8000/api/spots
```
Expected: JSON array of 10 spots with `id`, `name`, `region`, `latitude`, `longitude`.

### Single spot forecast
```powershell
curl http://localhost:8000/api/spots/1/forecast
```
Expected: forecast object with `score` (0–100), `color` (`green`/`yellow`/`red`), swell/wind data, `wetsuit`, `board`, `is_mock` (false if live data).

### Bulk forecast (for map)
```powershell
curl "http://localhost:8000/api/forecast/bulk?spot_ids=1,2,3"
```
Expected: `{"forecasts":[...], "updated_at":"..."}` with 3 items.

### Debug (no external API)
```powershell
curl http://localhost:8000/debug/test-forecast
```
Expected: mock forecast with `algorithm_status":"ok"` and `is_mock":true`.

## 5. Run tests

```powershell
pytest tests/ -v
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/debug/test-forecast` | Mock forecast (no Open-Meteo) |
| GET | `/api/spots` | List all spots |
| GET | `/api/spots/{id}` | Spot details |
| GET | `/api/spots/nearby?lat=&lon=&radius=` | Spots within radius (km) |
| GET | `/api/spots/{id}/forecast` | Full forecast + score |
| GET | `/api/forecast/bulk?spot_ids=1,2,3` | Bulk forecast for map |

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite+aiosqlite:///.../surfgreen.db` | SQLAlchemy async URL |

## Data sources & fallbacks

1. **Open-Meteo Marine API** — swell, water temperature
2. **Open-Meteo Weather API** — wind speed/direction
3. **Wind-wave fallback** — if weather API is down, wind estimated from marine `wind_wave_*`
4. **Mock data** — if marine API is also unavailable

Weather responses are cached for 1 hour per spot.

## Deploy (Railway)

1. Connect GitHub repo to Railway
2. Set root directory to `backend`
3. Railway auto-detects Dockerfile
4. Set `DATABASE_URL` if using persistent volume
