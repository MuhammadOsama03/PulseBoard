import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  },
});

app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:3000" }));
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "pulseboard-api",
    realtime: true,
  });
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
