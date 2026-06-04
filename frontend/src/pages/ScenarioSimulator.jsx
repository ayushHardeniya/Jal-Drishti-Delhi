import React, { useEffect, useMemo, useState } from 'react';
import { getScenarioPresets, simulateScenario } from '../api';
import MetricCard from '../components/MetricCard';
import ScenarioControls from '../components/ScenarioControls';
import ScenarioComparisonChart from '../components/ScenarioComparisonChart';

export default function ScenarioSimulator({ rainfall }) {
  const [presets, setPresets] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getScenarioPresets()
      .then(({ data }) => {
        const presetsList = data.presets || [];
        setPresets(presetsList);
        if (presetsList.length) {
          setSelectedScenarioId(data.default_scenario_key || presetsList[0].key);
        }
      })
      .catch(() => setPresets([]));
  }, []);

  const runSimulation = async (scenarioId = selectedScenarioId) => {
    if (!scenarioId) return;
    try {
      setLoading(true);
      const { data } = await simulateScenario({ scenario_id: scenarioId, rainfall });
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedScenarioId) {
      runSimulation(selectedScenarioId);
    }
  }, [selectedScenarioId, rainfall]);

  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.key === selectedScenarioId),
    [presets, selectedScenarioId],
  );

  if (!presets.length && !result) {
    return <div className="loading">Loading scenario simulator...</div>;
  }

  const baseline = result?.baseline;
  const simulated = result?.simulated;
  const delta = result?.delta || {};
  const expectedImpact = result?.expected_impact || {};

  return (
    <div className="scenario-page">
      <h2 className="page-title">Flood Scenario Simulator</h2>
      <p className="page-subtitle">
        Compare the live baseline against deterministic flood scenarios to understand operational strain before you act.
      </p>

      <ScenarioControls
        presets={presets}
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={setSelectedScenarioId}
        onRunScenario={() => runSimulation(selectedScenarioId)}
        loading={loading}
      />

      {result && (
        <>
          <div className="metrics-row scenario-metrics-row">
            <MetricCard label="Selected Scenario" value={selectedPreset?.name || result.scenario?.name || 'Scenario'} delta={result.scenario?.description} />
            <MetricCard label="Rainfall Shift" value={`${result.scenario?.rainfall_mm ?? 0} mm`} delta={`Δ ${delta.rainfall_mm >= 0 ? '+' : ''}${delta.rainfall_mm ?? 0} mm`} />
            <MetricCard label="Critical Hotspots" value={simulated?.critical_hotspots ?? 0} delta={`Δ ${delta.critical_hotspots >= 0 ? '+' : ''}${delta.critical_hotspots ?? 0}`} />
            <MetricCard label="Population at Risk" value={(simulated?.population_at_risk || 0).toLocaleString()} delta={`Δ ${(delta.population_at_risk || 0).toLocaleString()}`} />
            <MetricCard label="Pumps Required" value={simulated?.pumps_required ?? 0} delta={`Δ ${delta.pumps_required >= 0 ? '+' : ''}${delta.pumps_required ?? 0}`} />
            <MetricCard label="Field Teams Required" value={simulated?.field_teams_required ?? 0} delta={`Δ ${delta.field_teams_required >= 0 ? '+' : ''}${delta.field_teams_required ?? 0}`} />
          </div>

          <ScenarioComparisonChart baseline={baseline} simulated={simulated} />

          <div className="scenario-impact-grid">
            <div className="card">
              <div className="card-body">
                <h3>Operational Impact</h3>
                <div className="scenario-impact-list">
                  <div><span>Readiness impact</span><strong>{simulated?.readiness_score ?? 0}</strong></div>
                  <div><span>Critical zones</span><strong>{result.critical_zones?.length ?? 0}</strong></div>
                  <div><span>Hotspots affected</span><strong>{result.affected_hotspots?.length ?? 0}</strong></div>
                  <div><span>Expected pumps</span><strong>{expectedImpact.pumps_required ?? 0}</strong></div>
                  <div><span>Expected teams</span><strong>{expectedImpact.field_teams_required ?? 0}</strong></div>
                  <div><span>Population at risk</span><strong>{(expectedImpact.population_at_risk || 0).toLocaleString()}</strong></div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h3>Recommended Actions</h3>
                <table className="data-table scenario-actions-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Action</th>
                      <th>Resource</th>
                      <th>Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(result.recommended_actions || []).map((action) => (
                      <tr key={`${action.rank}-${action.target_name}-${action.resource_type}`}>
                        <td>{action.rank}</td>
                        <td>
                          <strong>{action.target_name}</strong>
                          <div className="scenario-action-zone">{action.zone_name}</div>
                        </td>
                        <td>{action.resource_type.replace('_', ' ')}</td>
                        <td>{action.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card scenario-hotspots-card">
            <div className="card-body">
              <h3>Affected Hotspots</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Risk</th>
                    <th>Status</th>
                    <th>Population</th>
                  </tr>
                </thead>
                <tbody>
                  {(result.affected_hotspots || []).map((spot) => (
                    <tr key={spot.id}>
                      <td><strong>{spot.name}</strong></td>
                      <td>{spot.risk_pct}%</td>
                      <td><span className={`badge badge-${spot.severity}`}>{spot.status}</span></td>
                      <td>{spot.population.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}