import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

import {
  getHotspots, deployPumpsToHotspot, trafficDiversionHotspot, alertResidents,
} from '../api';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import MapView from '../components/MapView';

export default function Hotspots({ rainfall }) {
  const [hotspots, setHotspots] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [messages, setMessages] = useState({});

  const load = () => {
    getHotspots(rainfall).then(r => setHotspots(r.data)).catch(() => {});
  };

  useEffect(load, [rainfall]);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const showMsg = (id, msg) => {
    setMessages(prev => ({ ...prev, [id]: msg }));
    setTimeout(() => setMessages(prev => ({ ...prev, [id]: null })), 4000);
  };

  const handleDeploy = async (id) => {
    const { data } = await deployPumpsToHotspot(id);
    showMsg(id, data.message);
  };

  const handleTraffic = async (id) => {
    const { data } = await trafficDiversionHotspot(id);
    showMsg(id, data.message);
  };

  const handleAlert = async (id) => {
    const { data } = await alertResidents(id);
    showMsg(id, data.message);
  };

  const critical = hotspots.filter(h => h.severity === 'critical').length;
  const moderate = hotspots.filter(h => h.severity === 'moderate').length;
  const safe = hotspots.filter(h => h.severity === 'safe').length;
  const totalPop = hotspots.reduce((s, h) => s + h.population, 0);

  return (
    <div>
      <h2 className="page-title">Delhi Flood Hotspots</h2>
      <p className="page-subtitle">
        {hotspots.length} high-risk micro-zones under 24/7 monitoring.
        Ward-level identification using terrain elevation, historical rainfall, and drainage capacity.
      </p>

      <div className="metrics-row">
        <MetricCard label="Total Zones" value={hotspots.length} />
        <MetricCard label="Critical" value={critical} />
        <MetricCard label="Moderate" value={moderate} />
        <MetricCard label="Safe" value={safe} />
        <MetricCard label="Population at Risk" value={totalPop.toLocaleString()} />
      </div>

      {/* Map */}
      <h3 className="section-title">Hotspot Map</h3>
      <MapView hotspots={hotspots} />

      {/* Cards */}
      <h3 className="section-title">Zone Details</h3>
      {hotspots.map((spot) => {
        const isOpen = expanded[spot.id] !== undefined ? expanded[spot.id] : spot.severity === 'critical';
        const trendData = spot.trend_6h.map((v, i) => ({ hour: `${i - 6}h`, risk: v }));
        return (
          <div className="card" key={spot.id}>
            <div className="card-header" onClick={() => toggle(spot.id)}>
              <h3>
                {spot.name} &mdash; {spot.risk_pct}% Risk{' '}
                <StatusBadge status={spot.status} />
              </h3>
              <span className="card-toggle">{isOpen ? 'Collapse' : 'Expand'}</span>
            </div>
            {isOpen && (
              <div className="card-body">
                <div className="detail-grid" style={{ marginBottom: 16 }}>
                  <div className="detail-item">
                    <span className="detail-label">Coordinates: </span>
                    <span className="detail-value">{spot.lat.toFixed(4)}, {spot.lon.toFixed(4)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Elevation: </span>
                    <span className="detail-value">{spot.elevation} m</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Area: </span>
                    <span className="detail-value">{spot.area_sqkm} sq km</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Population: </span>
                    <span className="detail-value">{spot.population.toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ward: </span>
                    <span className="detail-value">{spot.ward}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Drainage Density: </span>
                    <span className="detail-value">{spot.drainage_density}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Imperviousness: </span>
                    <span className="detail-value">{(spot.imperviousness * 100).toFixed(0)}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Historical Incidents: </span>
                    <span className="detail-value">{spot.historical_incidents}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Base Risk: </span>
                    <span className="detail-value">{(spot.base_risk * 100).toFixed(1)}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Current Risk: </span>
                    <span className="detail-value">{spot.risk_pct}%</span>
                  </div>
                </div>

                {/* Risk Trend */}
                <h4 style={{ fontSize: 13, marginBottom: 8 }}>Risk Trend (Last 6 Hours)</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="risk"
                      stroke={spot.severity === 'critical' ? '#c53030' : spot.severity === 'moderate' ? '#dd6b20' : '#2f855a'}
                      fill={spot.severity === 'critical' ? '#fed7d7' : spot.severity === 'moderate' ? '#fefcbf' : '#c6f6d5'}
                    />
                  </AreaChart>
                </ResponsiveContainer>

                {/* Actions */}
                <div className="action-bar">
                  <button className="btn btn-primary btn-sm" onClick={() => handleDeploy(spot.id)}>Deploy Pumps</button>
                  <button className="btn btn-sm" onClick={() => handleTraffic(spot.id)}>Traffic Diversion</button>
                  <button className="btn btn-sm" onClick={() => handleAlert(spot.id)}>Alert Residents</button>
                </div>

                {messages[spot.id] && (
                  <div className="toast toast-success">{messages[spot.id]}</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
