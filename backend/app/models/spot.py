"""Pydantic models for surf spots."""

from pydantic import BaseModel, ConfigDict, Field


class SpotBase(BaseModel):
    name: str
    region: str
    country: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    beach_orientation: float = Field(
        ...,
        ge=0,
        lt=360,
        description="Direction the beach faces (degrees, 0=N)",
    )
    description: str | None = None


class SpotCreate(SpotBase):
    pass


class SpotResponse(SpotBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class SpotSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    region: str
    country: str
    latitude: float
    longitude: float
