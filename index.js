require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const musicRoutes = require("./routes/musicRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const userRoutes = require("./routes/userRoutes");
const listaRoutes = require("./routes/listaRoutes");
const cdRoutes = require("./routes/cdRoutes");
const patrocinioRoutes = require("./routes/patrocinioRoutes");
const eventoRoutes = require("./routes/eventoRoutes");
const avisosRoutes = require("./routes/avisosRoutes");
const shareRoutes = require('./routes/shareRoutes');

const app = express();

app.use(express.json());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

const allowedOrigins = [
  "http://localhost:3000",
  "https://front-zoonito.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite requests sin origin (como desde Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Bloqueado por CORS:", origin);
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization"
  })
);


// Rutas
app.use("/api/eventos", eventoRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/share', shareRoutes);
app.use("/api/music", musicRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/user", userRoutes);
app.use("/api/listas", listaRoutes);
app.use("/api/cds", cdRoutes);
app.use("/api/eventos/patrocinioRoutes", patrocinioRoutes);
app.use("/api/avisoadmin", avisosRoutes);

app.get("/api/test", (req, res) => {
  res.send("¡Vamos bien!");
});
// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));



// require("dotenv").config();
// const express = require("express");
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

// const app = express();

// // ===== MIDDLEWARE =====
// app.use(express.json());
// app.use(bodyParser.json({ limit: "10mb" }));
// app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// // ===== CORS CONFIGURATION =====
// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:3001",
//   "https://front-zoonito.vercel.app", // ⭐ URL de producción
// ];

// const corsOptions = {
//   origin: function (origin, callback) {
//     // ⭐ Permitir requests sin origin (Postman, mobile apps, curl)
//     if (!origin) {
//       return callback(null, true);
//     }

//     // ⭐ Verificar si está en la lista de orígenes permitidos
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }

//     // ⭐ Permitir TODOS los previews y deployments de Vercel
//     // Acepta cualquier URL que contenga "front-zoonito" y termine en ".vercel.app"
//     if (origin.match(/^https:\/\/front-zoonito.*\.vercel\.app$/)) {
//       console.log("✅ Preview de Vercel permitido:", origin);
//       return callback(null, true);
//     }

//     // ⭐ Si no coincide con nada, bloquear
//     console.log("❌ Bloqueado por CORS:", origin);
//     callback(new Error("No permitido por CORS"));
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
//   allowedHeaders: [
//     "Content-Type",
//     "Authorization",
//     "X-Requested-With",
//     "Accept",
//     "Origin",
//   ],
//   exposedHeaders: ["Content-Range", "X-Content-Range"],
//   maxAge: 600, // Cache preflight por 10 minutos
// };

// app.use(cors(corsOptions));

// // ⭐ IMPORTANTE: Manejar preflight requests (OPTIONS)
// app.options("/api/*", cors(corsOptions));

// // ===== ROUTES =====
// app.use("/api/eventos", eventoRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/music", musicRoutes);
// app.use("/api/subscription", subscriptionRoutes);
// app.use("/api/user", userRoutes);
// app.use("/api/listas", listaRoutes);
// app.use("/api/cds", cdRoutes);
// app.use("/api/eventos/patrocinioRoutes", patrocinioRoutes);
// app.use("/api/avisoadmin", avisosRoutes);

// // ===== TEST ROUTE =====
// app.get("/api/test", (req, res) => {
//   res.json({ 
//     message: "¡Vamos bien!",
//     timestamp: new Date().toISOString(),
//     cors: "Configurado correctamente",
//   });
// });

// // ===== ERROR HANDLER PARA CORS =====
// app.use((err, req, res, next) => {
//   if (err.message === "No permitido por CORS") {
//     return res.status(403).json({
//       error: "CORS Error",
//       message: "Origen no permitido",
//       origin: req.headers.origin,
//     });
//   }
//   console.error("Error:", err);
//   res.status(500).json({ 
//     error: "Error interno del servidor",
//     message: process.env.NODE_ENV === "development" ? err.message : undefined,
//   });
// });

// // ===== MONGODB CONNECTION =====
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     serverSelectionTimeoutMS: 30000, // ⭐ 30 segundos timeout
//     socketTimeoutMS: 45000, // ⭐ 45 segundos para queries
//   })
//   .then(() => console.log("✅ MongoDB conectado"))
//   .catch((err) => {
//     console.error("❌ Error conectando a MongoDB:", err);
//     process.exit(1); // ⭐ Salir si no puede conectar
//   });

// // ===== START SERVER =====
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`✅ Servidor corriendo en puerto ${PORT}`);
//   console.log(`🌍 Ambiente: ${process.env.NODE_ENV || "development"}`);
//   console.log(`🔒 CORS configurado para:`);
//   console.log(`   - localhost:3000, localhost:3001`);
//   console.log(`   - https://front-zoonito.vercel.app`);
//   console.log(`   - Todos los previews de Vercel (front-zoonito-*.vercel.app)`);
// });

// module.exports = app;




