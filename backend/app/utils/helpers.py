"""Shared helper utilities."""

from app.utils.constants import COMPASS_DIRECTIONS


def degrees_to_compass(degrees: float) -> str:
    """Convert 0-360° bearing to 16-point compass label."""
    normalized = degrees % 360
    index = round(normalized / 22.5) % 16
    return COMPASS_DIRECTIONS[index]


def angle_difference(a: float, b: float) -> float:
    """Smallest absolute difference between two bearings (0-180°)."""
    diff = abs(a - b) % 360
    return diff if diff <= 180 else 360 - diff


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two coordinates in kilometres."""
    import math

    r = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def score_to_color(score: float) -> str:
    from app.utils.constants import (
        SCORE_COLOR_GREEN,
        SCORE_COLOR_RED,
        SCORE_COLOR_YELLOW,
        SCORE_GREEN_MIN,
        SCORE_YELLOW_MIN,
    )

    if score >= SCORE_GREEN_MIN:
        return SCORE_COLOR_GREEN
    if score >= SCORE_YELLOW_MIN:
        return SCORE_COLOR_YELLOW
    return SCORE_COLOR_RED
