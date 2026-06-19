"""FastAPI dependency injection."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.database import get_session
from app.services.weather_service import WeatherService

_weather_service = WeatherService()


def get_weather_service() -> WeatherService:
    return _weather_service


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async for session in get_session():
        yield session
