import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const metricConfig = [
  { key: 'rainfall_mm', label: 'Rainfall (mm)' },
  { key: 'critical_hotspots', label: 'Critical Hotspots' },
  { key: 'population_at_risk', label: 'Population at Risk (000s)', scale: 1000 },
  { key: 'readiness_score', label: 'Readiness Score' },
  { key: 'pumps_required', label: 'Pumps Required' },
  { key: 'field_teams_required', label: 'Field Teams Required' },
];

export default function ScenarioComparisonChart({ baseline, simulated }) {
  if (!baseline || !simulated) {
    return <div className="empty-state">Select a scenario to view the baseline versus simulation comparison.</div>;
  }

  const chartData = metricConfig.map((metric) => ({
    metric: metric.label,
    baseline: metric.scale ? Math.round(baseline[metric.key] / metric.scale) : baseline[metric.key],
    simulated: metric.scale ? Math.round(simulated[metric.key] / metric.scale) : simulated[metric.key],
  }));

  return (
    <div className="card">
      <div className="card-body scenario-chart-wrap">
        <h3>Baseline vs Simulated Metrics</h3>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="metric" tick={{ fontSize: 11 }} interval={0} angle={-10} height={60} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="baseline" fill="#1a3c6e" name="Baseline" radius={[4, 4, 0, 0]} />
            <Bar dataKey="simulated" fill="#c53030" name="Simulated" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}