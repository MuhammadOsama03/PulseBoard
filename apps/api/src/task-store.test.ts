import { describe, expect, it } from "vitest";

import {
  createTask,
  createTaskSchema,
  deleteTask,
  listTasks,
  taskListQuerySchema,
  updateTask,
  updateTaskSchema,
  updateTaskStatus,
} from "./task-store.js";

const projectA = "11111111-1111-4111-8111-111111111111";
const projectB = "22222222-2222-4222-8222-222222222222";

describe("task workflow service", () => {
  it("validates task creation and filtering inputs", () => {
    expect(createTaskSchema.safeParse({ projectId: projectA, title: "Ship API", description: "Finish the task API", priority: "high" }).success).toBe(true);
    expect(createTaskSchema.safeParse({ projectId: "invalid", title: "x", description: "bad", priority: "high" }).success).toBe(false);
    expect(taskListQuerySchema.safeParse({ projectId: projectA, status: "todo", priority: "high" }).success).toBe(true);
    expect(updateTaskSchema.safeParse({}).success).toBe(false);
  });

  it("creates, filters, updates, and deletes tasks coherently", () => {
    const first = createTask({ projectId: projectA, title: "Build dashboard", description: "Connect dashboard data", priority: "high", assigneeId: "osama", dueDate: null });
    const second = createTask({ projectId: projectB, title: "Write docs", description: "Document setup steps", priority: "medium", assigneeId: null, dueDate: null });

    expect(listTasks({ projectId: projectA })).toEqual([first]);
    expect(listTasks({ assigneeId: "osama" })).toEqual([first]);

    expect(updateTaskStatus(first.id, "in_progress")?.status).toBe("in_progress");
    expect(updateTask(first.id, { priority: "urgent", assigneeId: "muhammad" })).toMatchObject({ priority: "urgent", assigneeId: "muhammad" });
    expect(listTasks({ status: "in_progress", priority: "urgent" })).toHaveLength(1);

    expect(deleteTask(second.id)?.id).toBe(second.id);
    expect(listTasks({ projectId: projectB })).toHaveLength(0);
    expect(deleteTask("missing-task")).toBeNull();
  });
});
