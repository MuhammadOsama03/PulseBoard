import type { Task, TaskStatus } from "@pulseboard/shared";
import { randomUUID } from "node:crypto";

export type NewTaskInput = {
  projectId: string;
  title: string;
  description: string;
  priority: Task["priority"];
  assigneeId?: string | null;
  dueDate?: string | null;
};

const tasks: Task[] = [];

export function listTasks(projectId?: string): Task[] {
  if (!projectId) return [...tasks];
  return tasks.filter((task) => task.projectId === projectId);
}

export function createTask(input: NewTaskInput): Task {
  const task: Task = {
    id: randomUUID(),
    projectId: input.projectId,
    title: input.title.trim(),
    description: input.description.trim(),
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
