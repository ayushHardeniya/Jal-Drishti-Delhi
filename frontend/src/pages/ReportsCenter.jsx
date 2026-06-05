import React, { useEffect, useMemo, useState } from 'react';
import MetricCard from '../components/MetricCard';
import {
  getReportsSummary,
  getScenarioPresets,
  downloadFloodSituationReport,
  downloadResourceAllocationReport,
  downloadScenarioAnalysisReport,
  downloadHistoricalDataCsv,
  downloadHotspotDataCsv,
  downloadReadinessScoresCsv,
} from '../api';

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export default function ReportsCenter({ rainfall }) {
  const [summary, setSummary] = useState(null);
  const [presets, setPresets] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    Promise.all([getReportsSummary(rainfall), getScenarioPresets()])
      .then(([summaryResponse, presetsResponse]) => {
        setSummary(summaryResponse.data);
        const presetList = presetsResponse.data.presets || [];
        setPresets(presetList);
        setSelectedScenarioId((current) => current || presetsResponse.data.default_scenario_key || presetList[0]?.key || '');
      })
      .catch(() => {
        setSummary(null);
        setPresets([]);
      });
  }, [rainfall]);

  const selectedScenario = useMemo(
    () => presets.find((preset) => preset.key === selectedScenarioId),
    [presets, selectedScenarioId],
  );

  const runDownload = async (key, downloadFn, filename) => {
    try {
      setDownloading(key);
      const { data } = await downloadFn();
      downloadBlob(data, filename);
    } catch {
      /* keep the page lightweight and silent on failures */
    } finally {
      setDownloading('');
    }
  };

  if (!summary) {
    return <div className="loading">Loading reports center...</div>;
  }

  const reportActionMap = {
    situation_report: () => runDownload('situation_report', () => downloadFloodSituationReport(rainfall), 'Flood_Situation_Report.pdf'),
    allocation_report: () => runDownload('allocation_report', () => downloadResourceAllocationReport(rainfall), 'Resource_Allocation_Report.pdf'),
    scenario_report: () => runDownload(
      'scenario_report',
      () => downloadScenarioAnalysisReport(selectedScenarioId, rainfall),
      'Scenario_Analysis_Report.pdf',
    ),
  };

  const exportActionMap = {
    historical_data: () => runDownload('historical_data', downloadHistoricalDataCsv, 'Historical_Data_Export.csv'),
    hotspot_data: () => runDownload('hotspot_data', () => downloadHotspotDataCsv(rainfall), 'Hotspot_Data_Export.csv'),
    readiness_scores: () => runDownload('readiness_scores', () => downloadReadinessScoresCsv(rainfall), 'Readiness_Scores_Export.csv'),
  };

  const reportCards = (summary.reports || []).map((card) => ({
    ...card,
    description: card.key === 'scenario_report' && selectedScenario
      ? `${card.description} Selected scenario: ${selectedScenario.name}.`
      : card.description,
    action: reportActionMap[card.key],
  }));

  const exportCards = (summary.exports || []).map((card) => ({
    ...card,
    action: exportActionMap[card.key],
  }));

  return (
    <div className="reports-page">
      <h2 className="page-title">Reports & Exports Center</h2>
      <p className="page-subtitle">
        Download concise PDF reports and CSV datasets generated from the current live system state.
      </p>

      <div className="reports-timestamp card">
        <div className="card-body">
          <div className="detail-grid reports-detail-grid">
            <div className="detail-item">
              <span className="detail-label">Generated at: </span>
              <span className="detail-value">{new Date(summary.generated_at).toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Current rainfall: </span>
              <span className="detail-value">{summary.rainfall_mm} mm</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Active scenario: </span>
              <span className="detail-value">{selectedScenario?.name || 'Default scenario'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="metrics-row">
        <MetricCard label="Critical Hotspots" value={summary.hotspot_summary.critical_hotspots} />
        <MetricCard label="High-Risk Population" value={summary.hotspot_summary.high_risk_population.toLocaleString()} />
        <MetricCard label="Readiness Grade" value={summary.readiness_summary.overall_grade} delta={`${summary.readiness_summary.overall_score} / 100`} />
        <MetricCard label="Pumps Active" value={summary.emergency_status.pumps_active} delta={`Response < ${summary.emergency_status.response_time_min} min`} />
      </div>

      <div className="card reports-selector-card">
        <div className="card-body">
          <div className="reports-selector-header">
            <div>
              <h3>Scenario Analysis Selection</h3>
              <p>Choose the scenario used when downloading the scenario analysis report.</p>
            </div>
            <div className="reports-selector">
              <label htmlFor="scenario-select">Selected scenario</label>
              <select
                id="scenario-select"
                value={selectedScenarioId}
                onChange={(event) => setSelectedScenarioId(event.target.value)}
              >
                {presets.map((preset) => (
                  <option key={preset.key} value={preset.key}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="reports-selector-note">
            {selectedScenario?.description || 'Scenario analysis uses the selected preset and current rainfall input.'}
          </div>
        </div>
      </div>

      <h3 className="section-title">Report Downloads</h3>
      <div className="reports-grid">
        {reportCards.map((card) => (
          <div className="card report-download-card" key={card.key}>
            <div className="card-body">
              <div className="report-download-head">
                <span className="report-format-badge">{card.format}</span>
                <div className="report-download-title-wrap">
                  <h4>{card.title}</h4>
                  <p>{card.description}</p>
                </div>
              </div>
              <button className="btn btn-primary" onClick={card.action} disabled={downloading === card.key}>
                {downloading === card.key ? 'Preparing file...' : `Download ${card.format}`}
              </button>
            </div>
          </div>
        ))}
      </div>

      <h3 className="section-title">Data Exports</h3>
      <div className="reports-grid">
        {exportCards.map((card) => (
          <div className="card report-download-card" key={card.key}>
            <div className="card-body">
              <div className="report-download-head">
                <span className="report-format-badge report-format-export">{card.format}</span>
                <div className="report-download-title-wrap">
                  <h4>{card.title}</h4>
                  <p>{card.description}</p>
                </div>
              </div>
              <button className="btn" onClick={card.action} disabled={downloading === card.key}>
                {downloading === card.key ? 'Preparing file...' : `Download ${card.format}`}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
