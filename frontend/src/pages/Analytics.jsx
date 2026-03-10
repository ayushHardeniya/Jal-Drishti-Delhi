import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend, ComposedChart,
} from 'recharts';

import {
  getPrediction, getRiskDistribution, getRainfallCorrelation, getAnalyticsMetrics,
} from '../api';
import MetricCard from '../components/MetricCard';

export default function Analytics({ rainfall }) {
  const [prediction, setPrediction] = useState(null);
  const [riskDist, setRiskDist] = useState([]);
  const [correlation, setCorrelation] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    Promise.all([
      getPrediction(rainfall),
      getRiskDistribution(rainfall),
      getRainfallCorrelation(),
      getAnalyticsMetrics(rainfall),
    ]).then(([p, r, c, m]) => {
      setPrediction(p.data);
      setRiskDist(r.data);
      setCorrelation(c.data);
      setMetrics(m.data);
    }).catch(() => {});
  }, [rainfall]);

  if (!metrics) return <div className="loading">Loading analytics...</div>;

  // Build water‐level chart
  const levelData = [];
  if (prediction) {
    prediction.historical.times.forEach((t, i) => {
      levelData.push({
        time: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        historical: prediction.historical.levels[i],
      });
    });
    // overlap point
    const lastHist = prediction.historical.levels[prediction.historical.levels.length - 1];
    prediction.predicted.times.forEach((t, i) => {
      levelData.push({
        time: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        predicted: prediction.predicted.levels[i],
      });
    });
    const lastHistTime = prediction.historical.times[prediction.historical.times.length - 1];
    const overlapIdx = levelData.findIndex(d => d.time ===
      new Date(lastHistTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    if (overlapIdx >= 0) levelData[overlapIdx].predicted = lastHist;
  }

  // Risk bar color
  const getRiskColor = (risk) => risk > 0.75 ? '#c53030' : risk > 0.5 ? '#dd6b20' : '#2f855a';

  // Correlation chart
  const corrData = correlation
    ? correlation.months.map((m, i) => ({
        month: m,
        rainfall: correlation.rainfall[i],
        incidents: correlation.incidents[i],
      }))
    : [];

  return (
    <div>
      <h2 className="page-title">AI Predictions and Analytics</h2>
      <p className="page-subtitle">
        LSTM-based water level forecasting and risk analysis
      </p>

      <div className="metrics-row">
        <MetricCard label="Current Level" value={`${metrics.current_level} m`} />
        <MetricCard label="Predicted (3h)" value={`${metrics.predicted_level_3h} m`}
          delta={`${(metrics.predicted_level_3h - metrics.current_level) >= 0 ? '+' : ''}${(metrics.predicted_level_3h - metrics.current_level).toFixed(2)} m`} />
        <MetricCard label="Model Accuracy" value={`${metrics.model_accuracy}%`} />
        <MetricCard label="Confidence" value={`${metrics.confidence}%`} />
      </div>

      {/* Water Level Forecast */}
      <div className="chart-container">
        <h3>6-Hour Water Level Forecast (LSTM)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={levelData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} />
            <YAxis domain={[1, 5]} tick={{ fontSize: 11 }}
              label={{ value: 'Level (m)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }} />
            <Tooltip />
            <Legend />
            <ReferenceLine y={3.5} stroke="#c53030" strokeDasharray="5 5" label="Danger 3.5m" />
            <ReferenceLine y={3.0} stroke="#dd6b20" strokeDasharray="5 5" label="Warning 3.0m" />
            <Line type="monotone" dataKey="historical" stroke="#1a3c6e" strokeWidth={2} dot={{ r: 3 }} name="Historical" connectNulls={false} />
            <Line type="monotone" dataKey="predicted" stroke="#c53030" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3 }} name="LSTM Prediction" connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Distribution */}
      <div className="chart-container">
        <h3>Risk Distribution Across Zones</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={riskDist}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="zone" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => `${(v * 100).toFixed(1)}%`} />
            <Bar dataKey="risk" name="Risk Level">
              {riskDist.map((entry, i) => (
                <rect key={i} fill={getRiskColor(entry.risk)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {/* Risk table below chart */}
        <table className="data-table" style={{ marginTop: 12 }}>
          <thead>
            <tr><th>Zone</th><th>Risk</th><th>Status</th></tr>
          </thead>
          <tbody>
            {riskDist.map((z, i) => (
              <tr key={i}>
                <td>{z.zone}</td>
                <td>{(z.risk * 100).toFixed(1)}%</td>
                <td><span className={`badge badge-${z.severity}`}>{z.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rainfall vs Incidents */}
      <div className="chart-container">
        <h3>Rainfall vs Flood Incidents (Historical Correlation)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={corrData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} label={{ value: 'Incidents', angle: 90, position: 'insideRight', fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="rainfall" fill="#1a3c6e" name="Rainfall (mm)" />
            <Line yAxisId="right" type="monotone" dataKey="incidents" stroke="#c53030" strokeWidth={2} name="Flood Incidents" dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
