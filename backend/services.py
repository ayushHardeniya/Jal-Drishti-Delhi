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


# ---------------------------------------------------------------------------
# Planning / Resource Allocation
# ---------------------------------------------------------------------------

def _zone_key_from_ward(ward_name):
    """Convert a ward code such as 'Southwest-12' into a zone name."""
    prefix = ward_name.split("-")[0].strip()
    return f"{prefix} Delhi"


def _readiness_lookup(ward_zones, rainfall):
    """Build a lookup of readiness scores keyed by zone name."""
    lookup = {}
    for zone in ward_zones:
        readiness = calculate_readiness_score(zone, rainfall)
        lookup[zone["zone"]] = readiness
    return lookup


def _risk_urgency_bonus(risk_pct):
    if risk_pct >= 95:
        return 20.0
    if risk_pct >= 85:
        return 12.0
    if risk_pct >= 75:
        return 6.0
    return 0.0


def _resource_type_for_hotspot(hotspot, risk_pct, readiness_grade):
    name = hotspot["name"]
    if name in {"Minto Road", "ITO"} and risk_pct >= 80:
        return "traffic_units"
    if risk_pct >= 95:
        return "evacuation_vehicles"
    if risk_pct >= 88:
        return "pumps"
    if risk_pct >= 78 and readiness_grade in {"D", "F"}:
        return "field_teams"
    if risk_pct >= 70 and hotspot["population"] >= 50000:
        return "sms_batches"
    if readiness_grade in {"D", "F"}:
        return "field_teams"
    if risk_pct >= 75:
        return "medical_units"
    return "pumps"


def _requested_quantity(resource_type, risk_pct, population):
    if resource_type == "traffic_units":
        return 2 if risk_pct >= 85 else 1
    if resource_type == "evacuation_vehicles":
        return 2 if population >= 80000 else 1
    if resource_type == "sms_batches":
        return 1
    if resource_type == "medical_units":
        return 1 if risk_pct < 90 else 2
    if resource_type == "field_teams":
        return 2 if risk_pct >= 85 else 1
    return 4 if risk_pct >= 95 else 2 if risk_pct >= 85 else 1


def _zone_priority_record(zone_name, zone_risk_pct, readiness, population_at_risk, drainage_status):
    readiness_gap = max(0.0, 100 - readiness["total"])
    priority_score = round(
        min(
            100.0,
            (zone_risk_pct * 0.42)
            + (readiness_gap * 0.28)
            + (min(population_at_risk / 1000, 100) * 0.18)
            + ((100 - readiness["terrain_mitigation"] * 4) * 0.07)
            + (_risk_urgency_bonus(zone_risk_pct) * 0.05),
        ),
        1,
    )
    return {
        "zone_id": f"zone-{zone_name.lower().replace(' ', '-')}",
        "zone_name": zone_name,
        "zone_type": "ward",
        "risk_pct": round(zone_risk_pct, 1),
        "readiness_score": readiness["total"],
        "readiness_grade": readiness["grade"],
        "population_at_risk": int(population_at_risk),
        "drainage_status": drainage_status,
        "priority_score": priority_score,
        "primary_driver": (
            "High flood exposure with weak readiness"
            if readiness_gap >= 40
            else "Elevated flood pressure and moderate readiness gap"
        ),
    }


def build_resource_allocation_plan(rainfall, hotspots, drainage_systems, ward_zones, inventory, weights, plan_limit=6):
    """Generate a deterministic resource allocation plan."""
    now = datetime.now().isoformat()
    readiness_lookup = _readiness_lookup(ward_zones, rainfall)
    max_population = max((h["population"] for h in hotspots), default=1)
    total_drain_status = {
        "Clear": sum(1 for d in drainage_systems if d["status"] == "Clear"),
        "Silted": sum(1 for d in drainage_systems if d["status"] == "Silted"),
        "Blocked": sum(1 for d in drainage_systems if d["status"] == "Blocked"),
    }

    scored_hotspots = []
    for hotspot in hotspots:
        risk = calculate_flood_risk(
            hotspot["base_risk"], rainfall, hotspot["elevation"], hotspot["drainage_density"]
        )
        status, severity = get_risk_status(risk)
        zone_name = _zone_key_from_ward(hotspot["ward"])
        readiness = readiness_lookup.get(zone_name, {
            "total": 50.0,
            "grade": "C",
            "drainage_readiness": 12.5,
            "pump_infrastructure": 12.5,
            "terrain_mitigation": 12.5,
            "historical_preparedness": 12.5,
        })
        population_score = (hotspot["population"] / max_population) * 100
        readiness_gap = max(0.0, 100 - readiness["total"])
        drainage_penalty = (1 - hotspot["drainage_density"]) * 100
        urgency_bonus = _risk_urgency_bonus(risk * 100)
        corridor_bonus = 10.0 if hotspot["name"] in {"Minto Road", "ITO"} else 0.0

        priority_score = round(
            min(
                100.0,
                (risk * 100 * weights["flood_risk"])
                + (population_score * weights["population_exposure"])
                + (readiness_gap * weights["readiness_gap"])
                + (drainage_penalty * weights["drainage_penalty"])
                + ((urgency_bonus + corridor_bonus) * weights["operational_urgency"]),
            ),
            1,
        )

        resource_type = _resource_type_for_hotspot(hotspot, risk * 100, readiness["grade"])
        requested_quantity = _requested_quantity(resource_type, risk * 100, hotspot["population"])

        supporting_factors = [
            f"Risk level is {risk * 100:.1f}% ({status})",
            f"Readiness grade for {zone_name} is {readiness['grade']}",
            f"Drainage density is {hotspot['drainage_density']:.2f}",
        ]
        if hotspot["name"] in {"Minto Road", "ITO"}:
            supporting_factors.append("High-visibility corridor requires traffic control support")
        if severity == "critical":
            supporting_factors.append("Critical severity triggers immediate intervention")

        reason = (
            f"{hotspot['name']} combines {status.lower()} flood risk with {readiness['grade']} readiness in {zone_name}. "
            f"Resource type {resource_type} is prioritized because it best addresses the dominant constraint."
        )

        estimated_effect = {
            "risk_reduction_pct": round(min(18.0, risk * 100 * 0.15 + readiness_gap * 0.04), 1),
            "population_protected": int(hotspot["population"]),
            "response_time_gain_min": round(8 + (requested_quantity * 2.5), 1),
            "drainage_capacity_gain_pct": round(min(15.0, hotspot["drainage_density"] * 8), 1),
            "readiness_gain_pct": round(min(6.0, readiness_gap * 0.08), 1),
        }

        scored_hotspots.append({
            "hotspot": hotspot,
            "risk": risk,
            "status": status,
            "severity": severity,
            "zone_name": zone_name,
            "readiness": readiness,
            "priority_score": priority_score,
            "resource_type": resource_type,
            "requested_quantity": requested_quantity,
            "supporting_factors": supporting_factors,
            "reason": reason,
            "estimated_effect": estimated_effect,
            "population_score": population_score,
            "readiness_gap": readiness_gap,
            "drainage_penalty": drainage_penalty,
        })

    scored_hotspots.sort(key=lambda item: item["priority_score"], reverse=True)

    allocated_totals = {key: 0 for key in inventory}
    recommendations = []
    for item in scored_hotspots:
        if len(recommendations) >= plan_limit:
            break
        resource_type = item["resource_type"]
        available_remaining = inventory[resource_type] - allocated_totals[resource_type]
        if available_remaining <= 0:
            continue
        quantity = min(item["requested_quantity"], available_remaining)
        if quantity <= 0:
            continue

        allocated_totals[resource_type] += quantity
        recommendations.append({
            "rank": len(recommendations) + 1,
            "target_type": "hotspot",
            "target_id": item["hotspot"]["id"],
            "target_name": item["hotspot"]["name"],
            "zone_name": item["zone_name"],
            "resource_type": resource_type,
            "quantity": quantity,
            "priority_score": item["priority_score"],
            "confidence": round(min(98.0, 82.0 + (item["priority_score"] * 0.15)), 1),
            "reason": item["reason"],
            "expected_effect": item["estimated_effect"],
            "supporting_factors": item["supporting_factors"],
            "status": "recommended",
        })

    priority_zone_map = {}
    for item in scored_hotspots:
        zone_name = item["zone_name"]
        readiness = item["readiness"]
        current = priority_zone_map.get(zone_name)
        if current is None:
            current = {
                "risk_pct": item["risk"] * 100,
                "population_at_risk": item["hotspot"]["population"],
                "drainage_status": "Blocked" if item["hotspot"]["drainage_density"] < 0.5 else "Silted" if item["hotspot"]["drainage_density"] < 0.7 else "Clear",
                "readiness": readiness,
            }
        else:
            current["risk_pct"] = max(current["risk_pct"], item["risk"] * 100)
            current["population_at_risk"] += item["hotspot"]["population"]
            if item["hotspot"]["drainage_density"] < 0.5:
                current["drainage_status"] = "Blocked"
            elif item["hotspot"]["drainage_density"] < 0.7 and current["drainage_status"] == "Clear":
                current["drainage_status"] = "Silted"
        priority_zone_map[zone_name] = current

    priority_zones = []
    for zone_name, data in priority_zone_map.items():
        priority_zones.append(_zone_priority_record(
            zone_name,
            data["risk_pct"],
            data["readiness"],
            data["population_at_risk"],
            data["drainage_status"],
        ))
    priority_zones.sort(key=lambda item: item["priority_score"], reverse=True)
    priority_zones = priority_zones[:6]

    critical_hotspots = sum(1 for item in scored_hotspots if item["risk"] >= 0.75)
    high_risk_population = sum(item["hotspot"]["population"] for item in scored_hotspots if item["risk"] >= 0.60)
    zones_evaluated = len(ward_zones)
    drains_evaluated = len(drainage_systems)
    resources_committed = sum(rec["quantity"] for rec in recommendations)
    priority_actions = len(recommendations)

    overall_urgency = (
        "critical" if critical_hotspots >= 4 else
        "high" if critical_hotspots >= 2 else
        "moderate" if critical_hotspots >= 1 else
        "low"
    )

    reasoning = {
        "method": "Weighted operational prioritization using current flood risk, population exposure, readiness gap, drainage penalty, and urgency.",
        "factor_weights": weights,
        "explanations": [
            f"{recommendations[0]['target_name']} ranks first because it has the strongest combined flood exposure and readiness gap." if recommendations else "No allocations were required.",
            f"{zones_evaluated} ward zones and {drains_evaluated} drainage systems were evaluated for the current plan.",
            f"{total_drain_status['Blocked']} blocked and {total_drain_status['Silted']} silted drains increase the operational urgency.",
        ],
    }

    expected_impact = {
        "risk_reduction_pct": round(sum(rec["expected_effect"]["risk_reduction_pct"] for rec in recommendations) / len(recommendations), 1) if recommendations else 0,
        "population_covered": int(sum(rec["expected_effect"]["population_protected"] for rec in recommendations)),
        "critical_hotspots_stabilized": critical_hotspots,
        "drains_intervened": min(total_drain_status["Blocked"] + total_drain_status["Silted"], 3),
        "readiness_improvement_pct": round(sum(rec["expected_effect"]["readiness_gain_pct"] for rec in recommendations) / len(recommendations), 1) if recommendations else 0,
        "estimated_time_to_stabilization_min": round(28 + (priority_actions * 3.5), 1),
    }

    return {
        "plan_id": f"plan_{datetime.now().strftime('%Y%m%d_%H%M%S')}_delhi",
        "generated_at": now,
        "rainfall_mm": rainfall,
        "context": {
            "mode": "current",
            "notes": "Allocation plan generated from current rainfall state and live hotspot/readiness data.",
        },
        "summary": {
            "total_hotspots_evaluated": len(hotspots),
            "critical_hotspots": critical_hotspots,
            "high_risk_population": int(high_risk_population),
            "zones_evaluated": zones_evaluated,
            "drains_evaluated": drains_evaluated,
            "resources_committed": resources_committed,
            "priority_actions": priority_actions,
            "overall_action_urgency": overall_urgency,
        },
        "resource_inventory": {
            "available": inventory,
            "reserved": allocated_totals,
            "remaining": {key: inventory[key] - allocated_totals[key] for key in inventory},
        },
        "priority_zones": priority_zones,
        "ranked_recommendations": recommendations,
        "reasoning": reasoning,
        "expected_impact": expected_impact,
    }


def apply_resource_allocation_plan(plan, state):
    """Apply allocation actions to the in-memory application state."""
    applied = []
    for recommendation in plan.get("ranked_recommendations", []):
        entry = {
            "timestamp": datetime.now().isoformat(),
            "type": f"ALLOCATION_{recommendation['resource_type'].upper()}",
            "description": (
                f"Allocated {recommendation['quantity']} {recommendation['resource_type']} to "
                f"{recommendation['target_name']}"
            ),
        }
        state["actions_log"].insert(0, entry)
        if len(state["actions_log"]) > 100:
            state["actions_log"] = state["actions_log"][:100]

        if recommendation["resource_type"] == "pumps":
            state["pumps_deployed"] += recommendation["quantity"]
        elif recommendation["resource_type"] == "sms_batches":
            state["alerts_sent"] += recommendation["quantity"]

        applied.append({
            "target_name": recommendation["target_name"],
            "resource_type": recommendation["resource_type"],
            "quantity": recommendation["quantity"],
            "log": entry,
        })

    return {
        "message": "Resource allocation plan applied successfully.",
        "applied": applied,
        "state": {
            "rainfall": state["rainfall"],
            "pumps_deployed": state["pumps_deployed"],
            "alerts_sent": state["alerts_sent"],
        },
        "actions_log": state["actions_log"][:20],
    }
