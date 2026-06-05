import React from 'react';

export default function ScenarioControls({ presets = [], selectedScenarioId, onSelectScenario, onRunScenario, loading }) {
  return (
    <div className="card scenario-controls-card">
      <div className="card-body">
        <div className="scenario-controls-header">
          <div>
            <h3>Scenario Presets</h3>
            <p>Select a deterministic flood condition and compare it against the live baseline.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={onRunScenario} disabled={loading || !selectedScenarioId}>
            {loading ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>

        <div className="scenario-preset-grid">
          {presets.map((preset) => (
            <button
              key={preset.key}
              type="button"
              className={`scenario-preset-card ${preset.key === selectedScenarioId ? 'active' : ''}`}
              onClick={() => onSelectScenario(preset.key)}
            >
              <span className="scenario-preset-name">{preset.name}</span>
              <span className="scenario-preset-rainfall">{preset.rainfall_mm} mm rainfall</span>
              <span className="scenario-preset-desc">{preset.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}