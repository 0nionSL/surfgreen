"""Equipment recommendations based on conditions."""

from app.utils.constants import SURF_LEVELS


def get_wetsuit_recommendation(water_temp: float) -> str:
    if water_temp >= 22:
        return "Шорты / Lycra"
    if water_temp >= 18:
        return "Shorty 2мм"
    if water_temp >= 15:
        return "Full suit 3/2мм"
    if water_temp >= 12:
        return "Full suit 4/3мм + boots"
    return "Full suit 5/4/3мм + boots + gloves + hood"


def get_board_recommendation(
    wave_height: float,
    level: str = "intermediate",
) -> str:
    if level not in SURF_LEVELS:
        level = "intermediate"

    if level == "beginner":
        if wave_height <= 1.0:
            return "Софтборд (безопасно)"
        return "Не рекомендуется, ищи другой спот"

    if level == "intermediate":
        if wave_height <= 1.5:
            return "Лонгборд или фанборд"
        if wave_height <= 2.5:
            return "Шортборд или фанборд"
        return "Шортборд (осторожно, крупная волна)"

    # advanced
    if wave_height >= 2.0:
        return "Шортборд (для трюков)"
    if wave_height >= 1.0:
        return "Шортборд или фанборд"
    return "Лонгборд или софтборд"
