# PulseBoard

PulseBoard is a real-time project management dashboard built as a full-stack TypeScript monorepo. It gives teams one place to create projects, manage task ownership and due dates, track workflow progress, and see activity update in real time.

## What it does

- Create projects and automatically derive project progress from task state.
- Create, edit, filter, move, assign, prioritize, schedule, and delete tasks.
- Flag projects with overdue work as at risk and mark fully completed projects automatically.
- Record project/task activity and broadcast live updates with Socket.IO.
- Refresh the Next.js dashboard when realtime project, task, or activity events arrive.
- Validate API input with Zod and cover core task/project workflows with Vitest.

## Stack

- **Web:** Next.js + TypeScript
- **API:** Node.js + Express + TypeScript
- **Realtime:** Socket.IO
- **Validation:** Zod
- **Testing:** Vitest
- **Quality:** TypeScript checks, tests, production builds, GitHub Actions

The current portfolio build deliberately keeps data in memory so the repository remains simple to run and review. PostgreSQL/Prisma and authentication are natural deployment extensions rather than hidden requirements for the demo.

## Run locally

Requirements: **Node.js 22+** and npm.

```bash
npm install
npm run dev:api
```

In another terminal:

```bash
npm run dev:web
```

The web app defaults to `http://localhost:3000` and the API to `http://localhost:4000`.

For a different API host, set:

```bash
PULSEBOARD_API_URL=http://localhost:4000
NEXT_PUBLIC_PULSEBOARD_API_URL=http://localhost:4000
```

The API also accepts `WEB_ORIGIN` for CORS configuration.

## Quality checks

Run the complete repository validation before shipping:

```bash
npm run check
```

That command runs workspace TypeScript checks, automated tests, and production builds. The same check runs in GitHub Actions for pushes and pull requests targeting `main`.

## Architecture

```text
apps/web       Next.js dashboard and server actions
apps/api       Express API, Socket.IO events, workflow services and tests
packages/shared Shared TypeScript domain models
```

Task mutations update the in-memory workflow service, refresh the parent project's derived pulse, record an activity event, and emit realtime events consumed by the dashboard.

## API overview

- `GET /health`
- `GET /projects`
- `POST /projects`
- `GET /tasks` — supports project, status, priority, and assignee filters
- `POST /tasks`
- `PATCH /tasks/:taskId`
- `PATCH /tasks/:taskId/status`
- `DELETE /tasks/:taskId`
- `GET /activity`

## Project status

**Portfolio MVP complete.** The repository now contains the core project/task workflow, ownership and due dates, derived delivery analytics, realtime activity, editing/deletion flows, validation, automated service tests, a repository-wide quality command, and continuous integration.

Potential future production extensions include persistent PostgreSQL storage, authentication/authorization, multi-workspace membership, and deployment-specific observability.
