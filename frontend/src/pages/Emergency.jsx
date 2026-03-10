import React, { useEffect, useState, useCallback } from 'react';

import {
  getEmergencyStatus, emergencyDeployPumps, emergencyTrafficDiversion,
  emergencyMassSms, emergencyNdrf, emergencyEvacuate, emergencyMedical,
  emergencyAlertAll, getSituationReport, getEmergencyContacts, getActionsLog,
} from '../api';
import MetricCard from '../components/MetricCard';

export default function Emergency({ rainfall }) {
  const [status, setStatus] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [log, setLog] = useState([]);
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState(null);

  const load = useCallback(async () => {
    try {
      const [s, c, l] = await Promise.all([
        getEmergencyStatus(),
        getEmergencyContacts(),
        getActionsLog(),
      ]);
      setStatus(s.data);
      setContacts(c.data);
      setLog(l.data);
    } catch { /* */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  const showMsg = (msg, type = 'success') => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const refreshLog = async () => {
    try { const { data } = await getActionsLog(); setLog(data); } catch { /* */ }
  };

  const act = async (fn, successMsg) => {
    try {
      const { data } = await fn();
      showMsg(data.message || successMsg);
      refreshLog();
      load();
    } catch {
      showMsg('Action failed. Check backend connection.', 'error');
    }
  };

  const handleReport = async () => {
    try {
      const { data } = await getSituationReport(rainfall);
      setReport(data);
    } catch { /* */ }
  };

  const downloadReport = () => {
    if (!report) return;
    const headers = ['Zone', 'Status', 'Risk %', 'Pumps Deployed', 'People Evacuated'];
    const rows = report.zones.map(z =>
      [z.zone, z.status, z.risk_pct, z.pumps_deployed, z.people_evacuated].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Emergency_Report_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!status) return <div className="loading">Loading emergency panel...</div>;

  return (
    <div>
      <h2 className="page-title">Emergency Response Command Panel</h2>
      <p className="page-subtitle">
        One-click disaster management actions. All actions are logged.
      </p>

      {/* Status */}
      <div className="metrics-row">
        <MetricCard label="Teams Available" value={status.teams_available} />
        <MetricCard label="Pumps Ready" value={status.pumps_ready} />
        <MetricCard label="Pumps Active" value={status.pumps_active} />
        <MetricCard label="Boats Ready" value={status.boats_ready} />
        <MetricCard label="Rescue Teams" value={status.rescue_teams} />
        <MetricCard label="Response Time" value={`< ${status.response_time_min} min`} />
      </div>

      {/* Connectivity */}
      <div className="detail-grid" style={{ marginBottom: 20 }}>
        <div className="detail-item">
          <span className="detail-label">Police Connected: </span>
          <span className="detail-value">{status.police_connected ? 'Yes' : 'No'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Fire Department: </span>
          <span className="detail-value">{status.fire_dept_connected ? 'Yes' : 'No'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Hospitals: </span>
          <span className="detail-value">{status.hospitals_connected ? 'Yes' : 'No'}</span>
        </div>
      </div>

      {/* Message toast */}
      {message && (
        <div className={`toast toast-${message.type}`}>{message.text}</div>
      )}

      {/* Action buttons */}
      <h3 className="section-title">Quick Actions</h3>
      <div className="emergency-grid">
        <button className="btn btn-primary" onClick={() => act(() => emergencyDeployPumps(5))}>
          Deploy Emergency Pumps (x5)
        </button>
        <button className="btn btn-primary" onClick={() => act(emergencyAlertAll)}>
          Alert All Emergency Services
        </button>
        <button className="btn" onClick={() => act(emergencyTrafficDiversion)}>
          Activate Traffic Diversion Protocol
        </button>
        <button className="btn" onClick={() => act(emergencyMassSms)}>
          Send Mass SMS Alert
        </button>
        <button className="btn btn-danger" onClick={() => act(emergencyNdrf)}>
          Request NDRF Deployment
        </button>
        <button className="btn btn-danger" onClick={() => act(emergencyEvacuate)}>
          Evacuate High-Risk Zones
        </button>
        <button className="btn btn-success" onClick={() => act(emergencyMedical)}>
          Mobilize Medical Teams
        </button>
        <button className="btn" onClick={handleReport}>
          Generate Situation Report
        </button>
      </div>

      {/* Situation Report */}
      {report && (
        <div style={{ marginTop: 20 }}>
          <h3 className="section-title">
            Situation Report ({new Date(report.generated_at).toLocaleString()})
          </h3>
          <div className="card">
            <div className="card-body">
              <p style={{ marginBottom: 12, fontSize: 13 }}>
                <strong>Rainfall:</strong> {report.rainfall} mm
              </p>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Zone</th><th>Status</th><th>Risk %</th><th>Pumps Deployed</th><th>People Evacuated</th>
                  </tr>
                </thead>
                <tbody>
                  {report.zones.map((z, i) => (
                    <tr key={i}>
                      <td>{z.zone}</td>
                      <td><span className={`badge badge-${z.status === 'CRITICAL' ? 'critical' : z.status === 'MODERATE' ? 'moderate' : 'safe'}`}>{z.status}</span></td>
                      <td>{z.risk_pct}%</td>
                      <td>{z.pumps_deployed}</td>
                      <td>{z.people_evacuated.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={downloadReport}>
                Download Report (CSV)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions Log */}
      <h3 className="section-title">Actions Log</h3>
      <div className="card">
        <div className="card-body">
          {log.length === 0 ? (
            <p style={{ color: '#a0aec0', fontSize: 13 }}>No actions recorded yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Timestamp</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                {log.map((entry, i) => (
                  <tr key={i}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td><code style={{ fontSize: 11 }}>{entry.type}</code></td>
                    <td>{entry.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Emergency Contacts */}
      <h3 className="section-title">Emergency Contacts</h3>
      <div className="card">
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr><th>Agency</th><th>Number</th><th>Type</th></tr>
            </thead>
            <tbody>
              {contacts.map((c, i) => (
                <tr key={i}>
                  <td><strong>{c.agency}</strong></td>
                  <td>{c.number}</td>
                  <td>{c.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
