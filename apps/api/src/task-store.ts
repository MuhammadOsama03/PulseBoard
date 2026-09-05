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

export const taskListQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  status: z.enum(["backlog", "todo", "in_progress", "review", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assigneeId: z.string().trim().min(1).optional(),
});

export type NewTaskInput = z.infer<typeof createTaskSchema>;
export type TaskListQuery = z.infer<typeof taskListQuerySchema>;

const tasks: Task[] = [];

export function listTasks(filters: TaskListQuery = {}): Task[] {
  return tasks.filter((task) => {
    if (filters.projectId && task.projectId !== filters.projectId) return false;
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.assigneeId && task.assigneeId !== filters.assigneeId) return false;
    return true;
  });
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
