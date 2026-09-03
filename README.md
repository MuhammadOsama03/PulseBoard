# PulseBoard

PulseBoard is a real-time collaborative project management and analytics platform for teams that need a clear view of projects, tasks, ownership, progress, and activity.

## Product goals

- Organize projects and task workflows in one workspace.
- Track task status, priority, ownership, and due dates.
- Surface team activity and lightweight project analytics.
- Support real-time collaboration and live updates.
- Provide a clean, recruiter-ready full-stack architecture.

## Planned stack

- **Web:** Next.js + TypeScript
- **API:** Node.js + Express + TypeScript
- **Realtime:** Socket.IO
- **Database:** PostgreSQL with Prisma
- **Authentication:** Auth.js / JWT-based session layer
- **Validation:** Zod
- **Testing:** Vitest / API integration tests
- **Delivery:** Docker + GitHub Actions

## Initial workflow

1. A user creates a workspace and project.
2. Team members create, assign, and update tasks.
3. Project boards update as task state changes.
4. Activity events feed project analytics and real-time notifications.

## Status

Day 1 — architecture and application foundation in progress.
