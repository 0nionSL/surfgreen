"""
Surf score algorithm — converts raw conditions into a 0-100 score and color.

Scoring breakdown (max 100):
  - Swell angle vs beach: 30 pts
  - Swell period:         25 pts
  - Wind:                 35 pts (onshore penalty)
  - Wave height:          10 pts
"""

import logging
import math
from typing import Any

from app.services.recommendations import get_board_recommendation, get_wetsuit_recommendation
from app.utils.helpers import angle_difference, score_to_color

logger = logging.getLogger(__name__)


def _safe_float(value: float | None, default: float = 0.0) -> float:
    """Coerce value to float; handle None and NaN safely."""
    if value is None:
        return default
    try:
        result = float(value)
    except (TypeError, ValueError):
        return default
    if math.isnan(result) or math.isinf(result):
        return default
    return result


def _score_swell_angle(swell_direction: float, beach_orientation: float) -> float:
    """
    Ideal swell hits the beach at 30-60° off-perpendicular.
    beach_orientation = direction the beach faces (where waves should come FROM).
    """
    deviation = angle_difference(swell_direction, beach_orientation)

    if 30 <= deviation <= 60:
        return 30.0
    if 15 <= deviation <= 75:
        return 20.0
    return 5.0


def _score_swell_period(period: float) -> float:
    if period >= 12:
        return 25.0
    if period >= 9:
        return 15.0
    return 5.0


def _score_wind(
    wind_speed: float,
    wind_direction: float,
    beach_orientation: float,
) -> float:
    """
    Offshore wind blows from land toward sea — opposite to beach facing direction.
    beach faces 270° (W) → offshore wind from ~90° (E), deviation ~180°.
    """
    wind_vs_beach = angle_difference(wind_direction, beach_orientation)

    # Offshore: wind blows toward the ocean (~150-210° from beach facing dir)
    is_offshore = 150 <= wind_vs_beach <= 210
    # Onshore: wind blows from ocean toward beach (~330-30°)
    is_onshore = wind_vs_beach <= 30 or wind_vs_beach >= 330

    if is_offshore:
        return 25.0 if wind_speed > 10 else 35.0
    if is_onshore:
        return -15.0
    return 15.0  # side-shore


def _score_wave_height(height: float) -> float:
    if 1.0 <= height <= 2.5:
        return 10.0
    if (0.5 <= height < 1.0) or (2.5 < height <= 4.0):
        return 5.0
    return 0.0


def calculate_surf_score(
    swell_height: float | None,
    swell_period: float | None,
    swell_direction: float | None,
    wind_speed: float | None,
    wind_direction: float | None,
    beach_orientation: float | None,
    water_temp: float | None,
    skill_level: str = "intermediate",
) -> dict[str, Any]:
    """Return score dict with color and equipment recommendations."""
    swell_height = _safe_float(swell_height, 1.0)
    swell_period = _safe_float(swell_period, 8.0)
    swell_direction = _safe_float(swell_direction, 180.0) % 360
    wind_speed = max(0.0, _safe_float(wind_speed, 5.0))
    wind_direction = _safe_float(wind_direction, 180.0) % 360
    beach_orientation = _safe_float(beach_orientation, 270.0) % 360
    water_temp = _safe_float(water_temp, 20.0)

    raw_score = (
        _score_swell_angle(swell_direction, beach_orientation)
        + _score_swell_period(swell_period)
        + _score_wind(wind_speed, wind_direction, beach_orientation)
        + _score_wave_height(swell_height)
    )
    score = max(0.0, min(100.0, raw_score))

    result = {
        "score": round(score, 1),
        "color": score_to_color(score),
        "wetsuit_recommendation": get_wetsuit_recommendation(water_temp),
        "board_recommendation": get_board_recommendation(swell_height, skill_level),
    }

    logger.debug(
        "Score calculated: %.1f (%s) | swell=%.1fm period=%.0fs wind=%.0fkn",
        result["score"],
        result["color"],
        swell_height,
        swell_period,
        wind_speed,
    )
    return result
