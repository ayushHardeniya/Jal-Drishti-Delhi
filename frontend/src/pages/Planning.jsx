import React, { useEffect, useState } from 'react';
import { applyPlanningAllocation, getPlanningAllocation } from '../api';
import AllocationSummaryCard from '../components/AllocationSummaryCard';
import AllocationRecommendationTable from '../components/AllocationRecommendationTable';

export default function Planning({ rainfall }) {
  const [plan, setPlan] = useState(null);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadPlan = async () => {
    try {
      const { data } = await getPlanningAllocation(rainfall);
      setPlan(data);
    } catch {
      setPlan(null);
    }
  };

  useEffect(() => {
    loadPlan();
  }, [rainfall]);

  const handleApply = async () => {
    try {
      setBusy(true);
      const { data } = await applyPlanningAllocation({ rainfall });
      setMessage({ text: data.message || 'Allocation plan applied.', type: 'success' });
      await loadPlan();
    } catch {
      setMessage({ text: 'Unable to apply allocation plan. Check backend connection.', type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  if (!plan) {
    return <div className="loading">Loading planning recommendations...</div>;
  }

  const summary = plan.summary || {};
  const impact = plan.expected_impact || {};
  const inventory = plan.resource_inventory || {};
  const available = inventory.available || {};
  const reserved = inventory.reserved || {};
  const remaining = inventory.remaining || {};

  return (
    <div className="planning-page">
      <h2 className="page-title">Resource Allocation Engine</h2>
      <p className="page-subtitle">
        Ranked deployment recommendations built from live flood risk, readiness, drainage, and rainfall conditions.
      </p>

      <div className="metrics-row">
        <AllocationSummaryCard label="Hotspots Evaluated" value={summary.total_hotspots_evaluated ?? 0} note="Live flood micro-zones" />
        <AllocationSummaryCard label="Critical Hotspots" value={summary.critical_hotspots ?? 0} note="Immediate intervention candidates" tone="critical" />
        <AllocationSummaryCard label="Priority Actions" value={summary.priority_actions ?? 0} note="Ranked recommendations" tone="warning" />
        <AllocationSummaryCard label="Resources Committed" value={summary.resources_committed ?? 0} note="Units allocated by plan" tone="success" />
        <AllocationSummaryCard label="High Risk Population" value={(summary.high_risk_population || 0).toLocaleString()} note="Population exposed in current plan" />
        <AllocationSummaryCard label="Stabilization Time" value={`${impact.estimated_time_to_stabilization_min ?? 0} min`} note="Estimated response window" />
      </div>

      {message && <div className={`toast toast-${message.type} planning-toast`}>{message.text}</div>}

      <div className="planning-actions">
        <button className="btn btn-primary" onClick={handleApply} disabled={busy}>
          {busy ? 'Applying...' : 'Apply Allocation Plan'}
        </button>
        <div className="planning-meta">
          <span><strong>Plan ID:</strong> {plan.plan_id}</span>
          <span><strong>Generated:</strong> {new Date(plan.generated_at).toLocaleString()}</span>
          <span><strong>Urgency:</strong> {summary.overall_action_urgency}</span>
        </div>
      </div>

      <h3 className="section-title">Resource Inventory Snapshot</h3>
      <div className="card">
        <div className="card-body">
          <div className="inventory-grid">
            {Object.keys(available).map((key) => (
              <div className="inventory-card" key={key}>
                <span className="inventory-label">{key.replace('_', ' ')}</span>
                <strong>{available[key]}</strong>
                <span>Reserved: {reserved[key] ?? 0}</span>
                <span>Remaining: {remaining[key] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 className="section-title">Priority Zones</h3>
      <div className="priority-zone-list">
        {plan.priority_zones.map((zone) => (
          <div className="card priority-zone-card" key={zone.zone_id}>
            <div className="card-body">
              <div className="priority-zone-header">
                <div>
                  <h4>{zone.rank}. {zone.zone_name}</h4>
                  <p>{zone.primary_driver}</p>
                </div>
                <span className="badge badge-critical">{zone.zone_type}</span>
              </div>
              <div className="priority-zone-grid">
                <div><strong>{zone.risk_pct}%</strong><span>Risk</span></div>
                <div><strong>{zone.readiness_score}</strong><span>Readiness</span></div>
                <div><strong>{zone.readiness_grade}</strong><span>Grade</span></div>
                <div><strong>{zone.population_at_risk.toLocaleString()}</strong><span>Population</span></div>
                <div><strong>{zone.drainage_status}</strong><span>Drainage</span></div>
                <div><strong>{zone.priority_score}</strong><span>Priority</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="section-title">Ranked Recommendations</h3>
      <AllocationRecommendationTable recommendations={plan.ranked_recommendations} />

      <h3 className="section-title">Reasoning and Expected Impact</h3>
      <div className="card">
        <div className="card-body">
          <p className="planning-method"><strong>Method:</strong> {plan.reasoning?.method}</p>
          <div className="reasoning-block">
            {plan.reasoning?.explanations?.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
          <div className="impact-grid">
            <div><strong>{impact.risk_reduction_pct ?? 0}%</strong><span>Avg Risk Reduction</span></div>
            <div><strong>{(impact.population_covered || 0).toLocaleString()}</strong><span>Population Covered</span></div>
            <div><strong>{impact.critical_hotspots_stabilized ?? 0}</strong><span>Critical Hotspots Stabilized</span></div>
            <div><strong>{impact.drains_intervened ?? 0}</strong><span>Drains Intervened</span></div>
            <div><strong>{impact.readiness_improvement_pct ?? 0}%</strong><span>Readiness Improvement</span></div>
            <div><strong>{impact.estimated_time_to_stabilization_min ?? 0} min</strong><span>Estimated Stabilization</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}