import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from 'recharts';

import { getReadiness } from '../api';
import MetricCard from '../components/MetricCard';

export default function Readiness({ rainfall }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    getReadiness(rainfall).then(r => setData(r.data)).catch(() => {});
  }, [rainfall]);

  if (!data) return <div className="loading">Loading readiness scores...</div>;

  const gradeToClass = (g) =>
    g === 'A' ? 'score-a' : g === 'B' ? 'score-b' : g === 'C' ? 'score-c' : g === 'D' ? 'score-d' : 'score-f';

  const gradeColor = (g) =>
    g === 'A' ? '#276749' : g === 'B' ? '#2b6cb0' : g === 'C' ? '#b7791f' : g === 'D' ? '#c05621' : '#c53030';

  const barData = data.zones.map(z => ({ zone: z.zone, score: z.total, grade: z.grade }));

  // Radar data: pick first 5 zones for radar comparison
  const radarAxes = ['drainage_readiness', 'pump_infrastructure', 'terrain_mitigation', 'historical_preparedness'];
  const radarLabels = { drainage_readiness: 'Drainage', pump_infrastructure: 'Pump Infra', terrain_mitigation: 'Terrain', historical_preparedness: 'Hist. Prep' };
  const radarData = radarAxes.map(axis => {
    const point = { axis: radarLabels[axis] };
    data.zones.forEach(z => {
      point[z.zone] = z[axis];
    });
    return point;
  });

  const COLORS = ['#1a3c6e', '#c53030', '#dd6b20', '#2f855a', '#6b46c1', '#2b6cb0', '#b7791f', '#c05621'];

  return (
    <div>
      <h2 className="page-title">Pre-Monsoon Readiness Score</h2>
      <p className="page-subtitle">
        Ward-level readiness assessment based on drainage capacity, pump infrastructure,
        terrain elevation, and historical preparedness. Scored 0-100 per zone.
      </p>

      {/* Overall score */}
      <div className="metrics-row">
        <MetricCard label="Overall Score" value={data.overall_score} delta={`Grade: ${data.overall_grade}`} />
        <MetricCard label="Total Wards Analyzed" value={data.total_wards} />
        <MetricCard label="Zones" value={data.zones.length} />
        <MetricCard label="Current Rainfall" value={`${rainfall} mm`} delta="Degrades readiness" />
      </div>

      {/* Score circle for overall */}
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <div className={`score-circle ${gradeToClass(data.overall_grade)}`}>
          <span className="score-value">{data.overall_score}</span>
          <span className="score-grade">Grade {data.overall_grade}</span>
        </div>
        <p style={{ fontSize: 13, color: '#718096' }}>
          Overall Pre-Monsoon Readiness Score for Delhi
        </p>
      </div>

      {/* Bar chart */}
      <div className="chart-container">
        <h3>Readiness Score by Zone</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="zone" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} label={{ value: 'Score', angle: -90, position: 'insideLeft', fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="score" name="Readiness Score">
              {barData.map((entry, i) => (
                <Cell key={i} fill={gradeColor(entry.grade)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar chart */}
      <div className="chart-container">
        <h3>Component-wise Comparison (Radar)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis domain={[0, 25]} tick={{ fontSize: 10 }} />
            {data.zones.slice(0, 5).map((z, i) => (
              <Radar key={z.zone} name={z.zone} dataKey={z.zone}
                stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.1} />
            ))}
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed table */}
      <h3 className="section-title">Zone-wise Breakdown</h3>
      <div className="card">
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Zone</th>
                <th>Wards</th>
                <th>Drainage (0-25)</th>
                <th>Pump Infra (0-25)</th>
                <th>Terrain (0-25)</th>
                <th>Historical (0-25)</th>
                <th>Total (0-100)</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {data.zones.map((z, i) => (
                <tr key={i}>
                  <td>{z.zone}</td>
                  <td>{z.wards}</td>
                  <td>{z.drainage_readiness}</td>
                  <td>{z.pump_infrastructure}</td>
                  <td>{z.terrain_mitigation}</td>
                  <td>{z.historical_preparedness}</td>
                  <td><strong>{z.total}</strong></td>
                  <td>
                    <span style={{ fontWeight: 600, color: gradeColor(z.grade) }}>
                      {z.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interpretation */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-body">
          <h3 style={{ fontSize: 14, marginBottom: 8 }}>Score Interpretation</h3>
          <table className="data-table">
            <thead>
              <tr><th>Grade</th><th>Score Range</th><th>Interpretation</th></tr>
            </thead>
            <tbody>
              <tr><td style={{ color: '#276749', fontWeight: 600 }}>A</td><td>80-100</td><td>Fully prepared. Minimal intervention needed.</td></tr>
              <tr><td style={{ color: '#2b6cb0', fontWeight: 600 }}>B</td><td>65-79</td><td>Substantially ready. Minor improvements recommended.</td></tr>
              <tr><td style={{ color: '#b7791f', fontWeight: 600 }}>C</td><td>50-64</td><td>Partially ready. Significant resource deployment needed.</td></tr>
              <tr><td style={{ color: '#c05621', fontWeight: 600 }}>D</td><td>35-49</td><td>Poorly prepared. Urgent infrastructure action required.</td></tr>
              <tr><td style={{ color: '#c53030', fontWeight: 600 }}>F</td><td>0-34</td><td>Critical deficit. Immediate remediation mandatory.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
