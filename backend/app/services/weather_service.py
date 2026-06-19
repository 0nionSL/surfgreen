"""Open-Meteo weather and marine data integration with in-memory cache."""

import logging
import time
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any

import httpx

from app.utils.constants import WEATHER_CACHE_TTL_SECONDS
from app.utils.helpers import degrees_to_compass

logger = logging.getLogger(__name__)

MARINE_API_URL = "https://marine-api.open-meteo.com/v1/marine"
WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast"
MARINE_TIMEOUT = 10.0
WEATHER_TIMEOUT = 3.0  # Short timeout — wind_wave fallback from marine data

# Approximate knots from wind-wave height (metres) when weather API is unavailable
WIND_WAVE_TO_KNOTS = 12.0


class WeatherServiceError(Exception):
    """Raised when no weather data (live or mock) can be produced."""


@dataclass
class WeatherData:
    swell_height: float
    swell_period: float
    swell_direction: float
    wind_speed: float
    wind_direction: float
    water_temp: float
    fetched_at: datetime
    is_mock: bool = False


class WeatherService:
    """Fetches and caches surf-relevant data from Open-Meteo (no API key required)."""

    def __init__(self) -> None:
        self._cache: dict[str, tuple[WeatherData, float]] = {}

    def _cache_key(self, lat: float, lon: float) -> str:
        return f"{lat:.4f},{lon:.4f}"

    def _get_cached(self, key: str) -> WeatherData | None:
        entry = self._cache.get(key)
        if entry is None:
            return None
        data, expires_at = entry
        if time.monotonic() > expires_at:
            del self._cache[key]
            return None
        return data

    def _set_cache(self, key: str, data: WeatherData) -> None:
        self._cache[key] = (data, time.monotonic() + WEATHER_CACHE_TTL_SECONDS)

    async def get_conditions(self, latitude: float, longitude: float) -> WeatherData:
        """Return live conditions; fall back to mock data if APIs are unreachable."""
        key = self._cache_key(latitude, longitude)
        cached = self._get_cached(key)
        if cached is not None:
            logger.debug("Cache hit for %s", key)
            return cached

        try:
            data = await self._fetch_conditions(latitude, longitude)
        except Exception as exc:
            logger.warning(
                "Open-Meteo unavailable for (%.4f, %.4f): %s — using mock data",
                latitude,
                longitude,
                exc,
            )
            data = self._mock_data(latitude, longitude)

        self._set_cache(key, data)
        return data

    async def _fetch_conditions(self, latitude: float, longitude: float) -> WeatherData:
        marine_timeout = httpx.Timeout(MARINE_TIMEOUT)
        weather_timeout = httpx.Timeout(WEATHER_TIMEOUT)

        async with httpx.AsyncClient(timeout=marine_timeout) as client:
            try:
                marine_resp = await client.get(
                    MARINE_API_URL, params=self._marine_params(latitude, longitude)
                )
                marine_resp.raise_for_status()
                marine_json = marine_resp.json()
            except httpx.HTTPError as exc:
                raise WeatherServiceError(f"Marine API error: {exc}") from exc

        # Try weather API separately with a shorter timeout (has wind_wave fallback)
        try:
            async with httpx.AsyncClient(timeout=weather_timeout) as client:
                weather_resp = await client.get(
                    WEATHER_API_URL, params=self._weather_params(latitude, longitude)
                )
                weather_resp.raise_for_status()
                return self._parse_responses(marine_json, weather_resp.json())
        except httpx.HTTPError as exc:
            logger.warning(
                "Weather API failed (%s), using wind_wave fallback from marine data",
                exc,
            )
            return self._parse_marine_with_wind_fallback(marine_json)

    @staticmethod
    def _marine_params(lat: float, lon: float) -> dict[str, Any]:
        return {
            "latitude": lat,
            "longitude": lon,
            "hourly": (
                "swell_wave_height,swell_wave_period,swell_wave_direction,"
                "sea_surface_temperature,wind_wave_height,wind_wave_direction"
            ),
            "forecast_days": 1,
            "timezone": "auto",
        }

    @staticmethod
    def _weather_params(lat: float, lon: float) -> dict[str, Any]:
        return {
            "latitude": lat,
            "longitude": lon,
            "hourly": "wind_speed_10m,wind_direction_10m",
            "wind_speed_unit": "kn",
            "forecast_days": 1,
            "timezone": "auto",
        }

    def _parse_marine_with_wind_fallback(self, marine: dict) -> WeatherData:
        """Parse marine response; estimate wind from wind_wave when weather API is down."""
        marine_hourly = marine.get("hourly", {})
        idx = self._current_hour_index(marine_hourly.get("time", []))

        wind_wave_height = self._value_at(marine_hourly, "wind_wave_height", idx, 0.5)
        wind_direction = self._value_at(marine_hourly, "wind_wave_direction", idx, 180.0)
        # Rough conversion: wind-wave height → surface wind speed in knots
        wind_speed = max(2.0, min(wind_wave_height * WIND_WAVE_TO_KNOTS, 25.0))

        return WeatherData(
            swell_height=round(self._value_at(marine_hourly, "swell_wave_height", idx, 1.0), 2),
            swell_period=round(self._value_at(marine_hourly, "swell_wave_period", idx, 8.0), 1),
            swell_direction=round(
                self._value_at(marine_hourly, "swell_wave_direction", idx, 180.0), 0
            ),
            wind_speed=round(wind_speed, 1),
            wind_direction=round(wind_direction, 0),
            water_temp=round(
                self._value_at(marine_hourly, "sea_surface_temperature", idx, 20.0), 1
            ),
            fetched_at=datetime.now(UTC),
            is_mock=False,
        )

    def _parse_responses(self, marine: dict, weather: dict) -> WeatherData:
        """Pick the current hour's values from hourly arrays."""
        marine_hourly = marine.get("hourly", {})
        weather_hourly = weather.get("hourly", {})

        idx = self._current_hour_index(marine_hourly.get("time", []))

        return WeatherData(
            swell_height=round(
                self._value_at(marine_hourly, "swell_wave_height", idx, 1.0), 2
            ),
            swell_period=round(
                self._value_at(marine_hourly, "swell_wave_period", idx, 8.0), 1
            ),
            swell_direction=round(
                self._value_at(marine_hourly, "swell_wave_direction", idx, 180.0), 0
            ),
            wind_speed=round(
                self._value_at(weather_hourly, "wind_speed_10m", idx, 8.0), 1
            ),
            wind_direction=round(
                self._value_at(weather_hourly, "wind_direction_10m", idx, 180.0), 0
            ),
            water_temp=round(
                self._value_at(marine_hourly, "sea_surface_temperature", idx, 20.0), 1
            ),
            fetched_at=datetime.now(UTC),
            is_mock=False,
        )

    @staticmethod
    def _mock_data(latitude: float, longitude: float) -> WeatherData:
        """Deterministic mock data for offline/testing based on coordinates."""
        seed = abs(int(latitude * 100) + int(longitude * 100))
        return WeatherData(
            swell_height=round(0.8 + (seed % 15) / 10, 2),
            swell_period=round(8.0 + (seed % 6), 1),
            swell_direction=float((seed * 17) % 360),
            wind_speed=round(5.0 + (seed % 8), 1),
            wind_direction=float((seed * 23) % 360),
            water_temp=round(18.0 + (seed % 10), 1),
            fetched_at=datetime.now(UTC),
            is_mock=True,
        )

    @staticmethod
    def _current_hour_index(times: list[str]) -> int:
        if not times:
            return 0
        now_iso = datetime.now(UTC).strftime("%Y-%m-%dT%H:00")
        for i, t in enumerate(times):
            if t.startswith(now_iso[:13]):
                return i
        return 0

    @staticmethod
    def _value_at(
        hourly: dict,
        key: str,
        index: int,
        default: float,
    ) -> float:
        values = hourly.get(key, [])
        if not values or index >= len(values):
            return default
        val = values[index]
        if val is None:
            return default
        try:
            return float(val)
        except (TypeError, ValueError):
            return default

    def enrich_with_labels(self, data: WeatherData) -> dict[str, float | str | bool]:
        return {
            "swell_height": data.swell_height,
            "swell_period": data.swell_period,
            "swell_direction": data.swell_direction,
            "swell_direction_label": degrees_to_compass(data.swell_direction),
            "wind_speed": data.wind_speed,
            "wind_direction": data.wind_direction,
            "wind_direction_label": degrees_to_compass(data.wind_direction),
            "water_temp": data.water_temp,
            "is_mock": data.is_mock,
        }
