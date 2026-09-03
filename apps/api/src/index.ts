import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

import { createProject, createProjectSchema, listProjects } from "./projects.js";
import {
  createTask,
  createTaskSchema,
  listTasks,
  updateTaskStatus,
  updateTaskStatusSchema,
} from "./task-store.js";

const app = express();
const httpServer = createServer(app);
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

const io = new Server(httpServer, {
  cors: { origin: webOrigin },
});

app.use(cors({ origin: webOrigin }));
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "pulseboard-api", realtime: true });
});

app.get("/projects", (_request, response) => {
  response.json(listProjects());
});

app.post("/projects", (request, response) => {
  const parsed = createProjectSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid project payload", issues: parsed.error.issues });
    return;
  }

  const project = createProject(parsed.data);
  io.emit("project:created", project);
  response.status(201).json(project);
});

app.get("/tasks", (request, response) => {
  const projectId = typeof request.query.projectId === "string" ? request.query.projectId : undefined;
  response.json(listTasks(projectId));
});

app.post("/tasks", (request, response) => {
  const parsed = createTaskSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid task payload", issues: parsed.error.issues });
    return;
  }

  const task = createTask(parsed.data);
  io.emit("task:created", task);
  response.status(201).json(task);
});

app.patch("/tasks/:taskId/status", (request, response) => {
  const parsed = updateTaskStatusSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid task status", issues: parsed.error.issues });
    return;
  }

  const task = updateTaskStatus(request.params.taskId, parsed.data.status);
  if (!task) {
    response.status(404).json({ error: "Task not found" });
    return;
  }

  io.emit("task:updated", task);
  response.json(task);
});

io.on("connection", (socket) => {
  socket.emit("workspace:ready", {
    message: "PulseBoard realtime channel connected",
  });
});

const port = Number(process.env.PORT ?? 4000);
httpServer.listen(port, () => {
  console.log(`PulseBoard API listening on port ${port}`);
});
