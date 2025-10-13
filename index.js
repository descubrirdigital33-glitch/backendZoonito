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
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:3000",
  "https://front-zoonito.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin || // Permite Postman y otros sin origin
        allowedOrigins.includes(origin) ||
        /^https:\/\/front-zoonito-[a-z0-9-]+\.vercel\.app$/.test(origin) // 🔥 Permite previews de Vercel
      ) {
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

