"""Tests for surf score algorithm."""

from app.services.surf_algorithm import calculate_surf_score


def test_ideal_conditions_score_green():
    result = calculate_surf_score(
        swell_height=1.8,
        swell_period=13.0,
        swell_direction=225.0,  # SW swell
        wind_speed=8.0,
        wind_direction=45.0,  # offshore for west-facing beach
        beach_orientation=270.0,
        water_temp=24.0,
    )
    assert result["score"] >= 80
    assert result["color"] == "green"
    assert "Lycra" in result["wetsuit_recommendation"]


def test_onshore_wind_penalty():
    result = calculate_surf_score(
        swell_height=1.5,
        swell_period=10.0,
        swell_direction=270.0,
        wind_speed=15.0,
        wind_direction=270.0,  # onshore for west-facing beach
        beach_orientation=270.0,
        water_temp=18.0,
    )
    assert result["score"] < 80
    assert result["color"] in ("yellow", "red")


def test_cold_water_wetsuit():
    result = calculate_surf_score(
        swell_height=1.0,
        swell_period=10.0,
        swell_direction=270.0,
        wind_speed=5.0,
        wind_direction=90.0,
        beach_orientation=270.0,
        water_temp=10.0,
    )
    assert "5/4/3" in result["wetsuit_recommendation"]
