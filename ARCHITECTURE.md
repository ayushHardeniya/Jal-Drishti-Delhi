# Jal-Drishti Delhi - Full Stack Architecture

## System Overview

Jal-Drishti Delhi is a full-stack urban flood monitoring and decision-support platform built for municipal flood management operations across Delhi NCR.

The system combines flood-risk monitoring, drainage analysis, predictive forecasting, readiness assessment, emergency response workflows, resource allocation planning, scenario simulation, and operational reporting into a single command-center application.

---

## Project Structure

```text
Jal-Drishti-Delhi/
|
|-- backend/                           Flask REST API
|   |
|   |-- app.py                         Main Flask application and API routes
|   |-- data.py                        Seed datasets, resource inventory, scenario presets
|   |-- services.py                    Risk models, forecasting, readiness scoring,
|   |                                 planning, simulation and reporting logic
|   |-- requirements.txt               Python dependencies
|
|-- frontend/                          React Single Page Application
|   |
|   |-- public/
|   |   |-- assets/                    Media & Pictures
|   |   |-- index.html                 Application entry HTML
|   |
|   |-- src/
|   |   |
|   |   |-- api.js                     Centralized Axios API client
|   |   |-- App.js                     Routing, sidebar navigation and rainfall controls
|   |   |-- App.css                    Global styling and layout
|   |   |-- index.js                   React entry point
|   |   |-- index.css                  Base styles and resets
|   |   |
|   |   |-- components/               Reusable UI components
|   |   |   |
|   |   |   |-- MetricCard.jsx         Dashboard metric cards
|   |   |   |-- StatusBadge.jsx        Risk and severity indicators
|   |   |   |-- MapView.jsx            GIS visualization using Leaflet
|   |   |   |
|   |   |   |-- AllocationSummaryCard.jsx
|   |   |   |                           Planning summary metrics
|   |   |   |
|   |   |   |-- AllocationRecommendationTable.jsx
|   |   |   |                           Resource allocation recommendations
|   |   |   |
|   |   |   |-- ScenarioControls.jsx
|   |   |   |                           Scenario configuration controls
|   |   |   |
|   |   |   |-- ScenarioComparisonChart.jsx
|   |   |                               Baseline vs simulated comparisons
|   |   |
|   |   |-- pages/                     Application modules
|   |   |   |
|   |   |   |-- Dashboard.jsx          Command-center overview
|   |   |   |-- Hotspots.jsx           Flood hotspot monitoring
|   |   |   |-- Drainage.jsx           Drainage network analysis
|   |   |   |-- Analytics.jsx          Forecasting and risk analytics
|   |   |   |-- Historical.jsx         Historical flood analysis
|   |   |   |-- Readiness.jsx          Pre-Monsoon Readiness Scores
|   |   |   |-- Planning.jsx           Resource Allocation Engine
|   |   |   |-- ScenarioSimulator.jsx  What-if flood simulation workspace
|   |   |   |-- ReportsCenter.jsx      Reports and exports hub
|   |   |   |-- Emergency.jsx          Emergency response operations
|   |
|   |-- package.json                   Frontend dependencies
|   |-- vercel.json                    Vercel deployment configuration
|
|-- screenshots/                       README and submission screenshots
|
|-- ARCHITECTURE.md                    Detailed technical documentation
|-- README.md                          Project overview and setup guide
|-- render.yaml                        Backend deployment configuration
|-- start_fullstack.bat                One-click local launcher
```

---

## Core Application Modules

### Dashboard

Central operational overview containing key metrics, alerts, GIS visualization, and forecasting summaries.

### Flood Hotspots

Monitors flood-prone locations and calculates dynamic risk levels using rainfall, elevation, and drainage characteristics.

### Drainage Network

Tracks major drainage systems, flow behavior, maintenance status, and operational bottlenecks.

### Analytics

Provides forecasting, rainfall correlation analysis, risk distribution, and predictive insights.

### Historical Data

Offers long-term flood trends, incident analysis, and downloadable datasets.

### Readiness Score

Calculates ward-level Pre-Monsoon Readiness Scores using infrastructure, terrain, drainage, and preparedness indicators.

### Planning

Resource Allocation Engine that prioritizes hotspots and recommends deployment of pumps, teams, traffic units, alerts, and emergency resources.

### Scenario Simulator

Allows operators to run what-if flood scenarios by adjusting rainfall intensity, resource availability, response delays, and drainage constraints.

### Emergency Actions

Provides operational workflows such as pump deployment, resident alerts, evacuation actions, and situation management.

### Reports & Exports

Generates operational reports and provides downloadable exports for planning, scenario analysis, and flood management activities.

---

## Application Flow

1. User adjusts rainfall conditions.
2. Frontend requests updated data from backend APIs.
3. Backend recalculates:

   * Flood Risk
   * Water Level Forecasts
   * Readiness Scores
   * Allocation Recommendations
   * Scenario Outcomes
4. Updated results are rendered across maps, charts, tables, and operational views.
5. Emergency actions and planning activities are logged in the system state.

---

## Resource Allocation Engine

The Planning module evaluates:

* Flood Risk
* Population Exposure
* Readiness Gap
* Drainage Constraints
* Operational Urgency

The engine produces:

* Ranked priority zones
* Resource deployment recommendations
* Estimated operational impact
* Resource utilization summaries
* Decision-support explanations

This transforms the platform from a monitoring dashboard into a planning and response-support system.

---

## Scenario Simulator

The simulator enables:

* Rainfall stress testing
* Resource shortage simulation
* Response delay analysis
* Drain blockage modelling
* Comparative scenario evaluation

Outputs include:

* Baseline vs simulated conditions
* Risk changes
* Readiness impact
* Recommended interventions

---

## Reporting System

The reporting layer consolidates operational data into structured outputs including:

* Flood Situation Reports
* Resource Allocation Reports
* Scenario Analysis Reports
* Historical Data Exports

Reports can be downloaded and shared for operational planning and review.

---

## Running the Application

### Prerequisites

* Python 3.8+
* Node.js 18+
* npm

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### Quick Start

```text
start_fullstack.bat
```

Backend API:

```text
http://localhost:5000
```

Frontend:

```text
http://localhost:3000
```

---

## API Reference

### Core System

| Method  | Endpoint               |
| ------- | ---------------------- |
| GET     | /api/state             |
| GET/PUT | /api/settings/rainfall |

### Dashboard

| Method | Endpoint               |
| ------ | ---------------------- |
| GET    | /api/dashboard/summary |
| GET    | /api/dashboard/alerts  |

### Hotspots

| Method | Endpoint                            |
| ------ | ----------------------------------- |
| GET    | /api/hotspots                       |
| POST   | /api/hotspots/:id/deploy-pumps      |
| POST   | /api/hotspots/:id/traffic-diversion |
| POST   | /api/hotspots/:id/alert-residents   |

### Drainage

| Method | Endpoint                               |
| ------ | -------------------------------------- |
| GET    | /api/drainage                          |
| POST   | /api/drainage/:id/schedule-maintenance |

### Analytics

| Method | Endpoint                            |
| ------ | ----------------------------------- |
| GET    | /api/analytics/prediction           |
| GET    | /api/analytics/risk-distribution    |
| GET    | /api/analytics/rainfall-correlation |
| GET    | /api/analytics/metrics              |

### Historical

| Method | Endpoint                       |
| ------ | ------------------------------ |
| GET    | /api/historical/yearly         |
| GET    | /api/historical/seasonal       |
| GET    | /api/historical/affected-areas |
| GET    | /api/historical/summary        |
| GET    | /api/historical/download       |

### Readiness

| Method | Endpoint       |
| ------ | -------------- |
| GET    | /api/readiness |

### Planning

| Method | Endpoint                       |
| ------ | ------------------------------ |
| GET    | /api/planning/allocation       |
| GET    | /api/planning/summary          |
| POST   | /api/planning/allocation/apply |

### Scenario Simulator

| Method | Endpoint                |
| ------ | ----------------------- |
| GET    | /api/scenarios/presets  |
| POST   | /api/scenarios/simulate |

### Reports & Exports

| Method | Endpoint                         |
| ------ | -------------------------------- |
| GET    | /api/reports/catalog             |
| GET    | /api/reports/flood-situation     |
| GET    | /api/reports/resource-allocation |
| GET    | /api/reports/scenario-analysis   |
| GET    | /api/reports/exports             |

### Emergency

| Method | Endpoint                         |
| ------ | -------------------------------- |
| GET    | /api/emergency/status            |
| POST   | /api/emergency/deploy-pumps      |
| POST   | /api/emergency/traffic-diversion |
| POST   | /api/emergency/mass-sms          |
| POST   | /api/emergency/ndrf-request      |
| POST   | /api/emergency/evacuate          |
| POST   | /api/emergency/medical-teams     |
| POST   | /api/emergency/alert-all         |
| GET    | /api/emergency/situation-report  |
| GET    | /api/emergency/contacts          |
| GET    | /api/emergency/actions-log       |

---
