"""
Business logic services for Jal-Drishti Delhi.
Flood risk calculation, LSTM-style predictions, readiness scoring.
"""

import random
from datetime import datetime, timedelta


def calculate_flood_risk(base_risk, rainfall, elevation=210, drainage_density=0.6):
    """
    Calculate dynamic flood risk for a hotspot.
    Factors: base risk, current rainfall, elevation penalty, drainage capacity.
    Returns value between 0.0 and 1.0.
    """
    rainfall_factor = min(rainfall / 100, 1.5)
    elevation_penalty = max(0, (215 - elevation) / 50)
    drainage_penalty = max(0, (0.7 - drainage_density) / 0.7) * 0.15
    risk = base_risk * (1 + rainfall_factor) + elevation_penalty * 0.1 + drainage_penalty
    return round(min(max(risk, 0.0), 1.0), 4)


def get_risk_status(risk):
    """Return status label and severity for a risk value."""
    if risk > 0.75:
        return "CRITICAL", "critical"
    elif risk > 0.50:
        return "MODERATE", "moderate"
    else:
        return "SAFE", "safe"


def generate_risk_trend(base_risk, rainfall, hours=7):
    """Generate historical risk trend data for past N hours."""
    trend = []
    for i in range(hours):
        offset = (hours - 1 - i) * 5
        adjusted_rainfall = max(0, rainfall - offset)
        risk = calculate_flood_risk(base_risk, adjusted_rainfall)
        trend.append(round(risk * 100, 1))
    return trend


def generate_water_level_prediction(rainfall, hours_back=6, hours_forward=6):
    """
    Generate LSTM-style water level prediction data.
    Returns historical levels, predicted levels, and timestamps.
    """
    random.seed(42)
    now = datetime.now()

    # Historical data
    hist_times = [(now - timedelta(hours=hours_back - i)).isoformat() for i in range(hours_back + 1)]
    base_level = 2.1
    historical = []
    for i in range(hours_back + 1):
        noise = random.uniform(-0.05, 0.05)
        level = base_level - 0.6 + i * 0.1 + noise
        historical.append(round(level, 3))

    # Predicted data
    pred_times = [(now + timedelta(hours=i)).isoformat() for i in range(1, hours_forward + 1)]
    predicted = []
    current = historical[-1]
    for i in range(1, hours_forward + 1):
        increment = (rainfall / 50) * 0.15 + random.uniform(-0.08, 0.08)
        current = current + increment
        predicted.append(round(current, 3))

    return {
        "historical": {
            "times": hist_times,
            "levels": historical,
        },
        "predicted": {
            "times": pred_times,
            "levels": predicted,
        },
        "current_level": historical[-1],
        "max_predicted": max(predicted) if predicted else historical[-1],
        "danger_threshold": 3.5,
        "warning_threshold": 3.0,
    }


def generate_drain_flow_data(base_flow, hours=24):
    """Generate 24-hour flow rate data for a drain."""
    random.seed(int(base_flow))
    data = []
    for h in range(hours):
        variation = random.uniform(-25, 25)
        flow = max(10, base_flow + variation)
        data.append({"hour": h, "flow_rate": round(flow, 1)})
    return data


def calculate_readiness_score(zone_data, rainfall=0):
    """
    Calculate Pre-Monsoon Readiness Score for a ward zone.
    Components (each 0-25, total 0-100):
      - Drainage readiness
      - Pump infrastructure
      - Terrain risk mitigation
      - Historical preparedness
    Rainfall degrades the score to simulate real-time conditions.
    """
    drainage = zone_data["base_drainage_score"] / 4  # normalize to 0-25
    pump = zone_data["pump_infra"] / 4
    terrain = zone_data["terrain_score"] / 4
    historical = zone_data["historical_prep"] / 4

    total = drainage + pump + terrain + historical

    # Rainfall degrades readiness
    rainfall_penalty = min(rainfall / 150, 1.0) * 15
    total = max(0, total - rainfall_penalty)

    return {
        "total": round(total, 1),
        "drainage_readiness": round(drainage, 1),
        "pump_infrastructure": round(pump, 1),
        "terrain_mitigation": round(terrain, 1),
        "historical_preparedness": round(historical, 1),
        "grade": (
            "A" if total >= 80 else
            "B" if total >= 65 else
            "C" if total >= 50 else
            "D" if total >= 35 else
            "F"
        ),
    }


def calculate_zone_risk_distribution(rainfall):
    """Calculate risk levels for Delhi zones based on rainfall."""
    zones = {
        "North": 0.90,
        "South": 0.70,
        "East": 0.85,
        "West": 0.75,
        "Central": 0.80,
    }
    result = []
    for zone_name, base in zones.items():
        risk = min(base * (1 + rainfall / 100), 1.0)
        status, severity = get_risk_status(risk)
        result.append({
            "zone": zone_name,
            "risk": round(risk, 3),
            "status": status,
            "severity": severity,
        })
    return result
