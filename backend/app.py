"""
Jal-Drishti Delhi - Flask Backend API
Urban Flooding & Hydrology Command Center
India Innovates 2026
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import random

from data import (
    HOTSPOTS, DRAINAGE_SYSTEMS, HISTORICAL_YEARLY,
    HISTORICAL_MONTHLY_AVG, AFFECTED_AREAS, EMERGENCY_CONTACTS,
    WARD_ZONES, RESOURCE_INVENTORY, ALLOCATION_WEIGHTS, PLANNING_RULES,
)
from services import (
    calculate_flood_risk, get_risk_status, generate_risk_trend,
    generate_water_level_prediction, generate_drain_flow_data,
    calculate_readiness_score, calculate_zone_risk_distribution,
    build_resource_allocation_plan, apply_resource_allocation_plan,
)

app = Flask(__name__)
CORS(app)

# In-memory application state
state = {
    "rainfall": 0,
    "pumps_deployed": 0,
    "alerts_sent": 0,
    "actions_log": [],
}


# ---------------------------------------------------------------------------
# Utility
# ---------------------------------------------------------------------------

def _get_rainfall():
    """Get rainfall from query param or current state."""
    r = request.args.get("rainfall", None)
    if r is not None:
        return float(r)
    return state["rainfall"]


def _log_action(action_type, description):
    """Record an emergency action."""
    entry = {
        "timestamp": datetime.now().isoformat(),
        "type": action_type,
        "description": description,
    }
    state["actions_log"].insert(0, entry)
    if len(state["actions_log"]) > 100:
        state["actions_log"] = state["actions_log"][:100]
    return entry


# ---------------------------------------------------------------------------
# Settings / State
# ---------------------------------------------------------------------------

@app.route("/api/settings/rainfall", methods=["GET"])
def get_rainfall():
    return jsonify({"rainfall": state["rainfall"]})


@app.route("/api/settings/rainfall", methods=["PUT"])
def set_rainfall():
    data = request.get_json(force=True)
    state["rainfall"] = max(0, min(int(data.get("rainfall", 0)), 300))
    return jsonify({"rainfall": state["rainfall"]})


@app.route("/api/state", methods=["GET"])
def get_state():
    return jsonify({
        "rainfall": state["rainfall"],
        "pumps_deployed": state["pumps_deployed"],
        "alerts_sent": state["alerts_sent"],
    })


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

@app.route("/api/dashboard/summary", methods=["GET"])
def dashboard_summary():
    rainfall = _get_rainfall()
    active_alerts = sum(
        1 for h in HOTSPOTS
        if calculate_flood_risk(h["base_risk"], rainfall) > 0.75
    )
    drains_clear = sum(1 for d in DRAINAGE_SYSTEMS if d["status"] == "Clear")
    total_drains = len(DRAINAGE_SYSTEMS)

    # Overall readiness
    scores = [calculate_readiness_score(z, rainfall)["total"] for z in WARD_ZONES]
    avg_readiness = round(sum(scores) / len(scores), 1) if scores else 0

    return jsonify({
        "rainfall_24h": round(rainfall * 0.6, 1),
        "rainfall_current": rainfall,
        "active_alerts": active_alerts,
        "pumps_deployed": state["pumps_deployed"],
        "drains_clear": drains_clear,
        "drains_total": total_drains,
        "total_hotspots": len(HOTSPOTS),
        "network_km": 2152,
        "population_at_risk": sum(h["population"] for h in HOTSPOTS if calculate_flood_risk(h["base_risk"], rainfall) > 0.60),
        "pre_monsoon_readiness": avg_readiness,
    })


@app.route("/api/dashboard/alerts", methods=["GET"])
def dashboard_alerts():
    rainfall = _get_rainfall()
    alerts = []
    base_alerts = [
        {"time": "17:45", "location": "Minto Road", "type": "Water Level Rising", "severity": "critical"},
        {"time": "17:30", "location": "Najafgarh", "type": "Heavy Rainfall", "severity": "moderate"},
        {"time": "17:15", "location": "ITO", "type": "Drain Overflow", "severity": "critical"},
        {"time": "17:00", "location": "Kirari", "type": "Traffic Disruption", "severity": "moderate"},
        {"time": "16:45", "location": "Pul Prahladpur", "type": "Water Logging", "severity": "moderate"},
        {"time": "16:30", "location": "Yamuna Bank", "type": "River Level Rising", "severity": "warning"},
    ]
    # Show more alerts when rainfall is higher
    count = min(len(base_alerts), max(2, int(rainfall / 20)))
    return jsonify(base_alerts[:count])


# ---------------------------------------------------------------------------
# Hotspots
# ---------------------------------------------------------------------------

@app.route("/api/hotspots", methods=["GET"])
def get_hotspots():
    rainfall = _get_rainfall()
    result = []
    for h in HOTSPOTS:
        risk = calculate_flood_risk(h["base_risk"], rainfall, h["elevation"], h["drainage_density"])
        status, severity = get_risk_status(risk)
        trend = generate_risk_trend(h["base_risk"], rainfall)
        result.append({
            **h,
            "current_risk": round(risk, 4),
            "risk_pct": round(risk * 100, 1),
            "status": status,
            "severity": severity,
            "trend_6h": trend,
        })
    result.sort(key=lambda x: x["current_risk"], reverse=True)
    return jsonify(result)


@app.route("/api/hotspots/<int:hotspot_id>/deploy-pumps", methods=["POST"])
def deploy_pumps_to_hotspot(hotspot_id):
    spot = next((h for h in HOTSPOTS if h["id"] == hotspot_id), None)
    if not spot:
        return jsonify({"error": "Hotspot not found"}), 404
    state["pumps_deployed"] += 2
    entry = _log_action("PUMP_DEPLOY", f"Deployed 2 pumps to {spot['name']}")
    return jsonify({"message": f"Deployed 2 pumps to {spot['name']}", "total_pumps": state["pumps_deployed"], "log": entry})


@app.route("/api/hotspots/<int:hotspot_id>/traffic-diversion", methods=["POST"])
def traffic_diversion(hotspot_id):
    spot = next((h for h in HOTSPOTS if h["id"] == hotspot_id), None)
    if not spot:
        return jsonify({"error": "Hotspot not found"}), 404
    entry = _log_action("TRAFFIC_DIVERSION", f"Traffic diversion activated for {spot['name']}")
    return jsonify({"message": f"Traffic alert sent for {spot['name']}", "log": entry})


@app.route("/api/hotspots/<int:hotspot_id>/alert-residents", methods=["POST"])
def alert_residents(hotspot_id):
    spot = next((h for h in HOTSPOTS if h["id"] == hotspot_id), None)
    if not spot:
        return jsonify({"error": "Hotspot not found"}), 404
    state["alerts_sent"] += 1
    entry = _log_action("RESIDENT_ALERT", f"SMS alert sent to {spot['population']:,} residents near {spot['name']}")
    return jsonify({"message": f"Alert sent to {spot['population']:,} residents", "log": entry})


# ---------------------------------------------------------------------------
# Drainage
# ---------------------------------------------------------------------------

@app.route("/api/drainage", methods=["GET"])
def get_drainage():
    result = []
    for d in DRAINAGE_SYSTEMS:
        flow_data = generate_drain_flow_data(d["flow_rate"])
        result.append({**d, "flow_data_24h": flow_data})
    return jsonify(result)


@app.route("/api/drainage/<int:drain_id>/schedule-maintenance", methods=["POST"])
def schedule_maintenance(drain_id):
    drain = next((d for d in DRAINAGE_SYSTEMS if d["id"] == drain_id), None)
    if not drain:
        return jsonify({"error": "Drain not found"}), 404
    entry = _log_action("MAINTENANCE", f"Maintenance crew dispatched to {drain['name']}")
    return jsonify({"message": f"Maintenance scheduled for {drain['name']}", "log": entry})


# ---------------------------------------------------------------------------
# Analytics / Predictions
# ---------------------------------------------------------------------------

@app.route("/api/analytics/prediction", methods=["GET"])
def get_prediction():
    rainfall = _get_rainfall()
    data = generate_water_level_prediction(rainfall)
    return jsonify(data)


@app.route("/api/analytics/risk-distribution", methods=["GET"])
def risk_distribution():
    rainfall = _get_rainfall()
    return jsonify(calculate_zone_risk_distribution(rainfall))


@app.route("/api/analytics/rainfall-correlation", methods=["GET"])
def rainfall_correlation():
    return jsonify({
        "months": HISTORICAL_MONTHLY_AVG["months"],
        "rainfall": HISTORICAL_MONTHLY_AVG["avg_rainfall_mm"],
        "incidents": HISTORICAL_MONTHLY_AVG["avg_incidents"],
    })


@app.route("/api/analytics/metrics", methods=["GET"])
def analytics_metrics():
    rainfall = _get_rainfall()
    current_level = 2.1
    predicted_level = round(current_level + (rainfall / 50) * 0.9, 2)
    accuracy = round(94.5 - (rainfall * 0.05), 1)
    confidence = round(91.2 - (rainfall * 0.04), 1)
    return jsonify({
        "current_level": current_level,
        "predicted_level_3h": predicted_level,
        "model_accuracy": accuracy,
        "confidence": confidence,
    })


# ---------------------------------------------------------------------------
# Historical
# ---------------------------------------------------------------------------

@app.route("/api/historical/yearly", methods=["GET"])
def historical_yearly():
    return jsonify(HISTORICAL_YEARLY)


@app.route("/api/historical/seasonal", methods=["GET"])
def historical_seasonal():
    return jsonify(HISTORICAL_MONTHLY_AVG)


@app.route("/api/historical/affected-areas", methods=["GET"])
def affected_areas():
    return jsonify(AFFECTED_AREAS)


@app.route("/api/historical/summary", methods=["GET"])
def historical_summary():
    return jsonify({
        "years_analyzed": 10,
        "total_incidents": sum(HISTORICAL_YEARLY["incidents"]),
        "people_affected": f"{sum(HISTORICAL_YEARLY['people_affected']):,}",
        "damage_crores": sum(HISTORICAL_YEARLY["damage_crores"]),
    })


@app.route("/api/historical/download", methods=["GET"])
def historical_download():
    """Return full historical dataset as JSON (frontend converts to CSV)."""
    random.seed(99)
    rows = []
    for year in range(2016, 2027):
        for month in range(1, 13):
            is_monsoon = 6 <= month <= 9
            rows.append({
                "year": year,
                "month": month,
                "incidents": random.randint(10, 40) if is_monsoon else random.randint(0, 5),
                "rainfall_mm": random.randint(100, 250) if is_monsoon else random.randint(10, 50),
                "people_affected": random.randint(5000, 50000) if is_monsoon else random.randint(0, 2000),
            })
    return jsonify(rows)


# ---------------------------------------------------------------------------
# Pre-Monsoon Readiness Score
# ---------------------------------------------------------------------------

@app.route("/api/readiness", methods=["GET"])
def readiness_scores():
    rainfall = _get_rainfall()
    result = []
    for zone in WARD_ZONES:
        score = calculate_readiness_score(zone, rainfall)
        result.append({
            "zone": zone["zone"],
            "wards": zone["wards"],
            **score,
        })
    avg = round(sum(r["total"] for r in result) / len(result), 1) if result else 0
    grade = (
        "A" if avg >= 80 else
        "B" if avg >= 65 else
        "C" if avg >= 50 else
        "D" if avg >= 35 else
        "F"
    )
    return jsonify({
        "overall_score": avg,
        "overall_grade": grade,
        "total_wards": sum(z["wards"] for z in WARD_ZONES),
        "zones": result,
    })


# ---------------------------------------------------------------------------
# Planning / Resource Allocation
# ---------------------------------------------------------------------------

@app.route("/api/planning/allocation", methods=["GET"])
def planning_allocation():
    rainfall = _get_rainfall()
    plan = build_resource_allocation_plan(
        rainfall=rainfall,
        hotspots=HOTSPOTS,
        drainage_systems=DRAINAGE_SYSTEMS,
        ward_zones=WARD_ZONES,
        inventory=RESOURCE_INVENTORY,
        weights=ALLOCATION_WEIGHTS,
        plan_limit=PLANNING_RULES["top_recommendation_limit"],
    )
    return jsonify(plan)


@app.route("/api/planning/summary", methods=["GET"])
def planning_summary():
    rainfall = _get_rainfall()
    plan = build_resource_allocation_plan(
        rainfall=rainfall,
        hotspots=HOTSPOTS,
        drainage_systems=DRAINAGE_SYSTEMS,
        ward_zones=WARD_ZONES,
        inventory=RESOURCE_INVENTORY,
        weights=ALLOCATION_WEIGHTS,
        plan_limit=PLANNING_RULES["top_recommendation_limit"],
    )
    return jsonify({
        "plan_id": plan["plan_id"],
        "generated_at": plan["generated_at"],
        "rainfall_mm": plan["rainfall_mm"],
        "summary": plan["summary"],
        "expected_impact": plan["expected_impact"],
    })


@app.route("/api/planning/allocation/apply", methods=["POST"])
def apply_planning_allocation():
    rainfall = _get_rainfall()
    plan = build_resource_allocation_plan(
        rainfall=rainfall,
        hotspots=HOTSPOTS,
        drainage_systems=DRAINAGE_SYSTEMS,
        ward_zones=WARD_ZONES,
        inventory=RESOURCE_INVENTORY,
        weights=ALLOCATION_WEIGHTS,
        plan_limit=PLANNING_RULES["top_recommendation_limit"],
    )
    result = apply_resource_allocation_plan(plan, state)
    result["plan_id"] = plan["plan_id"]
    return jsonify(result)


# ---------------------------------------------------------------------------
# Emergency
# ---------------------------------------------------------------------------

@app.route("/api/emergency/status", methods=["GET"])
def emergency_status():
    return jsonify({
        "teams_available": 12,
        "pumps_ready": 45,
        "pumps_active": state["pumps_deployed"],
        "boats_ready": 8,
        "rescue_teams": 15,
        "response_time_min": 15,
        "police_connected": True,
        "fire_dept_connected": True,
        "hospitals_connected": True,
    })


@app.route("/api/emergency/deploy-pumps", methods=["POST"])
def emergency_deploy_pumps():
    count = request.get_json(force=True).get("count", 5)
    state["pumps_deployed"] += count
    entry = _log_action("EMERGENCY_PUMPS", f"Emergency deployment of {count} pumps")
    return jsonify({"message": f"Deployed {count} pumps", "total": state["pumps_deployed"], "log": entry})


@app.route("/api/emergency/traffic-diversion", methods=["POST"])
def emergency_traffic_diversion():
    entry = _log_action("TRAFFIC_PROTOCOL", "Traffic diversion protocol activated for all affected routes")
    return jsonify({
        "message": "Traffic diversion protocol activated",
        "routes": [
            "Minto Road -> ITO Bypass",
            "Ring Road -> Outer Ring Road",
            "NH-8 -> Alternative Route",
        ],
        "log": entry,
    })


@app.route("/api/emergency/mass-sms", methods=["POST"])
def emergency_mass_sms():
    state["alerts_sent"] += 1
    entry = _log_action("MASS_SMS", "Mass SMS alert sent to 500,000 residents in affected areas")
    return jsonify({
        "message": "SMS sent to 500,000 residents in affected areas",
        "content": "Heavy rain alert. Avoid low-lying areas. Stay indoors. MCD Helpline: 1800-111-6772",
        "log": entry,
    })


@app.route("/api/emergency/ndrf-request", methods=["POST"])
def ndrf_request():
    entry = _log_action("NDRF_REQUEST", "NDRF deployment requested. ETA: 45 minutes")
    return jsonify({"message": "NDRF deployment requested. ETA: 45 minutes", "log": entry})


@app.route("/api/emergency/evacuate", methods=["POST"])
def emergency_evacuate():
    entry = _log_action("EVACUATION", "Evacuation order issued for Najafgarh, Kirari, Minto Road")
    return jsonify({
        "message": "Evacuation order issued",
        "zones": [
            {"name": "Najafgarh", "population": 90000},
            {"name": "Kirari", "population": 75000},
            {"name": "Minto Road", "population": 50000},
        ],
        "log": entry,
    })


@app.route("/api/emergency/medical-teams", methods=["POST"])
def medical_teams():
    entry = _log_action("MEDICAL", "8 mobile medical units dispatched to affected areas")
    return jsonify({"message": "8 mobile medical units dispatched", "log": entry})


@app.route("/api/emergency/alert-all", methods=["POST"])
def alert_all_services():
    entry = _log_action("COORDINATED_ALERT", "Coordinated alert sent to all emergency services")
    return jsonify({
        "message": "Coordinated alert sent to all emergency services",
        "notified": ["Delhi Police", "Fire Department", "Hospitals", "PWD", "Media"],
        "log": entry,
    })


@app.route("/api/emergency/situation-report", methods=["GET"])
def situation_report():
    rainfall = _get_rainfall()
    zones = calculate_zone_risk_distribution(rainfall)
    report = []
    for z in zones:
        pumps = 8 if z["severity"] == "critical" else 3 if z["severity"] == "moderate" else 0
        evac = 5000 if z["severity"] == "critical" else 1200 if z["severity"] == "moderate" else 0
        report.append({
            "zone": z["zone"],
            "status": z["status"],
            "risk_pct": round(z["risk"] * 100, 1),
            "pumps_deployed": pumps,
            "people_evacuated": evac,
        })
    return jsonify({
        "generated_at": datetime.now().isoformat(),
        "rainfall": rainfall,
        "zones": report,
    })


@app.route("/api/emergency/contacts", methods=["GET"])
def emergency_contacts():
    return jsonify(EMERGENCY_CONTACTS)


@app.route("/api/emergency/actions-log", methods=["GET"])
def actions_log():
    return jsonify(state["actions_log"][:20])


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True, port=5000)
