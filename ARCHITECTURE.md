# Jal-Drishti Delhi - Full Stack Architecture

## Project Structure

```
Jal-Drishti-Delhi/
|
|-- backend/                    Flask REST API
|   |-- app.py                  Main Flask application, all API routes
|   |-- data.py                 Static data: hotspots, drains, wards, historical records
|   |-- services.py             Business logic: risk calculation, predictions, readiness scoring
|   |-- requirements.txt        Python dependencies
|
|-- frontend/                   React Application
|   |-- public/
|   |   |-- index.html
|   |-- src/
|   |   |-- api.js              Axios API client, all endpoint bindings
|   |   |-- App.js              Root component, routing, sidebar, rainfall control
|   |   |-- App.css             Global styles: government-functional theme
|   |   |-- index.js            React entry point
|   |   |-- index.css           CSS reset
|   |   |-- components/
|   |   |   |-- MetricCard.jsx  Reusable metric display card
|   |   |   |-- StatusBadge.jsx Severity/status badge component
|   |   |   |-- MapView.jsx     Leaflet GIS map with hotspot markers
|   |   |-- pages/
|   |   |   |-- Dashboard.jsx   Main dashboard: metrics, map, alerts, prediction chart
|   |   |   |-- Hotspots.jsx    10 flood micro-zones with detail cards and trend charts
|   |   |   |-- Drainage.jsx    6 drain systems with flow charts and maintenance actions
|   |   |   |-- Analytics.jsx   LSTM prediction, risk distribution, rainfall correlation
|   |   |   |-- Historical.jsx  10-year data: yearly trends, seasonal distribution, CSV export
|   |   |   |-- Readiness.jsx   Pre-Monsoon Readiness Score (ward-level, radar chart)
|   |   |   |-- Emergency.jsx   One-click emergency actions, situation report, actions log
|   |-- package.json
|
|-- start_fullstack.bat          One-click launcher for both servers
|-- ARCHITECTURE.md              This file
```

## Running the Application

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm

### Quick Start
Double-click `start_fullstack.bat` or run manually:

**Terminal 1 - Backend:**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```

- Backend API: http://localhost:5000
- Frontend UI: http://localhost:3000

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/state | App state (rainfall, pumps, alerts) |
| GET/PUT | /api/settings/rainfall | Get/set rainfall simulation value |
| GET | /api/dashboard/summary | Dashboard metrics |
| GET | /api/dashboard/alerts | Recent alerts |
| GET | /api/hotspots | All hotspots with computed risk |
| POST | /api/hotspots/:id/deploy-pumps | Deploy pumps to hotspot |
| POST | /api/hotspots/:id/traffic-diversion | Activate traffic diversion |
| POST | /api/hotspots/:id/alert-residents | Send SMS alert to residents |
| GET | /api/drainage | All drains with 24h flow data |
| POST | /api/drainage/:id/schedule-maintenance | Schedule desilting |
| GET | /api/analytics/prediction | LSTM water level prediction |
| GET | /api/analytics/risk-distribution | Zone-wise risk |
| GET | /api/analytics/rainfall-correlation | Historical correlation data |
| GET | /api/analytics/metrics | Model accuracy and confidence |
| GET | /api/historical/yearly | Year-wise incident data |
| GET | /api/historical/seasonal | Monthly averages |
| GET | /api/historical/affected-areas | Most affected areas |
| GET | /api/historical/summary | Summary statistics |
| GET | /api/historical/download | Full dataset for CSV export |
| GET | /api/readiness | Pre-Monsoon Readiness Scores |
| GET | /api/emergency/status | Emergency resource status |
| POST | /api/emergency/deploy-pumps | Emergency pump deployment |
| POST | /api/emergency/traffic-diversion | Traffic protocol activation |
| POST | /api/emergency/mass-sms | Mass SMS alert |
| POST | /api/emergency/ndrf-request | NDRF deployment request |
| POST | /api/emergency/evacuate | Zone evacuation order |
| POST | /api/emergency/medical-teams | Medical team dispatch |
| POST | /api/emergency/alert-all | Alert all services |
| GET | /api/emergency/situation-report | Generate situation report |
| GET | /api/emergency/contacts | Emergency contact directory |
| GET | /api/emergency/actions-log | Recent actions log |

### Pre-Monsoon Readiness Score

The readiness score (0-100) is computed per ward zone using four equally-weighted components (0-25 each):

1. **Drainage Readiness** - Drain network capacity and clearance status
2. **Pump Infrastructure** - Availability and distribution of pumping stations
3. **Terrain Mitigation** - Elevation profile and surface imperviousness management
4. **Historical Preparedness** - Past performance in monsoon response

Grades: A (80-100), B (65-79), C (50-64), D (35-49), F (0-34)

Rainfall simulation dynamically degrades the score to show real-time stress impact.

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend | Flask 3.x | REST API server |
| Backend | NumPy, Pandas | Data processing and simulation |
| Frontend | React 18 | UI framework |
| Frontend | React Router 6 | Client-side routing |
| Frontend | Recharts | Charts (line, bar, area, radar) |
| Frontend | React-Leaflet | GIS map with OpenStreetMap tiles |
| Frontend | Axios | HTTP client for API calls |
| Styling | Custom CSS | Government-functional theme, no CSS framework |
