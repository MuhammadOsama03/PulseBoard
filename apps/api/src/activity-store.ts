import type { ActivityEvent } from "@pulseboard/shared";
import { randomUUID } from "node:crypto";

export type NewActivityEvent = Omit<ActivityEvent, "id" | "createdAt">;

const activityEvents: ActivityEvent[] = [];

export function listActivity(projectId?: string, limit = 50): ActivityEvent[] {
  const matchingEvents = projectId
    ? activityEvents.filter((event) => event.projectId === projectId)
    : activityEvents;

  return matchingEvents.slice(0, limit);
}

export function recordActivity(input: NewActivityEvent): ActivityEvent {
  const event: ActivityEvent = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };

  activityEvents.unshift(event);
  return event;
}
