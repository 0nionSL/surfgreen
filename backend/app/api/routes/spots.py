"""Spot CRUD and nearby search endpoints."""

import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db
from app.database.database import SpotORM, get_spot_by_id
from app.models.spot import SpotResponse, SpotSummary
from app.utils.helpers import haversine_km

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/spots", tags=["spots"])


@router.get("", response_model=list[SpotSummary])
async def list_spots(session: AsyncSession = Depends(get_db)) -> list[SpotORM]:
    logger.info("GET /api/spots")
    try:
        result = await session.execute(
            select(SpotORM).order_by(SpotORM.region, SpotORM.name)
        )
        spots = list(result.scalars().all())
        logger.info("Returning %d spots", len(spots))
        return spots
    except Exception as exc:
        logger.error("Failed to list spots: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to fetch spots") from exc


@router.get("/nearby", response_model=list[SpotSummary])
async def nearby_spots(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    radius: float = Query(50.0, gt=0, le=500, description="Search radius in km"),
    session: AsyncSession = Depends(get_db),
) -> list[SpotORM]:
    logger.info("GET /api/spots/nearby lat=%.4f lon=%.4f radius=%.0f", lat, lon, radius)
    try:
        result = await session.execute(select(SpotORM))
        all_spots = result.scalars().all()

        nearby = [
            spot
            for spot in all_spots
            if haversine_km(lat, lon, spot.latitude, spot.longitude) <= radius
        ]
        nearby.sort(key=lambda s: haversine_km(lat, lon, s.latitude, s.longitude))
        logger.info("Found %d spots within %.0f km", len(nearby), radius)
        return nearby
    except Exception as exc:
        logger.error("Nearby search failed: %s", exc)
        raise HTTPException(status_code=500, detail="Nearby search failed") from exc


@router.get("/{spot_id}", response_model=SpotResponse)
async def get_spot(
    spot_id: int,
    session: AsyncSession = Depends(get_db),
) -> SpotORM:
    logger.info("GET /api/spots/%d", spot_id)
    spot = await get_spot_by_id(session, spot_id)
    if spot is None:
        raise HTTPException(status_code=404, detail=f"Spot {spot_id} not found")
    return spot
