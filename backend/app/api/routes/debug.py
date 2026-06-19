"""Debug endpoints — test algorithm without external APIs."""

import logging
from datetime import UTC, datetime

from fastapi import APIRouter

from app.models.forecast import DebugForecastResponse
from app.services.surf_algorithm import calculate_surf_score
from app.utils.helpers import degrees_to_compass

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/debug", tags=["debug"])

# Fixed mock conditions representing good surf at Kuta-like spot
MOCK_CONDITIONS = {
    "swell_height": 1.6,
    "swell_period": 12.0,
    "swell_direction": 225.0,
    "wind_speed": 7.0,
    "wind_direction": 90.0,
    "beach_orientation": 270.0,
    "water_temp": 27.0,
}


@router.get("/test-forecast", response_model=DebugForecastResponse)
async def test_forecast() -> DebugForecastResponse:
    """
    Returns a mock forecast to verify the surf score algorithm works
    without calling Open-Meteo.
    """
    logger.info("GET /debug/test-forecast - using mock conditions")

    score_result = calculate_surf_score(
        swell_height=MOCK_CONDITIONS["swell_height"],
        swell_period=MOCK_CONDITIONS["swell_period"],
        swell_direction=MOCK_CONDITIONS["swell_direction"],
        wind_speed=MOCK_CONDITIONS["wind_speed"],
        wind_direction=MOCK_CONDITIONS["wind_direction"],
        beach_orientation=MOCK_CONDITIONS["beach_orientation"],
        water_temp=MOCK_CONDITIONS["water_temp"],
        skill_level="intermediate",
    )

    return DebugForecastResponse(
        spot_id=0,
        spot_name="Debug Spot (Mock)",
        updated_at=datetime.now(UTC).isoformat(),
        swell_height=MOCK_CONDITIONS["swell_height"],
        swell_period=MOCK_CONDITIONS["swell_period"],
        swell_direction=MOCK_CONDITIONS["swell_direction"],
        swell_direction_label=degrees_to_compass(MOCK_CONDITIONS["swell_direction"]),
        wind_speed=MOCK_CONDITIONS["wind_speed"],
        wind_direction=MOCK_CONDITIONS["wind_direction"],
        wind_direction_label=degrees_to_compass(MOCK_CONDITIONS["wind_direction"]),
        water_temp=MOCK_CONDITIONS["water_temp"],
        score=float(score_result["score"]),
        color=str(score_result["color"]),
        wetsuit=str(score_result["wetsuit_recommendation"]),
        board=str(score_result["board_recommendation"]),
        is_mock=True,
        algorithm_status="ok",
    )
