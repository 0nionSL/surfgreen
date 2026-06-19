"""Seed database with MVP surf spots (Bali + Portugal)."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.database import SpotORM

SPOTS_DATA: list[dict[str, str | float]] = [
    # Bali, Indonesia
    {
        "name": "Kuta",
        "region": "Bali",
        "country": "Indonesia",
        "latitude": -8.7186,
        "longitude": 115.1689,
        "beach_orientation": 270.0,
        "description": "Beginner-friendly beach break, consistent year-round.",
    },
    {
        "name": "Canggu",
        "region": "Bali",
        "country": "Indonesia",
        "latitude": -8.6482,
        "longitude": 115.1382,
        "beach_orientation": 270.0,
        "description": "Popular reef and beach breaks — Berawa, Echo Beach, Batu Bolong.",
    },
    {
        "name": "Keramas",
        "region": "Bali",
        "country": "Indonesia",
        "latitude": -8.5917,
        "longitude": 115.3653,
        "beach_orientation": 90.0,
        "description": "Fast reef break, hosts WSL events. Best on east swell.",
    },
    {
        "name": "Uluwatu",
        "region": "Bali",
        "country": "Indonesia",
        "latitude": -8.8292,
        "longitude": 115.0847,
        "beach_orientation": 225.0,
        "description": "World-class left-hand reef break on the Bukit Peninsula.",
    },
    {
        "name": "Bingin",
        "region": "Bali",
        "country": "Indonesia",
        "latitude": -8.8097,
        "longitude": 115.1142,
        "beach_orientation": 225.0,
        "description": "Short, hollow left reef — best at mid tide.",
    },
    # Portugal
    {
        "name": "Ericeira",
        "region": "Lisbon",
        "country": "Portugal",
        "latitude": 39.0175,
        "longitude": -9.4158,
        "beach_orientation": 270.0,
        "description": "World Surfing Reserve with multiple reef and beach breaks.",
    },
    {
        "name": "Supertubos",
        "region": "Peniche",
        "country": "Portugal",
        "latitude": 39.3622,
        "longitude": -9.3847,
        "beach_orientation": 270.0,
        "description": "Heavy beach break — hosts WSL Pro event.",
    },
    {
        "name": "Armacao de Pera",
        "region": "Algarve",
        "country": "Portugal",
        "latitude": 37.0883,
        "longitude": -8.2456,
        "beach_orientation": 180.0,
        "description": "Long sandy beach with mellow waves, good for beginners.",
    },
    {
        "name": "Sagres",
        "region": "Algarve",
        "country": "Portugal",
        "latitude": 37.0086,
        "longitude": -8.9439,
        "beach_orientation": 270.0,
        "description": "Exposed point and beach breaks at Europe's southwestern tip.",
    },
    {
        "name": "Carvoeiro",
        "region": "Algarve",
        "country": "Portugal",
        "latitude": 37.1011,
        "longitude": -8.4728,
        "beach_orientation": 180.0,
        "description": "Scenic cove with mellow summer waves.",
    },
]


async def seed_spots(session: AsyncSession) -> int:
    """Insert spots if table is empty. Returns number of spots seeded."""
    result = await session.execute(select(SpotORM.id).limit(1))
    if result.scalar_one_or_none() is not None:
        return 0

    for spot_data in SPOTS_DATA:
        session.add(SpotORM(**spot_data))

    await session.commit()
    return len(SPOTS_DATA)
