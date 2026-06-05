import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { setRainfall as apiSetRainfall, getAppState } from './api';

import Dashboard from './pages/Dashboard';
import Hotspots from './pages/Hotspots';
import Drainage from './pages/Drainage';
import Planning from './pages/Planning';
import ScenarioSimulator from './pages/ScenarioSimulator';
import ReportsCenter from './pages/ReportsCenter';
import Analytics from './pages/Analytics';
import Historical from './pages/Historical';
import Readiness from './pages/Readiness';
import Emergency from './pages/Emergency';

import './App.css';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard' },
  //Situation Awareness
  { path: '/hotspots', label: 'Flood Hotspots' },
  { path: '/drainage', label: 'Drainage Network' },
  { path: '/analytics', label: 'Analytics' },
  { path: '/historical', label: 'Historical Data' },
  { path: '/readiness', label: 'Readiness Score' },
  // Decision Support
  { path: '/planning', label: 'Planning' },
  { path: '/scenarios', label: 'Scenario Simulator' },
  // Operations
  { path: '/emergency', label: 'Emergency Actions' },
  // Reporting
  { path: '/reports', label: 'Reports & Exports' },
];

export default function App() {
  const [rainfall, setRainfall] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [appState, setAppState] = useState({ pumps_deployed: 0, alerts_sent: 0 });

  const fetchState = useCallback(async () => {
    try {
      const { data } = await getAppState();
      setAppState(data);
    } catch {
      /* backend may not be running yet */
    }
  }, []);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 10000);
    return () => clearInterval(interval);
  }, [fetchState]);

  const handleRainfallChange = async (e) => {
    const val = Number(e.target.value);
    setRainfall(val);
    try { await apiSetRainfall(val); } catch { /* offline */ }
  };

  return (
    <div className="app-layout">
      {/* ---- HEADER ---- */}
      <header className="app-header">
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? '\u2630' : '\u2630'}
        </button>
        <div className="header-title">
          <span className="header-emblem">GoI</span>
          <div>
            <h1>Jal-Drishti Delhi</h1>
            <span className="header-subtitle">
              Urban Flooding &amp; Hydrology Command Center &mdash; Municipal Corporation of Delhi
            </span>
          </div>
        </div>
        <div className="header-right">
          <span className="header-status">System Online</span>
        </div>
      </header>

      <div className="app-body">
        {/* ---- SIDEBAR ---- */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
          <nav className="sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-controls">
            <label className="control-label">
              Rainfall Simulation (mm)
              <input
                type="range"
                min="0"
                max="150"
                step="5"
                value={rainfall}
                onChange={handleRainfallChange}
              />
              <span className="control-value">{rainfall} mm</span>
            </label>
            <div className="sidebar-stats">
              <div><strong>Pumps Active:</strong> {appState.pumps_deployed}</div>
              <div><strong>Alerts Sent:</strong> {appState.alerts_sent}</div>
            </div>
          </div>
        </aside>

        {/* ---- MAIN ---- */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard rainfall={rainfall} />} />
            <Route path="/hotspots" element={<Hotspots rainfall={rainfall} />} />
            <Route path="/drainage" element={<Drainage rainfall={rainfall} />} />
            <Route path="/planning" element={<Planning rainfall={rainfall} />} />
            <Route path="/scenarios" element={<ScenarioSimulator rainfall={rainfall} />} />
            <Route path="/reports" element={<ReportsCenter rainfall={rainfall} />} />
            <Route path="/analytics" element={<Analytics rainfall={rainfall} />} />
            <Route path="/historical" element={<Historical />} />
            <Route path="/readiness" element={<Readiness rainfall={rainfall} />} />
            <Route path="/emergency" element={<Emergency rainfall={rainfall} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
