import cors from "cors";
import express, { type Request } from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

import { listActivity, recordActivity } from "./activity-store.js";
import { createProject, createProjectSchema, getProject, listProjects, syncProjectProgress } from "./projects.js";
import { createTask, createTaskSchema, listTasks, taskListQuerySchema, updateTaskStatus, updateTaskStatusSchema } from "./task-store.js";

const app = express();
const httpServer = createServer(app);
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
const io = new Server(httpServer, { cors: { origin: webOrigin } });
app.use(cors({ origin: webOrigin }));
app.use(express.json());

function getActorId(request: Request): string { return request.header("x-actor-id")?.trim() || "system"; }
function publishActivity(event: ReturnType<typeof recordActivity>) { io.emit("activity:created", event); return event; }
function refreshProjectPulse(projectId: string) {
  const project = syncProjectProgress(projectId, listTasks({ projectId }));
  if (project) io.emit("project:updated", project);
  return project;
}

app.get("/health", (_request, response) => response.json({ status: "ok", service: "pulseboard-api", realtime: true }));
app.get("/projects", (_request, response) => response.json(listProjects()));
app.post("/projects", (request, response) => {
  const parsed = createProjectSchema.safeParse(request.body);
  if (!parsed.success) { response.status(400).json({ error: "Invalid project payload", issues: parsed.error.issues }); return; }
  const project = createProject(parsed.data);
  const activity = publishActivity(recordActivity({ projectId: project.id, actorId: getActorId(request), type: "project.created", message: `Created project "${project.name}"` }));
  io.emit("project:created", project); response.status(201).json({ ...project, activity });
});

app.get("/tasks", (request, response) => {
  const parsed = taskListQuerySchema.safeParse(request.query);
  if (!parsed.success) { response.status(400).json({ error: "Invalid task filters", issues: parsed.error.issues }); return; }
  response.json(listTasks(parsed.data));
});
app.post("/tasks", (request, response) => {
  const parsed = createTaskSchema.safeParse(request.body);
  if (!parsed.success) { response.status(400).json({ error: "Invalid task payload", issues: parsed.error.issues }); return; }
  if (!getProject(parsed.data.projectId)) { response.status(404).json({ error: "Project not found" }); return; }
  const task = createTask(parsed.data); const project = refreshProjectPulse(task.projectId);
  const activity = publishActivity(recordActivity({ projectId: task.projectId, actorId: getActorId(request), type: "task.created", message: `Created task "${task.title}"` }));
  io.emit("task:created", task); response.status(201).json({ ...task, project, activity });
});
app.patch("/tasks/:taskId/status", (request, response) => {
  const parsed = updateTaskStatusSchema.safeParse(request.body);
  if (!parsed.success) { response.status(400).json({ error: "Invalid task status", issues: parsed.error.issues }); return; }
  const task = updateTaskStatus(request.params.taskId, parsed.data.status);
  if (!task) { response.status(404).json({ error: "Task not found" }); return; }
  const project = refreshProjectPulse(task.projectId);
  const activity = publishActivity(recordActivity({ projectId: task.projectId, actorId: getActorId(request), type: task.status === "done" ? "task.completed" : "task.updated", message: `Moved "${task.title}" to ${task.status.replaceAll("_", " ")}` }));
  io.emit("task:updated", task); response.json({ ...task, project, activity });
});
app.get("/activity", (request, response) => {
  const projectId = typeof request.query.projectId === "string" ? request.query.projectId : undefined;
  const requestedLimit = Number(request.query.limit ?? 50); const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;
  response.json(listActivity(projectId, limit));
});
io.on("connection", (socket) => socket.emit("workspace:ready", { message: "PulseBoard realtime channel connected" }));
const port = Number(process.env.PORT ?? 4000);
httpServer.listen(port, () => console.log(`PulseBoard API listening on port ${port}`));
