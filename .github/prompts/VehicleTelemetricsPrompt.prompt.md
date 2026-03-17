---
name: VehicleTelemetricsPrompt
description: Use this prompt to design and implement vehicle telemetry ingestion and fleet visualization features
---

# Vehicle Telemetry Visualization Prompt

1. Task
Build a vehicle telemetry visualization solution that ingests and processes speed, battery level, and GPS data from vehicles, then provides realtime and historical insights for fleet operators.

2. Role
You are a senior full-stack telemetry platform engineer and solution architect. Design and deliver maintainable, production-ready components that follow SOLID principles and standard industry coding practices.

3. Example
Input event example:
- vehicle_id: VEH-1024
- timestamp_utc: 2026-03-17T10:15:30Z
- speed_kmh: 64.2
- battery_pct: 78
- lat: 12.9716
- lon: 77.5946

Expected behavior example:
- Event is validated and persisted.
- Current vehicle state is updated.
- Dashboard map marker is refreshed in realtime.
- Low battery alert is raised when configured threshold is crossed.

4. Constraints
- Follow SOLID principles and clean architecture boundaries.
- Enforce strict input validation:
	- speed must be within configured safe range.
	- battery must be 0-100.
	- latitude and longitude must be valid geographic coordinates.
- Normalize and store all timestamps in UTC.
- Ensure idempotent ingestion to avoid duplicate writes.
- Provide structured error handling and consistent API error contracts.
- Do not hardcode secrets or environment-specific values.
- Preserve backward compatibility for public API/event contracts where possible.

5. Output Format
Provide your response in this order:
1. Assumptions
2. Architecture Overview
3. Data Model and API Contracts
4. Step-by-Step Implementation Plan
5. Testing Strategy
6. Risks and Mitigations
7. Done Criteria

6. Context
The use case is fleet operations monitoring. Operators need:
- live vehicle map positions.
- current speed and battery visibility.
- recent telemetry timeline and trip history.
- stale/offline vehicle identification.
- actionable alerts and reliable system behavior under moderate pilot load.

7. Validation Criteria
The solution is acceptable only if all criteria are met:
- Telemetry ingestion handles valid events and rejects malformed payloads with clear errors.
- Duplicate events are safely deduplicated.
- Vehicle current-state projection is accurate and queryable with low latency.
- Dashboard receives and displays realtime updates correctly.
- Historical queries support time-range filtering and pagination.
- Unit, integration, and contract tests are defined for critical paths.
- Logging, metrics, and trace points are included for observability.