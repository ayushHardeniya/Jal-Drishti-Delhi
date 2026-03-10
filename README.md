# Jal-Drishti Delhi

**Urban Flooding & Hydrology Command Center**
Municipal Corporation of Delhi | India Innovates 2026

---

## Problem Statement

> Urban Flooding & Hydrology Engine: Develop a GIS-integrated predictive system to identify
> 2,500+ urban flood micro-hotspots using historical rainfall data, terrain elevation, and
> drainage capacity. The solution should generate a ward-level "Pre-Monsoon Readiness Score"
> to enable proactive resource deployment before heavy rainfall events.

---

## What This System Does

Jal-Drishti Delhi is a full-stack web application that provides a command-center interface
for urban flood prediction and management across Delhi NCR. It combines GIS mapping, predictive
analytics, drainage network monitoring, and ward-level readiness scoring into a single
operational dashboard used by MCD engineers and emergency response teams.

**Core capabilities:**

- Real-time flood risk assessment across 10 identified micro-hotspots
- GIS map visualization with risk-coded markers (OpenStreetMap + Leaflet)
- LSTM-based 6-hour water level prediction
- AI-powered drainage network monitoring (2,152 km coverage, 6 major drains)
- Ward-level Pre-Monsoon Readiness Score (0-100 scale, 8 zones, 272 wards)
- One-click emergency response actions with audit logging
- 10-year historical trend analysis with CSV export
- Rainfall simulation slider that dynamically recomputes all risk calculations

---

## Tech Stack

| Layer | Technology | Version | Role |
|-------|-----------|---------|------|
| **Backend** | Python | 3.8+ | Runtime |
| | Flask | 3.1.0 | REST API server |
| | Flask-CORS | 5.0.1 | Cross-origin request handling |
| | NumPy | 1.26.x | Numerical computation, prediction simulation |
| | Pandas | 2.1.x | Tabular data processing |
| **Frontend** | React | 18.2 | UI framework |
| | React Router | 6.22 | Client-side page routing |
| | Recharts | 2.12 | Charting library (line, bar, area, radar) |
| | Leaflet | 1.9.4 | Map rendering engine |
| | React-Leaflet | 4.2.1 | React bindings for Leaflet |
| | Axios | 1.6.7 | HTTP client for API communication |
| **Map Tiles** | OpenStreetMap | - | Base map tile provider |
| **Styling** | Custom CSS | - | Government-functional theme, no framework |

No external databases. No third-party CSS frameworks. No paid APIs.
All data is computed server-side from static seed datasets and simulation logic.

---

## Architecture

```
+---------------------------------------------------+
|                    Browser                         |
|                                                    |
|  React 18 SPA (port 3000)                         |
|  +-----------------------------------------------+|
|  | App.js -- Layout, Router, Sidebar, Rainfall   ||
|  |                                                ||
|  | Pages:                                         ||
|  |   Dashboard    -- Summary metrics, map, alerts ||
|  |   Hotspots     -- 10 zone detail cards + map   ||
|  |   Drainage     -- 6 drain cards + flow charts  ||
|  |   Analytics    -- LSTM prediction, risk dist.  ||
|  |   Historical   -- 10yr trends, CSV download    ||
|  |   Readiness    -- Pre-Monsoon Score, radar     ||
|  |   Emergency    -- Actions, report, contacts    ||
|  |                                                ||
|  | Components:                                    ||
|  |   MapView, MetricCard, StatusBadge             ||
|  +-----------------------------------------------+|
|             |  Axios HTTP (JSON)                   |
+-------------|-------------------------------------+
              v
+---------------------------------------------------+
|  Flask API Server (port 5000)                      |
|                                                    |
|  app.py   -- 30+ REST endpoints                   |
|  data.py  -- Static seed data                      |
|    - 10 hotspots (coords, elevation, drainage)     |
|    - 6 drainage systems                            |
|    - 8 ward zones (readiness parameters)           |
|    - 10yr historical records                       |
|    - Emergency contact directory                   |
|                                                    |
|  services.py -- Business logic                     |
|    - calculate_flood_risk()                        |
|    - generate_water_level_prediction()             |
|    - calculate_readiness_score()                   |
|    - calculate_zone_risk_distribution()            |
|    - generate_risk_trend()                         |
|    - generate_drain_flow_data()                    |
|                                                    |
|  In-memory state:                                  |
|    - rainfall, pumps_deployed, alerts_sent         |
|    - actions_log (audit trail)                     |
+---------------------------------------------------+
```

### Data Flow

1. User adjusts rainfall slider in sidebar
2. Frontend sends `PUT /api/settings/rainfall` to backend
3. Every page component fetches its data with `?rainfall=N` query parameter
4. Backend computes risk/prediction/readiness using `services.py` functions
5. JSON response rendered by React components (tables, charts, map markers)
6. Emergency actions trigger POST endpoints, results logged server-side

### Flood Risk Calculation

```
risk = base_risk * (1 + rainfall_factor) + elevation_penalty + drainage_penalty

where:
  rainfall_factor = min(rainfall / 100, 1.5)
  elevation_penalty = max(0, (215 - elevation) / 50) * 0.1
  drainage_penalty = max(0, (0.7 - drainage_density) / 0.7) * 0.15
  result clamped to [0.0, 1.0]
```

### Pre-Monsoon Readiness Score

Each ward zone is scored 0-100 across four components (0-25 each):

| Component | What It Measures |
|-----------|-----------------|
| Drainage Readiness | Drain network capacity and clearance status |
| Pump Infrastructure | Availability and distribution of pumping stations |
| Terrain Mitigation | Elevation profile and surface imperviousness management |
| Historical Preparedness | Past performance and resource deployment history |

Grades: A (80-100), B (65-79), C (50-64), D (35-49), F (0-34)

Active rainfall degrades the score in real-time to simulate monsoon stress.

---

## Project Structure

```
Jal-Drishti-Delhi/
|
|-- backend/
|   |-- app.py                  Flask API, 30+ endpoints
|   |-- data.py                 Seed data (hotspots, drains, wards, history)
|   |-- services.py             Risk calculation, prediction, readiness scoring
|   |-- requirements.txt        Python dependencies
|
|-- frontend/
|   |-- public/
|   |   |-- index.html          HTML shell
|   |-- src/
|   |   |-- api.js              Axios client, all endpoint bindings
|   |   |-- App.js              Root layout, router, sidebar, rainfall control
|   |   |-- App.css             Government-functional theme
|   |   |-- index.js            React entry
|   |   |-- index.css           CSS reset
|   |   |-- components/
|   |   |   |-- MetricCard.jsx  Metric display card
|   |   |   |-- StatusBadge.jsx Severity badge (CRITICAL / MODERATE / SAFE)
|   |   |   |-- MapView.jsx     Leaflet GIS map with CircleMarkers
|   |   |-- pages/
|   |       |-- Dashboard.jsx   Summary metrics, alert table, map, prediction chart
|   |       |-- Hotspots.jsx    10 flood zones, detail cards, trend charts, actions
|   |       |-- Drainage.jsx    6 drains, flow rate charts, maintenance scheduling
|   |       |-- Analytics.jsx   LSTM forecast, risk distribution, rainfall correlation
|   |       |-- Historical.jsx  10-year trends, seasonal distribution, CSV export
|   |       |-- Readiness.jsx   Pre-Monsoon Readiness Score, radar chart, grading
|   |       |-- Emergency.jsx   Action buttons, situation report, audit log, contacts
|   |-- package.json            Node dependencies
|
|-- start_fullstack.bat         One-click launcher (both servers)
|-- ARCHITECTURE.md             Detailed architecture reference
|-- README.md                   This file
```

---

## API Reference

### State & Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/state` | Current rainfall, pumps deployed, alerts sent |
| GET | `/api/settings/rainfall` | Get current rainfall value |
| PUT | `/api/settings/rainfall` | Set rainfall (`{"rainfall": 80}`) |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | All dashboard metrics |
| GET | `/api/dashboard/alerts` | Recent alert list |

### Hotspots

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hotspots` | All 10 hotspots with computed risk, trend data |
| POST | `/api/hotspots/:id/deploy-pumps` | Deploy pumps to a zone |
| POST | `/api/hotspots/:id/traffic-diversion` | Activate traffic diversion |
| POST | `/api/hotspots/:id/alert-residents` | Send SMS alert to zone residents |

### Drainage

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/drainage` | All 6 drains with 24h flow data |
| POST | `/api/drainage/:id/schedule-maintenance` | Dispatch maintenance crew |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/prediction` | LSTM water level forecast (6h back, 6h forward) |
| GET | `/api/analytics/risk-distribution` | Zone-wise risk levels |
| GET | `/api/analytics/rainfall-correlation` | Monthly rainfall vs incidents |
| GET | `/api/analytics/metrics` | Model accuracy, confidence, current/predicted levels |

### Historical

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/historical/yearly` | Yearly incident counts, damage, people affected |
| GET | `/api/historical/seasonal` | Monthly averages (incidents + rainfall) |
| GET | `/api/historical/affected-areas` | Most affected areas table |
| GET | `/api/historical/summary` | Aggregate statistics |
| GET | `/api/historical/download` | Full dataset (JSON, converted to CSV on client) |

### Pre-Monsoon Readiness

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/readiness` | Scores for all 8 zones + overall grade |

### Emergency

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/emergency/status` | Resource availability and connectivity |
| POST | `/api/emergency/deploy-pumps` | Emergency pump deployment |
| POST | `/api/emergency/traffic-diversion` | Traffic protocol activation |
| POST | `/api/emergency/mass-sms` | Mass SMS to 500K residents |
| POST | `/api/emergency/ndrf-request` | NDRF deployment request |
| POST | `/api/emergency/evacuate` | Evacuation order for high-risk zones |
| POST | `/api/emergency/medical-teams` | Dispatch medical units |
| POST | `/api/emergency/alert-all` | Coordinated alert to all agencies |
| GET | `/api/emergency/situation-report` | Zone-wise situation report |
| GET | `/api/emergency/contacts` | Emergency contact directory |
| GET | `/api/emergency/actions-log` | Last 20 logged actions |

---

## Running the Application

### Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- npm

### Option 1: One-click launcher (Windows)

Double-click `start_fullstack.bat`. Both servers start in separate terminals.

### Option 2: Manual start

**Terminal 1 -- Backend:**

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Server starts at http://localhost:5000

**Terminal 2 -- Frontend:**

```bash
cd frontend
npm install
npm start
```

Opens http://localhost:3000 in browser.

---

## Pages

| # | Page | URL Path | What It Shows |
|---|------|----------|---------------|
| 1 | Dashboard | `/` | Top-line metrics, GIS map, alerts table, prediction chart |
| 2 | Flood Hotspots | `/hotspots` | 10 micro-zone cards with risk trends, coordinates, demographics |
| 3 | Drainage Network | `/drainage` | 6 drain cards, AI confidence, flow rate charts, maintenance actions |
| 4 | Analytics | `/analytics` | LSTM 6h forecast, risk distribution by zone, rainfall correlation |
| 5 | Historical Data | `/historical` | 10-year incident trends, seasonal patterns, affected areas, CSV download |
| 6 | Readiness Score | `/readiness` | Pre-Monsoon Readiness Score, radar comparison, zone breakdown table |
| 7 | Emergency Actions | `/emergency` | Action buttons, situation report generator, audit log, contacts |

---

## Design Decisions

**Why Flask, not Django/FastAPI?**
Lightweight, no ORM needed (no database), minimal boilerplate for a REST API serving
computed data. Flask-CORS handles cross-origin with one line.

**Why React, not Next.js?**
Pure client-side SPA is sufficient. No SSR needed. No SEO requirements.
Keeps the build simple for hackathon deployment.

**Why Recharts, not D3/Plotly?**
Recharts is React-native (JSX components), lightweight, and covers all chart types
needed (line, bar, area, radar, composed). No DOM manipulation conflicts.

**Why no database?**
All data is either static seed data or computed from inputs. In-memory state is adequate
for a command-center prototype. Production would use PostgreSQL with PostGIS.

**Why government-style, not flashy UI?**
The end user is an MCD operations room. The design follows NIC (National Informatics Centre)
patterns: navy header, white content area, bordered cards, data tables, no gradients,
no animations, no emojis. Readability over aesthetics.

---

## Team

Team Zenyukti | India Innovates 2026
