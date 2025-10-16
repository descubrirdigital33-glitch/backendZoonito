require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:3000",
  "https://front-zoonito.vercel.app"
];

app.use(cors({
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
  allowedHeaders: "Content-Type,Authorization"
}));

// 🔥 ESTOS MIDDLEWARES DEBEN IR ANTES DE LAS RUTAS
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware de debug (temporal)
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  console.log('📦 Body:', req.body);
  console.log('📦 Content-Type:', req.headers['content-type']);
  next();
});

// Rutas
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

app.use("/api/eventos", eventoRoutes);
app.use("/api/eventos/patrocinioRoutes", patrocinioRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/share', shareRoutes);
app.use("/api/music", musicRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/user", userRoutes);
app.use("/api/listas", listaRoutes);
app.use("/api/cds", cdRoutes);
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








