import { beforeEach, describe, expect, it } from "vitest";
import { createProject, createProjectSchema, resetProjects, syncProjectProgress } from "./projects.js";

const task = (status: "backlog" | "todo" | "in_progress" | "review" | "done", dueDate: string | null = null) => ({
  id: crypto.randomUUID(),
  projectId: "project",
  title: "Ship dashboard",
  description: "Finish the dashboard workflow",
  status,
  priority: "medium" as const,
  assigneeId: null,
  dueDate,
  createdAt: new Date().toISOString(),
});

describe("project workflow", () => {
  beforeEach(resetProjects);

  it("validates project input", () => {
    expect(createProjectSchema.safeParse({ name: "PB", description: "short" }).success).toBe(false);
    expect(createProjectSchema.safeParse({ name: "PulseBoard", description: "Team delivery workspace" }).success).toBe(true);
  });

  it("creates projects in planning state", () => {
    const project = createProject({ name: "PulseBoard", description: "Team delivery workspace" });
    expect(project.status).toBe("planning");
    expect(project.progress).toBe(0);
  });

  it("derives progress from task workflow", () => {
    const project = createProject({ name: "PulseBoard", description: "Team delivery workspace" });
    const updated = syncProjectProgress(project.id, [task("todo"), task("in_progress"), task("done")]);
    expect(updated?.progress).toBe(53);
    expect(updated?.status).toBe("active");
  });

  it("marks completed and overdue projects", () => {
    const completed = createProject({ name: "Completed", description: "A completed delivery project" });
    expect(syncProjectProgress(completed.id, [task("done"), task("done")])?.status).toBe("completed");

    const overdue = createProject({ name: "Overdue", description: "A delivery project with risk" });
    expect(syncProjectProgress(overdue.id, [task("in_progress", "2020-01-01T00:00:00.000Z")])?.status).toBe("at_risk");
  });
});
