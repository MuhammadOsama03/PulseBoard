import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

import { createProject, createProjectSchema, listProjects } from "./projects.js";

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

io.on("connection", (socket) => {
  socket.emit("workspace:ready", {
    message: "PulseBoard realtime channel connected",
  });
});

const port = Number(process.env.PORT ?? 4000);
httpServer.listen(port, () => {
  console.log(`PulseBoard API listening on port ${port}`);
});
