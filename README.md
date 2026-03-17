# Vehicle Telemetry Visualization

A self-contained scaffold for vehicle telemetry ingestion and fleet visualization.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Dashboard layout and structure |
| `style.css` | Styling for KPIs, fleet table, status pills, timeline |
| `script.js` | Telemetry simulation, validation, state management, rendering |

## Run

Open `index.html` in any browser. No server, no build step, no dependencies.

The built-in simulator generates realtime telemetry for four vehicles every second.

## Features

- Live fleet table with speed, battery, GPS coordinates, and last-update time.
- Status pills (online / stale / offline) based on configurable thresholds.
- KPI strip: total vehicles, online count, stale count, average fleet speed.
- Vehicle timeline panel: click any row to see that vehicle's recent event history.
- Strict client-side validation matching the telemetry event contract.
- Smooth simulated transitions for speed, battery drain, and GPS movement.

## Configuration

Edit the `CONFIG` object at the top of `script.js`:

| Key | Default | Description |
|-----|---------|-------------|
| `vehicleIds` | 4 vehicles | Array of simulated vehicle identifiers |
| `updateIntervalMs` | 1000 | Simulation tick interval in milliseconds |
| `staleAfterSeconds` | 15 | Seconds before a vehicle is marked stale |
| `offlineAfterSeconds` | 60 | Seconds before a vehicle is marked offline |
| `historyLimit` | 25 | Max events kept per vehicle in the timeline |

## Next Steps

- Replace the built-in simulator with a real backend API and Server-Sent Events or WebSocket stream.
- Add persistent storage (for example PostgreSQL + TimescaleDB).
- Add map visualization with a provider like Leaflet or Mapbox.
- Add alert rules for low battery, speed anomalies, and geofence violations.
