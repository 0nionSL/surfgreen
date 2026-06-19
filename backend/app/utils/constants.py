"""SurfGreen constants — score thresholds, compass helpers."""

SCORE_GREEN_MIN = 80
SCORE_YELLOW_MIN = 60

SCORE_COLOR_GREEN = "green"
SCORE_COLOR_YELLOW = "yellow"
SCORE_COLOR_RED = "red"

# Cache TTL for weather API responses (seconds)
WEATHER_CACHE_TTL_SECONDS = 3600

# Compass direction labels (16-point)
COMPASS_DIRECTIONS: list[str] = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
]

SURF_LEVELS = ("beginner", "intermediate", "advanced")
