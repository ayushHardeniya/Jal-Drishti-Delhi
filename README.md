# Jal-Drishti Delhi

**Urban Flooding & Hydrology Command Center**
Municipal Corporation of Delhi

[Live Demo](https://jal-drishti-delhi-mu.vercel.app/) • [Architecture Documentation](ARCHITECTURE.md)

---

## Problem Statement

> Urban Flooding & Hydrology Engine: Develop a GIS-integrated predictive system to identify urban flood micro-hotspots using historical rainfall data, terrain elevation, and drainage capacity, while generating ward-level preparedness indicators to support proactive resource deployment before heavy rainfall events.

---

## Background

Originally developed as a hackathon submission for the Urban Flooding & Hydrology Engine challenge during India Innovates 2026. The project was later expanded with additional planning, simulation, and reporting capabilities.

[View Original Problem Statement and Source](https://unstop.com/conferences/india-innovates-2026-municipal-corporation-of-delhi-1625920)

---

## About the Project

![Dashboard - Jal-Drishti Delhi](screenshots\dashboard-final.png)

Jal-Drishti Delhi is a full-stack web application built to explore how municipal authorities can monitor, analyze, and respond to urban flooding across Delhi NCR.

The platform combines flood-risk monitoring, GIS visualization, drainage analysis, readiness assessment, emergency response workflows, resource planning, scenario simulation, and reporting into a single operational dashboard.

The project was originally developed during India Innovates 2026 and later expanded with additional planning and decision-support capabilities.

---

## Features

### Flood Monitoring

* Real-time flood risk assessment across identified hotspots
* GIS-based hotspot visualization using OpenStreetMap and Leaflet
* Dynamic rainfall simulation
* Risk trend tracking and historical analysis
* Drainage network monitoring

### Predictive Analytics

* Water-level prediction
* Rainfall correlation analysis
* Zone-wise risk distribution
* Historical flood trend analysis

### Pre-Monsoon Readiness Score

* Ward-level readiness scoring
* Multi-factor preparedness assessment
* Readiness grading system
* Rainfall-sensitive readiness simulation

### Resource Allocation Engine

* Resource inventory tracking
* Priority-zone identification
* Resource deployment recommendations
* Impact estimation and planning support

### Flood Scenario Simulator

* What-if flood simulations
* Multiple rainfall and stress scenarios
* Baseline vs simulated comparisons
* Resource requirement estimation
* Recommended response actions

### Emergency Operations

* Pump deployment workflows
* Traffic diversion actions
* Resident alerting support
* Situation reporting
* Audit logging

### Reports & Exports

* Flood situation reports
* Resource allocation reports
* Scenario analysis reports
* CSV exports for operational datasets

---

## Technology Stack

### Backend

* Python 3.8+
* Flask
* Flask-CORS
* NumPy
* Pandas

### Frontend

* React 18
* React Router
* Recharts
* Leaflet
* React-Leaflet
* Axios

### Other

* OpenStreetMap
* Custom CSS
* No external database
* No paid APIs

---

## Application Modules

* Dashboard
* Flood Hotspots
* Drainage Network
* Analytics
* Historical Data
* Readiness Score
* Planning
* Scenario Simulator
* Emergency Actions
* Reports & Exports

---

## Project Structure

```text
Jal-Drishti-Delhi/
│
├── backend/
│   ├── app.py
│   ├── data.py
│   ├── services.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── App.js
│   │   └── App.css
│   └── package.json
│
├── ARCHITECTURE.md
├── README.md
└── start_fullstack.bat
```

For detailed architecture, data flow, API structure, and implementation details, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## To run the application on your local host, follow this:

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

### Quick Start (Windows)

```text
start_fullstack.bat
```

---

## Design Decisions

### Why Flask?

The backend mainly serves computed data and simulation logic, so Flask keeps the project lightweight and easy to understand.

### Why React?

The application behaves like an operational dashboard and benefits from a client-side SPA architecture.

### Why No Database?

The current version uses static seed datasets and in-memory state. For a production deployment, PostgreSQL and PostGIS would be natural additions.

### Why a Government-Style UI?

The target users are municipal operators and emergency response teams. The focus is on clarity, information density, and usability rather than visual effects.

---

Built by [Ayush Hardeniya](https://github.com/ayushHardeniya)

GitHub: https://github.com/ayushHardeniya
Contact: [ayushhardeniya@hotmail.com](mailto:ayushhardeniya@hotmail.com?subject=Jal-Drishti%20Delhi%20-%20Project%20Inquiry)
