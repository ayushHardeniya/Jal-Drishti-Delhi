import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

import { getDrainage, scheduleMaintenance } from '../api';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';

export default function Drainage({ rainfall }) {
  const [drains, setDrains] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [messages, setMessages] = useState({});

  useEffect(() => {
    getDrainage().then(r => setDrains(r.data)).catch(() => {});
  }, []);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const showMsg = (id, msg) => {
    setMessages(prev => ({ ...prev, [id]: msg }));
    setTimeout(() => setMessages(prev => ({ ...prev, [id]: null })), 4000);
  };

  const handleMaintenance = async (id) => {
    const { data } = await scheduleMaintenance(id);
    showMsg(id, data.message);
  };

  const totalLength = drains.reduce((s, d) => s + d.length_km, 0);
  const clearCount = drains.filter(d => d.status === 'Clear').length;
  const siltedCount = drains.filter(d => d.status === 'Silted').length;
  const blockedCount = drains.filter(d => d.status === 'Blocked').length;

  const statusColors = { Clear: '#2f855a', Silted: '#dd6b20', Blocked: '#c53030' };
  const statusFills = { Clear: '#c6f6d5', Silted: '#fefcbf', Blocked: '#fed7d7' };

  return (
    <div>
      <h2 className="page-title">MCD Drainage Network Monitoring</h2>
      <p className="page-subtitle">
        AI-powered 24/7 surveillance of 2,152 km drainage network
      </p>

      <div className="metrics-row">
        <MetricCard label="Total Network" value="2,152 km" />
        <MetricCard label="Monitored Drains" value={drains.length} />
        <MetricCard label="Monitored Length" value={`${totalLength} km`} />
        <MetricCard label="Clear" value={clearCount} />
        <MetricCard label="Silted" value={siltedCount} />
        <MetricCard label="Blocked" value={blockedCount} />
      </div>

      <h3 className="section-title">Drain Inventory</h3>
      {drains.map((drain) => {
        const isOpen = expanded[drain.id] !== undefined ? expanded[drain.id] : drain.id <= 2;
        const flowData = drain.flow_data_24h || [];
        return (
          <div className="card" key={drain.id}>
            <div className="card-header" onClick={() => toggle(drain.id)}>
              <h3>
                {drain.name} ({drain.length_km} km) &mdash;{' '}
                <StatusBadge status={drain.status} />
              </h3>
              <span className="card-toggle">{isOpen ? 'Collapse' : 'Expand'}</span>
            </div>
            {isOpen && (
              <div className="card-body">
                <div className="detail-grid" style={{ marginBottom: 16 }}>
                  <div className="detail-item">
                    <span className="detail-label">AI Confidence: </span>
                    <span className="detail-value">{drain.ai_confidence}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Capacity: </span>
                    <span className="detail-value">{drain.capacity_pct}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Flow Rate: </span>
                    <span className="detail-value">{drain.flow_rate} m3/s</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Cleaned: </span>
                    <span className="detail-value">{drain.last_cleaned}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Catchment Area: </span>
                    <span className="detail-value">{drain.catchment_area} sq km</span>
                  </div>
                </div>

                <h4 style={{ fontSize: 13, marginBottom: 8 }}>Flow Rate (Last 24 Hours)</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={flowData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 11 }} label={{ value: 'Hour', position: 'insideBottom', offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} label={{ value: 'm3/s', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="flow_rate"
                      stroke={statusColors[drain.status]}
                      fill={statusFills[drain.status]}
                    />
                  </AreaChart>
                </ResponsiveContainer>

                <div className="action-bar">
                  {drain.status !== 'Clear' && (
                    <button className="btn btn-primary btn-sm" onClick={() => handleMaintenance(drain.id)}>
                      Schedule Desilting
                    </button>
                  )}
                  <button className="btn btn-sm">View Full Report</button>
                  <button className="btn btn-sm">Set Alert</button>
                </div>

                {messages[drain.id] && (
                  <div className="toast toast-success">{messages[drain.id]}</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
