import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';

import { getDashboardSummary, getDashboardAlerts, getPrediction } from '../api';
import MetricCard from '../components/MetricCard';
import MapView from '../components/MapView';
import { getHotspots } from '../api';

export default function Dashboard({ rainfall }) {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getDashboardSummary(rainfall),
      getDashboardAlerts(rainfall),
      getPrediction(rainfall),
      getHotspots(rainfall),
    ]).then(([s, a, p, h]) => {
      setSummary(s.data);
      setAlerts(a.data);
      setPrediction(p.data);
      setHotspots(h.data);
    }).catch(() => {});
  }, [rainfall]);

  if (!summary) return <div className="loading">Loading dashboard...</div>;

  // Build chart data from prediction
  const chartData = [];
  if (prediction) {
    prediction.historical.times.forEach((t, i) => {
      chartData.push({
        time: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        historical: prediction.historical.levels[i],
      });
    });
    prediction.predicted.times.forEach((t, i) => {
      chartData.push({
        time: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        predicted: prediction.predicted.levels[i],
      });
    });
    // Overlap point
    const lastHist = prediction.historical.levels[prediction.historical.levels.length - 1];
    const lastHistTime = prediction.historical.times[prediction.historical.times.length - 1];
    const overlapIdx = chartData.findIndex(d => d.time ===
      new Date(lastHistTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    if (overlapIdx >= 0) {
      chartData[overlapIdx].predicted = lastHist;
    }
  }

  return (
    <div>
      <h2 className="page-title">Jal-Drishti Delhi - Command Dashboard</h2>
      <p className="page-subtitle">
        Urban Flooding and Hydrology Command Center, Municipal Corporation of Delhi
      </p>

      {/* Metrics */}
      <div className="metrics-row">
        <MetricCard label="Rainfall (24h)" value={`${summary.rainfall_24h} mm`} delta={`Current: ${summary.rainfall_current} mm`} />
        <MetricCard label="Active Alerts" value={summary.active_alerts} />
        <MetricCard label="Pumps Deployed" value={summary.pumps_deployed} />
        <MetricCard label="Drains Clear" value={`${summary.drains_clear}/${summary.drains_total}`} />
        <MetricCard label="Pre-Monsoon Readiness" value={summary.pre_monsoon_readiness} delta="out of 100" />
        <MetricCard label="Population at Risk" value={summary.population_at_risk.toLocaleString()} />
      </div>

      {/* Quick Access */}
      <h3 className="section-title">Quick Access</h3>
      <div className="quick-grid">
        <div className="quick-card" onClick={() => navigate('/hotspots')}>
          <h3>Flood Hotspots</h3>
          <p>{summary.total_hotspots} micro-zones under 24/7 monitoring</p>
        </div>
        <div className="quick-card" onClick={() => navigate('/drainage')}>
          <h3>Drainage Network</h3>
          <p>{summary.network_km} km network coverage</p>
        </div>
        <div className="quick-card" onClick={() => navigate('/readiness')}>
          <h3>Pre-Monsoon Readiness</h3>
          <p>Ward-level readiness scoring and analysis</p>
        </div>
        <div className="quick-card" onClick={() => navigate('/emergency')}>
          <h3>Emergency Actions</h3>
          <p>One-click disaster management protocols</p>
        </div>
      </div>

      {/* GIS Map */}
      <h3 className="section-title">Flood Risk Map - Delhi NCR</h3>
      <MapView hotspots={hotspots} />

      {/* Alerts Table */}
      <h3 className="section-title">Recent Alerts</h3>
      <div className="card">
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Location</th>
                <th>Type</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a, i) => (
                <tr key={i}>
                  <td>{a.time}</td>
                  <td>{a.location}</td>
                  <td>{a.type}</td>
                  <td><span className={`badge badge-${a.severity}`}>{a.severity}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prediction Chart */}
      <h3 className="section-title">Water Level Prediction (LSTM)</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} />
            <YAxis domain={[1, 5]} tick={{ fontSize: 11 }} label={{ value: 'Level (m)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }} />
            <Tooltip />
            <Legend />
            <ReferenceLine y={3.5} stroke="#c53030" strokeDasharray="5 5" label={{ value: 'Danger 3.5m', position: 'right', fontSize: 11, fill: '#c53030' }} />
            <ReferenceLine y={3.0} stroke="#dd6b20" strokeDasharray="5 5" label={{ value: 'Warning 3.0m', position: 'right', fontSize: 11, fill: '#dd6b20' }} />
            <Line type="monotone" dataKey="historical" stroke="#1a3c6e" strokeWidth={2} dot={{ r: 3 }} name="Historical" />
            <Line type="monotone" dataKey="predicted" stroke="#c53030" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3 }} name="Predicted" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
