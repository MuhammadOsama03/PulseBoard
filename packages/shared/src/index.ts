export type ProjectStatus = "planning" | "active" | "at_risk" | "completed";
export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  createdAt: string;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: string | null;
  createdAt: string;
};

export type ActivityEvent = {
  id: string;
  projectId: string;
  actorId: string;
  type: "project.created" | "task.created" | "task.updated" | "task.completed";
  message: string;
  createdAt: string;
};
