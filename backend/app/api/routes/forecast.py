"""Forecast endpoints — single spot and bulk for map view."""

import asyncio
import logging

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


async def _build_forecast(
    spot: SpotORM,
    weather: WeatherService,
    skill_level: str = "intermediate",
) -> SpotForecast:
    """Fetch conditions, calculate score, and return a validated forecast model."""
    try:
        conditions = await weather.get_conditions(spot.latitude, spot.longitude)
        enriched = weather.enrich_with_labels(conditions)

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
            wetsuit=str(score_result["wetsuit_recommendation"]),
            board=str(score_result["board_recommendation"]),
            is_mock=bool(enriched.get("is_mock", conditions.is_mock)),
        )

        logger.info(
            "Forecast spot=%s score=%.1f color=%s mock=%s",
            spot.name,
            forecast.score,
            forecast.color,
            forecast.is_mock,
        )
        return forecast

    except Exception as exc:
        logger.error("Failed to build forecast for spot %s: %s", spot.id, exc)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate forecast: {exc}",
        ) from exc


@router.get("/spots/{spot_id}/forecast", response_model=SpotForecast)
async def spot_forecast(
    spot_id: int,
    skill_level: str = Query(
        "intermediate",
        pattern="^(beginner|intermediate|advanced)$",
    ),
    session: AsyncSession = Depends(get_db),
    weather: WeatherService = Depends(get_weather_service),
) -> SpotForecast:
    logger.info("GET /spots/%d/forecast skill=%s", spot_id, skill_level)
    spot = await get_spot_by_id(session, spot_id)
    if spot is None:
        raise HTTPException(status_code=404, detail=f"Spot {spot_id} not found")
    return await _build_forecast(spot, weather, skill_level)


@router.get("/forecast/bulk", response_model=BulkForecastResponse)
async def bulk_forecast(
    spot_ids: str = Query(..., description="Comma-separated spot IDs, e.g. 1,2,3"),
    session: AsyncSession = Depends(get_db),
    weather: WeatherService = Depends(get_weather_service),
) -> BulkForecastResponse:
    logger.info("GET /forecast/bulk spot_ids=%s", spot_ids)

    try:
        ids = [int(s.strip()) for s in spot_ids.split(",") if s.strip()]
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="Invalid spot_ids format") from exc

    if not ids:
        raise HTTPException(status_code=422, detail="At least one spot_id required")

    result = await session.execute(select(SpotORM).where(SpotORM.id.in_(ids)))
    spots_map = {s.id: s for s in result.scalars().all()}

    missing = set(ids) - set(spots_map.keys())
    if missing:
        raise HTTPException(
            status_code=404,
            detail=f"Spots not found: {sorted(missing)}",
        )

    try:
        forecasts = await asyncio.gather(
            *[_build_forecast(spots_map[sid], weather) for sid in ids]
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Bulk forecast failed: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=f"Bulk forecast failed: {exc}",
        ) from exc

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
            is_mock=f.is_mock,
        )
        for f in forecasts
    ]

    logger.info("Bulk forecast returned %d items", len(items))
    return BulkForecastResponse(
        forecasts=items,
        updated_at=forecasts[0].updated_at if forecasts else "",
    )
