"""SQLite database setup and session management."""

import logging
import os
from collections.abc import AsyncGenerator
from pathlib import Path

from sqlalchemy import Float, Integer, String, Text, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

logger = logging.getLogger(__name__)

DATABASE_DIR = Path(__file__).resolve().parent
DEFAULT_DB_PATH = DATABASE_DIR / "surfgreen.db"
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite+aiosqlite:///{DEFAULT_DB_PATH.as_posix()}",
)


class Base(DeclarativeBase):
    pass


class SpotORM(Base):
    __tablename__ = "spots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    region: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    beach_orientation: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


engine = create_async_engine(DATABASE_URL, echo=False)
async_session_factory = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session


async def init_db() -> None:
    """Create tables if they do not exist."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("SQLite ready at %s", DATABASE_URL)


async def get_spot_by_id(session: AsyncSession, spot_id: int) -> SpotORM | None:
    """Fetch a single spot or return None if not found."""
    result = await session.execute(select(SpotORM).where(SpotORM.id == spot_id))
    return result.scalar_one_or_none()


async def spot_exists(session: AsyncSession, spot_id: int) -> bool:
    """Check whether a spot exists without loading the full row."""
    spot = await get_spot_by_id(session, spot_id)
    return spot is not None
