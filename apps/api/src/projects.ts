import type { Project, Task } from "@pulseboard/shared";
import { randomUUID } from "node:crypto";
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(3).max(80),
  description: z.string().trim().min(10).max(500),
});

const projects: Project[] = [];

export function listProjects(): Project[] {
  return [...projects];
}

export function getProject(id: string): Project | null {
  return projects.find((project) => project.id === id) ?? null;
}

export function createProject(input: z.infer<typeof createProjectSchema>): Project {
  const project: Project = {
    id: randomUUID(),
    name: input.name,
    description: input.description,
    status: "planning",
    progress: 0,
    createdAt: new Date().toISOString(),
  };

  projects.unshift(project);
  return project;
}

export function syncProjectProgress(projectId: string, tasks: Task[]): Project | null {
  const project = getProject(projectId);
  if (!project) return null;

  if (tasks.length === 0) {
    project.progress = 0;
    project.status = "planning";
    return project;
  }

  const statusProgress: Record<Task["status"], number> = {
    backlog: 0,
    todo: 10,
    in_progress: 50,
    review: 80,
    done: 100,
  };

  project.progress = Math.round(
    tasks.reduce((total, task) => total + statusProgress[task.status], 0) / tasks.length,
  );

  const now = Date.now();
  const hasOverdueWork = tasks.some(
    (task) => task.status !== "done" && task.dueDate && new Date(task.dueDate).getTime() < now,
  );

  project.status = project.progress === 100
    ? "completed"
    : hasOverdueWork
      ? "at_risk"
      : "active";

  return project;
}
