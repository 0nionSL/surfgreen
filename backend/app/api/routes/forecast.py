import asyncio
import logging
import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_weather_service
from app.database.database import SpotORM, get_spot_by_id
from app.models.forecast import BulkForecastItem, BulkForecastResponse, SpotForecast
from app.services.surf_algorithm import calculate_surf_score
from app.services.weather_service import WeatherService

logger = logging.getLogger(__name__)
router = APIRouter(tags=["forecast"])


# ============================================================
# 1. Rate Limiter
# ============================================================
class RateLimiter:
    """Ограничитель частоты запросов к API"""
    
    def __init__(self, max_calls: int, period: float):
        self.max_calls = max_calls
        self.period = period
        self.calls = []
    
    async def wait_if_needed(self):
        now = time.time()
        self.calls = [c for c in self.calls if c > now - self.period]
        if len(self.calls) >= self.max_calls:
            wait_time = self.period - (now - self.calls[0])
            if wait_time > 0:
                await asyncio.sleep(wait_time)
        self.calls.append(now)


# ============================================================
# 2. Cache Service
# ============================================================
class ForecastCache:
    """Кэш для прогнозов"""
    
    def __init__(self, ttl: int = 300):
        self.cache = {}
        self.ttl = ttl
    
    def get(self, key: str) -> Optional[SpotForecast]:
        if key in self.cache:
            data = self.cache[key]
            if time.time() - data['timestamp'] < self.ttl:
                return data['value']
            del self.cache[key]
        return None
    
    def set(self, key: str, value: SpotForecast):
        self.cache[key] = {
            'value': value,
            'timestamp': time.time()
        }


# ============================================================
# 3. Глобальные экземпляры
# ============================================================
spot_limiter = RateLimiter(max_calls=8, period=1.0)
forecast_cache = ForecastCache(ttl=300)


# ============================================================
# 4. Вспомогательные функции
# ============================================================
def _create_mock_forecast(spot: SpotORM) -> SpotForecast:
    """Создать мок-прогноз при ошибке"""
    return SpotForecast(
        spot_id=spot.id,
        spot_name=spot.name,
        updated_at="",
        swell_height=1.0,
        swell_period=8.0,
        swell_direction=180.0,
        swell_direction_label="S",
        wind_speed=10.0,
        wind_direction=90.0,
        wind_direction_label="E",
        water_temp=25.0,
        score=30.0,
        color="red",
        wetsuit="Только плавки",
        board="Лонгборд",
        is_mock=True,
    )


async def _build_forecast_safe(
    spot: SpotORM,
    weather: WeatherService,
    skill_level: str = "intermediate",
) -> SpotForecast:
    """Безопасное получение прогноза с кэшированием и лимитированием"""
    
    # 1. Проверяем кэш
    cache_key = f"{spot.id}_{skill_level}"
    cached = forecast_cache.get(cache_key)
    if cached:
        logger.info(f"✅ Cache hit: {spot.name} (spot_id={spot.id})")
        return cached
    
    try:
        # 2. Лимитируем запросы к API
        await spot_limiter.wait_if_needed()
        
        # 3. Получаем данные
        conditions = await weather.get_conditions(spot.latitude, spot.longitude)
        enriched = weather.enrich_with_labels(conditions)

        # 4. Считаем Score
        score_result = calculate_surf_score(
            swell_height=conditions.swell_height,
            swell_period=conditions.swell_period,
            swell_direction=conditions.swell_direction,
            wind_speed=conditions.wind_speed,
            wind_direction=conditions.wind_direction,
            beach_orientation=spot.beach_orientation,
            water_temp=conditions.water_temp,
            skill_level=skill_level,
        )

        # 5. Формируем ответ
        forecast = SpotForecast(
            spot_id=spot.id,
            spot_name=spot.name,
            updated_at=conditions.fetched_at.isoformat(),
            swell_height=float(enriched["swell_height"]),
            swell_period=float(enriched["swell_period"]),
            swell_direction=float(enriched["swell_direction"]),
            swell_direction_label=str(enriched["swell_direction_label"]),
            wind_speed=float(enriched["wind_speed"]),
            wind_direction=float(enriched["wind_direction"]),
            wind_direction_label=str(enriched["wind_direction_label"]),
            water_temp=float(enriched["water_temp"]),
            score=float(score_result["score"]),
            color=str(score_result["color"]),
            # 👇 ИСПРАВЛЕНЫ НАЗВАНИЯ
            wetsuit=str(score_result["wetsuit_recommendation"]),
            board=str(score_result["board_recommendation"]),
            is_mock=bool(enriched.get("is_mock", conditions.is_mock)),
        )

        # 6. Сохраняем в кэш
        forecast_cache.set(cache_key, forecast)
        
        logger.info(
            "✅ Forecast: %s score=%.1f color=%s wetsuit=%s board=%s mock=%s",
            spot.name,
            forecast.score,
            forecast.color,
            forecast.wetsuit,
            forecast.board,
            forecast.is_mock,
        )
        return forecast

    except Exception as exc:
        logger.error("❌ Failed forecast for %s: %s", spot.name, exc)
        return _create_mock_forecast(spot)


# ============================================================
# 5. Эндпоинты
# ============================================================

@router.get("/spots/{spot_id}/forecast", response_model=SpotForecast)
async def get_spot_forecast(
    spot_id: int,
    skill_level: str = Query(
        "intermediate",
        pattern="^(beginner|intermediate|advanced)$",
    ),
    session: AsyncSession = Depends(get_db),
    weather: WeatherService = Depends(get_weather_service),
) -> SpotForecast:
    """Получить прогноз для одного спота"""
    logger.info("GET /spots/%d/forecast skill=%s", spot_id, skill_level)
    
    spot = await get_spot_by_id(session, spot_id)
    if spot is None:
        raise HTTPException(status_code=404, detail=f"Spot {spot_id} not found")
    
    return await _build_forecast_safe(spot, weather, skill_level)


@router.get("/forecast/bulk", response_model=BulkForecastResponse)
async def get_bulk_forecast(
    spot_ids: str = Query(..., description="Comma-separated spot IDs, e.g. 1,2,3"),
    skill_level: str = Query(
        "intermediate",
        pattern="^(beginner|intermediate|advanced)$",
    ),
    session: AsyncSession = Depends(get_db),
    weather: WeatherService = Depends(get_weather_service),
) -> BulkForecastResponse:
    """Получить прогнозы для нескольких спотов (пакетно)"""
    logger.info("GET /forecast/bulk spot_ids=%s skill=%s", spot_ids, skill_level)

    # 1. Парсим ID
    try:
        ids = [int(s.strip()) for s in spot_ids.split(",") if s.strip()]
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid spot_ids format")

    if not ids:
        raise HTTPException(status_code=422, detail="At least one spot_id required")

    # 2. Получаем споты из БД
    result = await session.execute(select(SpotORM).where(SpotORM.id.in_(ids)))
    spots_map = {s.id: s for s in result.scalars().all()}

    missing = set(ids) - set(spots_map.keys())
    if missing:
        raise HTTPException(
            status_code=404,
            detail=f"Spots not found: {sorted(missing)}",
        )

    # 3. Получаем прогнозы (с кэшем и лимитированием)
    spot_list = [spots_map[sid] for sid in ids if sid in spots_map]
    
    batch_size = 5
    delay_between_batches = 0.5
    forecasts = []
    
    for i in range(0, len(spot_list), batch_size):
        batch = spot_list[i:i + batch_size]
        
        await spot_limiter.wait_if_needed()
        
        tasks = [_build_forecast_safe(spot, weather, skill_level) for spot in batch]
        batch_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in batch_results:
            if isinstance(result, Exception):
                logger.error(f"❌ Batch error: {result}")
                forecasts.append(None)
            else:
                forecasts.append(result)
        
        if i + batch_size < len(spot_list):
            await asyncio.sleep(delay_between_batches)

    # Фильтруем None
    forecasts = [f for f in forecasts if f is not None]

    # 4. Формируем ответ
    items = [
        BulkForecastItem(
            spot_id=f.spot_id,
            spot_name=f.spot_name,
            latitude=spots_map[f.spot_id].latitude,
            longitude=spots_map[f.spot_id].longitude,
            score=f.score,
            color=f.color,
            swell_height=f.swell_height,
            swell_period=f.swell_period,
            wind_speed=f.wind_speed,
            water_temp=f.water_temp,
            wetsuit=f.wetsuit,
            board=f.board,
            is_mock=f.is_mock,
        )
        for f in forecasts
    ]

    logger.info("✅ Bulk forecast returned %d items", len(items))
    return BulkForecastResponse(
        forecasts=items,
        updated_at=forecasts[0].updated_at if forecasts else "",
    )