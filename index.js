

// // ------------------------------------------------------------------



// require("dotenv").config();
// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const path = require("path");

// const authRoutes = require("./routes/authRoutes");
// const musicRoutes = require("./routes/musicRoutes");
// const subscriptionRoutes = require("./routes/subscriptionRoutes");
// const userRoutes = require("./routes/userRoutes");
// const listaRoutes = require("./routes/listaRoutes");
// const cdRoutes = require("./routes/cdRoutes");
// const patrocinioRoutes = require("./routes/patrocinioRoutes");
// const eventoRoutes = require("./routes/eventoRoutes");
// const avisosRoutes = require("./routes/avisosRoutes");
// const shareRoutes = require('./routes/shareRoutes');
// const cancionesRoutes = require('./routes/cancionesRoutes');
// const lyricsRoutes = require('./routes/lyricsRoutes');

// // ⭐ NUEVAS RUTAS PARA RADIO
// const radioRoutes = require("./routes/radioRoutes");
// const onlineRoutes = require("./routes/onlineRoutes");

// app.use(express.json());
// app.use(bodyParser.json({ limit: "10mb" }));
// app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// const allowedOrigins = [
//   "http://localhost:3000",
//   "https://front-zoonito.vercel.app"
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Permite requests sin origin (como desde Postman)
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         console.log("❌ Bloqueado por CORS:", origin);
//         callback(new Error("No permitido por CORS"));
//       }
//     },
//     credentials: true,
//     methods: "GET,POST,PUT,DELETE,OPTIONS",
//     allowedHeaders: "Content-Type,Authorization"
//   })
// );

// // Rutas existentes
// app.use("/api/music", musicRoutes);
// app.use("/api/subscription", subscriptionRoutes);
// app.use("/api/user", userRoutes);
// app.use("/api/listas", listaRoutes);
// app.use("/api/cds", cdRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/eventos", eventoRoutes);
// app.use("/api/eventos/patrocinioRoutes", patrocinioRoutes);
// app.use('/api/share', shareRoutes);
// app.use("/api/avisoadmin", avisosRoutes);
// app.use('/api/canciones', cancionesRoutes);
// app.use('/api/lyrics', lyricsRoutes);

// // ⭐ NUEVAS RUTAS DE RADIO
// app.use("/api/radio", radioRoutes);
// app.use("/api/ice", onlineRoutes);

// // Conexión a MongoDB
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB conectado"))
//   .catch((err) => console.error(err));

// const PORT = process.env.PORT || 5000;

// // Configuración de Multer para archivos en memoria
// const multer = require('multer');
// const { GridFSBucket } = require('mongodb');

// const storage = multer.memoryStorage();
// const upload = multer({ 
//   storage,
//   limits: { fileSize: 50 * 1024 * 1024 }, // 50MB máximo
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('audio/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Solo se permiten archivos de audio'));
//     }
//   }
// });

// // Ruta de prueba
// app.get("/api/test", (req, res) => {
//   res.send("¡Vamos bien!");
// });




// // Iniciar servidor
// const server = app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

// // Configurar Socket.IO
// const { Server } = require('socket.io');
// const io = new Server(server, {
//   cors: {
//     origin: [
//       'http://localhost:3000',
//       'https://front-zoonito.vercel.app'
//     ],
//     methods: ['GET', 'POST'],
//     credentials: true
//   },
//   path: '/api/socket',
//   transports: ['websocket', 'polling']
// });

// io.on('connection', (socket) => {
//   console.log('✅ Cliente conectado:', socket.id);

//   socket.on('join-radio', ({ sessionId }) => {
//     socket.join(`radio-${sessionId}`);
//     const room = io.sockets.adapter.rooms.get(`radio-${sessionId}`);
//     io.to(`radio-${sessionId}`).emit('listener-count', room ? room.size : 0);
//   });

//   socket.on('leave-radio', ({ sessionId }) => {
//     socket.leave(`radio-${sessionId}`);
//     const room = io.sockets.adapter.rooms.get(`radio-${sessionId}`);
//     io.to(`radio-${sessionId}`).emit('listener-count', room ? room.size : 0);
//   });

//   socket.on('live-audio-chunk', ({ sessionId, audioChunk }) => {
//     socket.to(`radio-${sessionId}`).emit('receive-live-audio', audioChunk);
//   });

//   socket.on('disconnect', () => {
//     console.log('❌ Cliente desconectado:', socket.id);
//   });
// });




require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
const multer = require("multer");

// ---------------------- RUTAS ----------------------
const authRoutes = require("./routes/authRoutes");
const musicRoutes = require("./routes/musicRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const userRoutes = require("./routes/userRoutes");
const listaRoutes = require("./routes/listasRoutes");
const cdRoutes = require("./routes/cdRoutes");
const patrocinioRoutes = require("./routes/patrocinioRoutes");
const eventoRoutes = require("./routes/eventoRoutes");
const avisosRoutes = require("./routes/avisosRoutes");
const shareRoutes = require("./routes/shareRoutes");
const cancionesRoutes = require("./routes/cancionesRoutes");
const lyricsRoutes = require("./routes/lyricsRoutes");

// ⭐ NUEVAS RUTAS PARA RADIO
const radioRoutes = require("./routes/radioRoutes");
const onlineRoutes = require("./routes/onlineRoutes");

// ---------------------- MIDDLEWARE ----------------------
app.use(express.json());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

const allowedOrigins = [
  "http://localhost:3000",
  "https://front-zoonito.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Bloqueado por CORS:", origin);
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// ---------------------- RUTAS ----------------------
app.use("/api/music", musicRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/user", userRoutes);
app.use("/api/listas", listaRoutes);
app.use("/api/cds", cdRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/eventos", eventoRoutes);
app.use("/api/eventos/patrocinioRoutes", patrocinioRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/avisoadmin", avisosRoutes);
app.use("/api/canciones", cancionesRoutes);
app.use("/api/lyrics", lyricsRoutes);

// ⭐ NUEVAS RUTAS DE RADIO
app.use("/api/radio", radioRoutes);
app.use("/api/ice", onlineRoutes);

// ---------------------- CONEXIÓN A MONGO ----------------------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error(err));

// ---------------------- MULTER ----------------------
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB máximo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos de audio"));
    }
  },
});

// ---------------------- RUTA DE PRUEBA ----------------------
app.get("/api/test", (req, res) => {
  res.send("¡Vamos bien!");
});

// ---------------------- SOCKET.IO ----------------------
const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: "/api/socket",
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log("✅ Cliente conectado:", socket.id);

  socket.on("join-radio", ({ sessionId }) => {
    socket.join(`radio-${sessionId}`);
    const room = io.sockets.adapter.rooms.get(`radio-${sessionId}`);
    io.to(`radio-${sessionId}`).emit(
      "listener-count",
      room ? room.size : 0
    );
  });

  socket.on("leave-radio", ({ sessionId }) => {
    socket.leave(`radio-${sessionId}`);
    const room = io.sockets.adapter.rooms.get(`radio-${sessionId}`);
    io.to(`radio-${sessionId}`).emit(
      "listener-count",
      room ? room.size : 0
    );
  });

  socket.on("live-audio-chunk", ({ sessionId, audioChunk }) => {
    socket.to(`radio-${sessionId}`).emit("receive-live-audio", audioChunk);
  });

  socket.on("disconnect", () => {
    console.log("❌ Cliente desconectado:", socket.id);
  });
});

// ---------------------- INICIAR SERVIDOR ----------------------
// Solo si no estamos en Vercel (serverless)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () =>
    console.log(`Servidor corriendo en puerto ${PORT}`)
  );
}

// Exportamos app para Vercel
module.exports = app;


