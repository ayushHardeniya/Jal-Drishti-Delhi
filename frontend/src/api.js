import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: API_BASE });

/* ---- Settings / State ---- */
export const getRainfall = () => api.get('/api/settings/rainfall');
export const setRainfall = (rainfall) => api.put('/api/settings/rainfall', { rainfall });
export const getAppState = () => api.get('/api/state');

/* ---- Dashboard ---- */
export const getDashboardSummary = (rainfall) =>
  api.get('/api/dashboard/summary', { params: { rainfall } });
export const getDashboardAlerts = (rainfall) =>
  api.get('/api/dashboard/alerts', { params: { rainfall } });

/* ---- Hotspots ---- */
export const getHotspots = (rainfall) =>
  api.get('/api/hotspots', { params: { rainfall } });
export const deployPumpsToHotspot = (id) =>
  api.post(`/api/hotspots/${id}/deploy-pumps`);
export const trafficDiversionHotspot = (id) =>
  api.post(`/api/hotspots/${id}/traffic-diversion`);
export const alertResidents = (id) =>
  api.post(`/api/hotspots/${id}/alert-residents`);

/* ---- Drainage ---- */
export const getDrainage = () => api.get('/api/drainage');
export const scheduleMaintenance = (id) =>
  api.post(`/api/drainage/${id}/schedule-maintenance`);

/* ---- Analytics ---- */
export const getPrediction = (rainfall) =>
  api.get('/api/analytics/prediction', { params: { rainfall } });
export const getRiskDistribution = (rainfall) =>
  api.get('/api/analytics/risk-distribution', { params: { rainfall } });
export const getRainfallCorrelation = () =>
  api.get('/api/analytics/rainfall-correlation');
export const getAnalyticsMetrics = (rainfall) =>
  api.get('/api/analytics/metrics', { params: { rainfall } });

/* ---- Historical ---- */
export const getHistoricalYearly = () => api.get('/api/historical/yearly');
export const getHistoricalSeasonal = () => api.get('/api/historical/seasonal');
export const getAffectedAreas = () => api.get('/api/historical/affected-areas');
export const getHistoricalSummary = () => api.get('/api/historical/summary');
export const getHistoricalDownload = () => api.get('/api/historical/download');

/* ---- Readiness ---- */
export const getReadiness = (rainfall) =>
  api.get('/api/readiness', { params: { rainfall } });

/* ---- Reports & Exports ---- */
export const getReportsSummary = (rainfall) =>
  api.get('/api/reports/summary', { params: { rainfall } });
export const downloadFloodSituationReport = (rainfall) =>
  api.get('/api/reports/situation-report.pdf', { params: { rainfall }, responseType: 'blob' });
export const downloadResourceAllocationReport = (rainfall) =>
  api.get('/api/reports/resource-allocation-report.pdf', { params: { rainfall }, responseType: 'blob' });
export const downloadScenarioAnalysisReport = (scenarioId, rainfall) =>
  api.get('/api/reports/scenario-analysis-report.pdf', {
    params: { scenario_id: scenarioId, rainfall },
    responseType: 'blob',
  });
export const downloadHistoricalDataCsv = () =>
  api.get('/api/exports/historical-data.csv', { responseType: 'blob' });
export const downloadHotspotDataCsv = (rainfall) =>
  api.get('/api/exports/hotspot-data.csv', { params: { rainfall }, responseType: 'blob' });
export const downloadReadinessScoresCsv = (rainfall) =>
  api.get('/api/exports/readiness-scores.csv', { params: { rainfall }, responseType: 'blob' });

/* ---- Planning / Resource Allocation ---- */
export const getPlanningAllocation = (rainfall) =>
  api.get('/api/planning/allocation', { params: { rainfall } });
export const getPlanningSummary = (rainfall) =>
  api.get('/api/planning/summary', { params: { rainfall } });
export const applyPlanningAllocation = (payload = {}) =>
  api.post('/api/planning/allocation/apply', payload);

/* ---- Scenario Simulation ---- */
export const getScenarioPresets = () => api.get('/api/scenarios/presets');
export const simulateScenario = (payload = {}) =>
  api.post('/api/scenarios/simulate', payload);

/* ---- Emergency ---- */
export const getEmergencyStatus = () => api.get('/api/emergency/status');
export const emergencyDeployPumps = (count = 5) =>
  api.post('/api/emergency/deploy-pumps', { count });
export const emergencyTrafficDiversion = () =>
  api.post('/api/emergency/traffic-diversion');
export const emergencyMassSms = () => api.post('/api/emergency/mass-sms');
export const emergencyNdrf = () => api.post('/api/emergency/ndrf-request');
export const emergencyEvacuate = () => api.post('/api/emergency/evacuate');
export const emergencyMedical = () => api.post('/api/emergency/medical-teams');
export const emergencyAlertAll = () => api.post('/api/emergency/alert-all');
export const getSituationReport = (rainfall) =>
  api.get('/api/emergency/situation-report', { params: { rainfall } });
export const getEmergencyContacts = () => api.get('/api/emergency/contacts');
export const getActionsLog = () => api.get('/api/emergency/actions-log');
