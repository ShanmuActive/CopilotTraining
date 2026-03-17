---
description: Standards and rules for building vehicle telemetry ingestion and fleet visualization features
applyTo: '**/*'
---

# Vehicle Telemetry Engineering Instructions

Load these instructions when working on features related to vehicle telemetry ingestion, processing, storage, APIs, dashboards, alerts, analytics, or platform reliability.

## Core Principles

- Follow SOLID principles in all design and refactoring decisions.
- Prefer clear, maintainable code over clever or overly compact implementations.
- Keep modules cohesive and loosely coupled.
- Enforce separation of concerns across ingestion, domain logic, persistence, transport, and presentation layers.
- Design for testability: pure domain logic, dependency inversion, and explicit interfaces.

## SOLID Application Rules

- Single Responsibility Principle (SRP): each class/module should have one reason to change.
- Open/Closed Principle (OCP): extend behavior through interfaces/strategies instead of modifying stable core logic.
- Liskov Substitution Principle (LSP): derived implementations must preserve expected contract behavior.
- Interface Segregation Principle (ISP): expose small, focused interfaces (ingestion, validation, repository, publisher, notifier).
- Dependency Inversion Principle (DIP): high-level services must depend on abstractions, not concrete frameworks or SDKs.

## Architecture and Design Rules

- Prefer layered or hexagonal architecture:
	- Transport adapters: HTTP, MQTT, WebSocket.
	- Application services: orchestration and use cases.
	- Domain layer: telemetry rules, validation, state transitions.
	- Infrastructure: databases, cache, brokers, external map/notification APIs.
- Keep framework-specific code at boundaries.
- Use DTOs/contracts at boundaries and map to domain models internally.
- Preserve backward compatibility for public API and event schemas.
- Add versioning for telemetry payload schemas and APIs.

## Coding Standards

- Follow language-specific style guides and linters (for example: PEP8, ESLint, Prettier, gofmt, Checkstyle).
- Use meaningful names for classes, methods, and variables.
- Keep functions short and focused; avoid deep nesting.
- Prefer composition over inheritance unless inheritance clearly models domain behavior.
- Avoid duplicated logic; extract reusable domain utilities.
- Handle errors explicitly with typed/structured error handling.
- Do not swallow exceptions; log context and rethrow or return typed errors.
- Avoid magic values; use constants/config.
- Add concise comments only where intent is non-obvious.

## Telemetry Domain Rules

- Normalize all timestamps to UTC and store as timezone-aware values.
- Validate telemetry input strictly:
	- speed range checks.
	- battery percentage range (0-100).
	- latitude/longitude validity and precision.
- Support idempotent ingestion to prevent duplicate event writes.
- Preserve raw event data when required for audit/debug; store derived state separately.
- Maintain a current vehicle state projection for low-latency dashboard reads.
- Implement stale/offline detection based on last-seen timestamps.
- Gracefully handle missing optional fields and out-of-order events.

## API and Contract Rules

- Use explicit request/response schemas with validation.
- Return consistent error contracts (code, message, correlation id, details).
- Use pagination, filtering, and time-range query parameters for list/history endpoints.
- Keep endpoint naming resource-oriented and consistent.
- Document breaking changes and increment API version accordingly.

## Security and Privacy Rules

- Enforce authentication and authorization for all operator and admin endpoints.
- Apply role-based access control for fleet and vehicle-level data.
- Protect sensitive data in transit and at rest.
- Minimize personally identifiable data exposure.
- Include audit logging for privileged actions and sensitive data access.
- Never hardcode credentials or secrets.

## Reliability and Performance Rules

- Use retries with backoff for transient broker/network/storage failures.
- Add dead-letter handling for invalid or poison telemetry messages.
- Use bulk writes/batching where appropriate.
- Add indexes for high-frequency query patterns (vehicle id + timestamp).
- Measure and optimize p95 and p99 ingest-to-visualization latency.
- Use caching for fleet summary/state endpoints when safe.

## Testing Requirements

- Unit tests for domain rules, validators, and state transitions.
- Integration tests for ingestion pipeline (adapter -> service -> storage -> publish).
- Contract tests for API and event schemas.
- End-to-end tests for operator workflows (live map, vehicle details, history, alerts).
- Include negative tests for malformed payloads, duplicates, and out-of-order data.
- Add performance tests for expected pilot and peak telemetry rates.

## Observability Rules

- Emit structured logs with correlation and vehicle identifiers.
- Track key metrics:
	- ingestion throughput.
	- processing failures.
	- queue lag.
	- websocket fan-out latency.
	- API latency/error rates.
- Add tracing across ingestion, processing, and query paths.
- Define alerts with actionable thresholds and runbook references.

## Pull Request and Review Rules

- Keep PRs focused and small where practical.
- Every change must include tests or a clear rationale when tests are not feasible.
- Review for correctness first, then reliability, security, maintainability, and performance.
- Explicitly assess SOLID adherence in architecture-impacting changes.
- Reject changes that introduce tight coupling across layers.

## Definition of Done

- Feature behavior matches requirements and domain rules.
- Tests pass locally/CI and cover critical paths.
- Logging/metrics/tracing updated for new behavior.
- API/event contract documentation updated when changed.
- Security/privacy impact assessed.
- No critical linting or static analysis issues.