import React from 'react';

export default function AllocationRecommendationTable({ recommendations = [] }) {
  if (!recommendations.length) {
    return <div className="empty-state">No allocation recommendations available.</div>;
  }

  return (
    <div className="card">
      <div className="card-body allocation-table-wrap">
        <table className="data-table allocation-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Target</th>
              <th>Resource</th>
              <th>Qty</th>
              <th>Priority</th>
              <th>Reasoning</th>
              <th>Expected Impact</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map((item) => (
              <tr key={`${item.target_type}-${item.target_id}-${item.resource_type}`}>
                <td><strong>{item.rank}</strong></td>
                <td>
                  <div className="allocation-target-cell">
                    <strong>{item.target_name}</strong>
                    <span>{item.zone_name}</span>
                  </div>
                </td>
                <td>
                  <span className="badge badge-safe allocation-resource-badge">
                    {item.resource_type.replace('_', ' ')}
                  </span>
                </td>
                <td>{item.quantity}</td>
                <td>
                  <strong>{item.priority_score}</strong>
                  <div className="allocation-confidence">Confidence {item.confidence}%</div>
                </td>
                <td>
                  <div className="allocation-reasoning">
                    <p>{item.reason}</p>
                    <ul>
                      {item.supporting_factors.map((factor) => (
                        <li key={factor}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                </td>
                <td>
                  <div className="allocation-impact-list">
                    <span>Risk -{item.expected_effect.risk_reduction_pct}%</span>
                    <span>{item.expected_effect.population_protected.toLocaleString()} protected</span>
                    <span>+{item.expected_effect.readiness_gain_pct}% readiness</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}