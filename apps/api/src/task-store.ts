import type { Task, TaskStatus } from "@pulseboard/shared";
import { randomUUID } from "node:crypto";
import { z } from "zod";

export const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(5).max(1000),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assigneeId: z.string().trim().min(1).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(["backlog", "todo", "in_progress", "review", "done"]),
});

export type NewTaskInput = z.infer<typeof createTaskSchema>;

const tasks: Task[] = [];

export function listTasks(projectId?: string): Task[] {
  if (!projectId) return [...tasks];
  return tasks.filter((task) => task.projectId === projectId);
}

export function createTask(input: NewTaskInput): Task {
  const task: Task = {
    id: randomUUID(),
    projectId: input.projectId,
    title: input.title,
    description: input.description,
    status: "todo",
    priority: input.priority,
    assigneeId: input.assigneeId ?? null,
    dueDate: input.dueDate ?? null,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(task);
  return task;
}

export function updateTaskStatus(id: string, status: TaskStatus): Task | null {
  const task = tasks.find((item) => item.id === id);
  if (!task) return null;
  task.status = status;
  return task;
}
