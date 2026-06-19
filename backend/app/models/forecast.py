"""Pydantic models for surf forecasts."""

from pydantic import BaseModel, Field


class ForecastConditions(BaseModel):
    swell_height: float = Field(default=0.0, description="Swell height in metres")
    swell_period: float = Field(default=8.0, description="Swell period in seconds")
    swell_direction: float = Field(default=180.0, description="Swell direction in degrees")
    swell_direction_label: str = Field(default="S")
    wind_speed: float = Field(default=0.0, description="Wind speed in knots")
    wind_direction: float = Field(default=180.0, description="Wind direction in degrees")
    wind_direction_label: str = Field(default="S")
    water_temp: float = Field(default=20.0, description="Water temperature in °C")


class ForecastScore(BaseModel):
    score: float = Field(default=0.0, ge=0, le=100)
    color: str = Field(default="red", pattern="^(green|yellow|red)$")


class ForecastRecommendations(BaseModel):
    wetsuit: str = Field(default="Full suit 3/2мм")
    board: str = Field(default="Лонгборд или фанборд")


class SpotForecast(ForecastConditions, ForecastScore, ForecastRecommendations):
    spot_id: int
    spot_name: str = Field(default="Unknown")
    updated_at: str = Field(default="")
    is_mock: bool = Field(default=False, description="True when using fallback mock data")


class BulkForecastItem(BaseModel):
    spot_id: int
    spot_name: str = Field(default="Unknown")
    latitude: float = Field(default=0.0)
    longitude: float = Field(default=0.0)
    score: float = Field(default=0.0, ge=0, le=100)
    color: str = Field(default="red")
    swell_height: float = Field(default=0.0)
    swell_period: float = Field(default=8.0)
    wind_speed: float = Field(default=0.0)
    water_temp: float = Field(default=20.0)
    is_mock: bool = Field(default=False)


class BulkForecastResponse(BaseModel):
    forecasts: list[BulkForecastItem] = Field(default_factory=list)
    updated_at: str = Field(default="")


class DebugForecastResponse(SpotForecast):
    """Debug response with algorithm breakdown."""
    algorithm_status: str = Field(default="ok")
