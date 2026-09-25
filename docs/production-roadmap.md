# Production roadmap

PulseBoard's in-memory MVP is intentionally easy to run. A hosted multi-user release needs the following work in order.

## 1. Persistence

Introduce PostgreSQL behind repository interfaces, add migrations, preserve existing service tests, and add integration tests for transactions and concurrent updates. Define backup and restoration procedures before storing production data.

## 2. Identity and tenancy

Add an identity provider, workspace membership, and role-based authorization. Every project, task, activity, and realtime subscription must be scoped to a workspace on the server; client-side filtering is not an authorization boundary.

## 3. Realtime reliability

Authenticate Socket.IO connections, authorize rooms, reconnect with bounded backoff, and ensure replay or refetch closes gaps after disconnects. Add limits for connections and event payloads.

## 4. Operations

Add structured logs, request identifiers, health/readiness checks, metrics, error reporting, and rate limits. Keep secrets out of source control and terminate TLS at the deployment edge.

## Release criteria

CI passes, migrations and rollback are tested, authorization tests cover cross-workspace access, accessibility is reviewed, dependencies are scanned, and an incident owner is documented.
