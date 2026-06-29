const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://front-zoonito.vercel.app",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
}));

// 🧠 Rutas API normales
app.get("/api/test", (req, res) => {
  res.send("Servidor OK 🚀");
});

// ⚡ Configuración Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: [
      "http://localhost:3000",
      "https://front-zoonito.vercel.app",
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("✅ Cliente conectado:", socket.id);

  socket.on("join-radio", ({ sessionId }) => {
    socket.join(`radio-${sessionId}`);
    console.log(`📻 Cliente ${socket.id} se unió a radio-${sessionId}`);

    const room = io.sockets.adapter.rooms.get(`radio-${sessionId}`);
    const listenerCount = room ? room.size : 0;

    io.to(`radio-${sessionId}`).emit("listener-count", listenerCount);
  });

  socket.on("leave-radio", ({ sessionId }) => {
    socket.leave(`radio-${sessionId}`);
    console.log(`👋 Cliente ${socket.id} salió de radio-${sessionId}`);

    const room = io.sockets.adapter.rooms.get(`radio-${sessionId}`);
    const listenerCount = room ? room.size : 0;

    io.to(`radio-${sessionId}`).emit("listener-count", listenerCount);
  });

  socket.on("live-audio-chunk", ({ sessionId, audioChunk }) => {
    socket.to(`radio-${sessionId}`).emit("receive-live-audio", audioChunk);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Cliente desconectado:", socket.id, "Razón:", reason);
  });
});

// 🚀 Escucha del servidor (IMPORTANTE en Railway)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});


