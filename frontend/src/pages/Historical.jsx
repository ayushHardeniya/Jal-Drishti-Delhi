import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

import {
  getHistoricalYearly, getHistoricalSeasonal, getAffectedAreas,
  getHistoricalSummary, getHistoricalDownload,
} from '../api';
import MetricCard from '../components/MetricCard';

export default function Historical() {
  const [yearly, setYearly] = useState(null);
  const [seasonal, setSeasonal] = useState(null);
  const [areas, setAreas] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    Promise.all([
      getHistoricalYearly(),
      getHistoricalSeasonal(),
      getAffectedAreas(),
      getHistoricalSummary(),
    ]).then(([y, s, a, sm]) => {
      setYearly(y.data);
      setSeasonal(s.data);
      setAreas(a.data);
      setSummary(sm.data);
    }).catch(() => {});
  }, []);

  const handleDownload = async () => {
    try {
      const { data } = await getHistoricalDownload();
      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(','),
        ...data.map(row => headers.map(h => row[h]).join(',')),
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MCD_Flood_Data_2016-2026.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* */ }
  };

  if (!summary) return <div className="loading">Loading historical data...</div>;

  const yearlyData = yearly
    ? yearly.years.map((y, i) => ({
        year: y,
        incidents: yearly.incidents[i],
        damage: yearly.damage_crores[i],
        people: yearly.people_affected[i],
      }))
    : [];

  const monthlyData = seasonal
    ? seasonal.months.map((m, i) => ({
        month: m,
        incidents: seasonal.avg_incidents[i],
        rainfall: seasonal.avg_rainfall_mm[i],
      }))
    : [];

  const barColor = (val) => val >= 25 ? '#c53030' : val >= 10 ? '#dd6b20' : '#2f855a';

  return (
    <div>
      <h2 className="page-title">Historical Flood Data Analysis</h2>
      <p className="page-subtitle">
        Comprehensive data from 2016-2026 across Delhi NCR
      </p>

      <div className="metrics-row">
        <MetricCard label="Years Analyzed" value={summary.years_analyzed} />
        <MetricCard label="Total Incidents" value={summary.total_incidents} />
        <MetricCard label="People Affected" value={summary.people_affected} />
        <MetricCard label="Damage Cost" value={`Rs. ${summary.damage_crores} Cr`} />
      </div>

      {/* Yearly trend */}
      <div className="chart-container">
        <h3>Flood Incidents by Year</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={yearlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} label={{ value: 'Incidents', angle: -90, position: 'insideLeft', fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="incidents" stroke="#1a3c6e" fill="#bee3f8" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Seasonal distribution */}
      <div className="chart-container">
        <h3>Average Monthly Incidents (2016-2026)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="incidents" name="Avg Incidents">
              {monthlyData.map((entry, i) => (
                <Cell key={i} fill={barColor(entry.incidents)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Affected areas table */}
      <h3 className="section-title">Most Affected Areas (2016-2026)</h3>
      <div className="card">
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Area</th>
                <th>Total Incidents</th>
                <th>Avg Depth (m)</th>
                <th>People Affected</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((a, i) => (
                <tr key={i}>
                  <td>{a.area}</td>
                  <td>{a.incidents}</td>
                  <td>{a.avg_depth_m}</td>
                  <td>{a.people_affected.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="btn btn-primary" onClick={handleDownload}>
          Download Complete Dataset (CSV)
        </button>
      </div>
    </div>
  );
}
