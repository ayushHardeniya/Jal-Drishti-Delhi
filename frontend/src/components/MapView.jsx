import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

export default function MapView({ hotspots }) {
  if (!hotspots || hotspots.length === 0) {
    return <div className="loading">Loading map data...</div>;
  }

  const getColor = (risk) => {
    if (risk > 0.75) return '#c53030';
    if (risk > 0.50) return '#dd6b20';
    return '#2f855a';
  };

  return (
    <div className="map-container">
      <MapContainer
        center={[28.6139, 77.2090]}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hotspots.map((spot) => (
          <CircleMarker
            key={spot.id}
            center={[spot.lat, spot.lon]}
            radius={spot.current_risk > 0.75 ? 14 : 10}
            pathOptions={{
              color: getColor(spot.current_risk),
              fillColor: getColor(spot.current_risk),
              fillOpacity: 0.6,
              weight: 2,
            }}
          >
            <Popup>
              <div>
                <strong>{spot.name}</strong><br />
                Risk: {spot.risk_pct}%<br />
                Status: {spot.status}<br />
                Elevation: {spot.elevation}m<br />
                Population: {spot.population.toLocaleString()}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
