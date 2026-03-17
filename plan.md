## Plan: Vehicle Telemetry Pilot Dashboard

Build a small-pilot telemetry platform for up to 100 vehicles with realtime (<1s) operator updates using a pragmatic stack: MQTT ingestion + Node.js API + PostgreSQL/TimescaleDB + Redis pub/sub + React map dashboard. Scope is architecture and execution planning only, with no code implementation in this step.

**Steps**
1. Phase 1 - Foundation and Contracts
2. Define functional requirements for pilot scope: ingest speed, battery level, GPS; visualize live map and per-vehicle detail; provide basic historical playback and alert feed.
3. Define non-functional requirements: sub-second UI updates for new telemetry, 99% message durability for reconnect scenarios, and target dashboard response under 2s for recent history queries.
4. Finalize canonical telemetry event contract with strict validation and idempotency key policy (vehicle_id + device_ts + sequence_no).
5. Define vehicle lifecycle state machine (online, stale, offline) and update windows (for example stale at 15s, offline at 60s). *depends on 2-4*
6. Phase 2 - Ingestion and Realtime Pipeline
7. Use MQTT topic pattern by fleet and vehicle for device publishing, with QoS chosen to balance reliability and throughput (recommend QoS 1 for pilot).
8. Build ingestion service responsibilities: schema validation, deduplication, server timestamping, and persistence fan-out to both time-series store and realtime channel. *depends on 4*
9. Add Redis pub/sub (or Redis streams) as realtime fan-out layer from backend to WebSocket gateway for operator clients. *depends on 8*
10. Define backpressure and retry policy: bounded ingestion queue, dead-letter handling for malformed events, and replay path for transient DB outages.
11. Phase 3 - Storage and Query Layer
12. Model PostgreSQL tables for vehicles and fleet metadata; model TimescaleDB hypertable for raw telemetry events. *depends on 4*
13. Add indexed current-state table/materialized projection per vehicle for low-latency map rendering. *depends on 12*
14. Define retention policy: raw high-frequency telemetry (for example 30-90 days) plus rollups (5m/1h) for longer analytics horizon.
15. Define query APIs for: latest fleet state, vehicle history by time range, trip/path reconstruction, and alert/event listing. *depends on 13-14*
16. Phase 4 - Operator Dashboard UX
17. Implement primary views in plan: live fleet map, vehicle detail panel, fleet KPI strip, alerts feed, and recent route playback.
18. Specify realtime UI behavior: optimistic marker updates, stale/offline visual states, and graceful degradation to polling if socket drops. *depends on 9*
19. Define filtering/search interactions (vehicle id, status, low battery, geofence area) and map clustering for marker density.
20. Define role boundaries for pilot users (operator/admin) and minimum audit logging for access to location history.
21. Phase 5 - Verification and Pilot Readiness
22. Define automated validation suite: contract tests for ingestion payloads, integration tests for MQTT-to-DB-to-WebSocket pipeline, and API tests for historical queries.
23. Define performance test profile for 100 vehicles sending 1Hz telemetry; track p95 ingest-to-screen latency and DB query latency targets.
24. Define reliability drills: broker restart, Redis restart, DB failover simulation, and message replay correctness checks.
25. Define pilot acceptance criteria and go-live checklist (observability dashboards, alert thresholds, incident runbook, and rollback procedure).

**Relevant files**
- No workspace files exist yet. Implementation should begin by creating backend, frontend, and infra directories after plan approval.

**Verification**
1. Architecture review confirms pilot scale assumptions (<=100 vehicles) and realtime target (<1s) are achievable with MQTT + Redis + WebSocket.
2. Data contract review validates required fields and edge handling for missing battery/GPS precision.
3. Load simulation verifies 100 events/second sustained and acceptable p95 ingest-to-screen latency.
4. Operator workflow walkthrough validates map usability, filtering, alerts clarity, and vehicle detail usefulness.
5. Failure-mode tests verify no silent data loss during transient component outages.

**Decisions**
- Included scope: small pilot, realtime operator visualization, core telemetry fields (speed, battery, GPS), and foundational historical/alert views.
- Excluded scope: enterprise multi-region scaling, advanced ML anomaly detection, and native mobile app.
- Chosen defaults: Node.js backend, React frontend, PostgreSQL + TimescaleDB storage, Redis realtime fan-out, MQTT device ingress.

**Further Considerations**
1. Device protocol certainty: if some sources cannot publish MQTT, add a REST ingestion adapter while preserving the same event contract.
2. Map provider selection: choose based on coverage, cost, and offline tile fallback needs for your operating region.
3. Compliance posture: if personally identifiable driving data is in scope later, define retention/deletion and consent requirements before expansion.
