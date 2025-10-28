
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

// // Rutas
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
// app.use('/api/lyrics', lyricsRoutes); // ✅ Asegúrate que esta línea esté presente
// // Ruta de prueba
// app.get("/api/test", (req, res) => {
//   res.send("¡Vamos bien!");
// });

// // Conexión a MongoDB
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB conectado"))
//   .catch((err) => console.error(err));

// const PORT = process.env.PORT || 5000;
// // index.js - Archivo principal del servidor
// const multer = require('multer');
// const { GridFSBucket } = require('mongodb');



// // Middlewares
// // app.use(cors());
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // Configuración de Multer para archivos en memoria
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



// // Ruta para subir audio a GridFS
// app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));





// require("dotenv").config();
// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const path = require("path");

// // ============================================================================
// // IMPORTAR RUTAS
// // ============================================================================
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
// const radioRoutes = require("./routes/radioRoutes");

// // ============================================================================
// // MIDDLEWARES BÁSICOS
// // ============================================================================
// app.use(express.json());
// app.use(bodyParser.json({ limit: "10mb" }));
// app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// // ============================================================================
// // CONFIGURACIÓN DE CORS
// // ============================================================================
// const allowedOrigins = [
//   "http://localhost:3000",
//   "https://front-zoonito.vercel.app"
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
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

// // ============================================================================
// // CONEXIÓN A MONGODB
// // ============================================================================
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("✅ MongoDB conectado exitosamente");
//     console.log("✅ GridFS se inicializará automáticamente en radioController");
//   })
//   .catch((err) => {
//     console.error("❌ Error conectando a MongoDB:", err);
//     process.exit(1);
//   });

// // ============================================================================
// // MIDDLEWARE DE LOGGING (OPCIONAL)
// // ============================================================================
// app.use((req, res, next) => {
//   console.log(`📨 ${req.method} ${req.path}`);
//   next();
// });

// // ============================================================================
// // RUTAS DE LA APLICACIÓN
// // ============================================================================
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
// app.use("/api/radio", radioRoutes);

// // ============================================================================
// // RUTA DE PRUEBA
// // ============================================================================
// app.get("/api/test", (req, res) => {
//   res.json({ 
//     message: "¡Servidor funcionando correctamente!",
//     mongodb: mongoose.connection.readyState === 1 ? "✅ Conectado" : "❌ Desconectado",
//     timestamp: new Date().toISOString()
//   });
// });

// // ============================================================================
// // MANEJO DE RUTAS NO ENCONTRADAS
// // ============================================================================
// app.use((req, res) => {
//   res.status(404).json({ 
//     error: "Ruta no encontrada",
//     path: req.path,
//     method: req.method
//   });
// });

// // ============================================================================
// // MANEJO DE ERRORES GLOBAL
// // ============================================================================
// app.use((err, req, res, next) => {
//   console.error("❌ Error en la aplicación:", err);
  
//   // Error de Multer
//   if (err.name === 'MulterError') {
//     if (err.code === 'LIMIT_FILE_SIZE') {
//       return res.status(400).json({ 
//         error: "El archivo es demasiado grande. Máximo 50MB"
//       });
//     }
//     return res.status(400).json({ 
//       error: `Error al subir archivo: ${err.message}`
//     });
//   }
  
//   // Error personalizado
//   if (err.message === 'Solo se permiten archivos de audio') {
//     return res.status(400).json({ 
//       error: "Solo se permiten archivos de audio"
//     });
//   }
  
//   // Error de CORS
//   if (err.message === 'No permitido por CORS') {
//     return res.status(403).json({ 
//       error: "Acceso denegado por CORS"
//     });
//   }
  
//   // Error genérico
//   res.status(500).json({ 
//     error: "Error interno del servidor",
//     message: process.env.NODE_ENV === 'development' ? err.message : undefined
//   });
// });

// // ============================================================================
// // INICIAR SERVIDOR
// // ============================================================================
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log("═══════════════════════════════════════════════");
//   console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
//   console.log(`📡 Entorno: ${process.env.NODE_ENV || 'development'}`);
//   console.log(`🌐 URL local: http://localhost:${PORT}`);
//   console.log(`📁 API Base: http://localhost:${PORT}/api`);
//   console.log("═══════════════════════════════════════════════");
// });

// // ============================================================================
// // MANEJO DE CIERRE GRACEFUL
// // ============================================================================
// process.on('SIGTERM', async () => {
//   console.log('👋 SIGTERM recibido. Cerrando servidor...');
  
//   try {
//     await mongoose.connection.close();
//     console.log('✅ Conexión a MongoDB cerrada');
//     process.exit(0);
//   } catch (err) {
//     console.error('❌ Error al cerrar conexión:', err);
//     process.exit(1);
//   }
// });

// process.on('SIGINT', async () => {
//   console.log('👋 SIGINT recibido. Cerrando servidor...');
  
//   try {
//     await mongoose.connection.close();
//     console.log('✅ Conexión a MongoDB cerrada');
//     process.exit(0);
//   } catch (err) {
//     console.error('❌ Error al cerrar conexión:', err);
//     process.exit(1);
//   }
// });

// // ============================================================================
// // MANEJO DE ERRORES NO CAPTURADOS
// // ============================================================================
// process.on('unhandledRejection', (reason, promise) => {
//   console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
// });

// process.on('uncaughtException', (error) => {
//   console.error('❌ Uncaught Exception:', error);
//   process.exit(1);
// });

// module.exports = app;




require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

// ============================================================================
// IMPORTAR RUTAS
// ============================================================================
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
const cancionesRoutes = require('./routes/cancionesRoutes');
const lyricsRoutes = require('./routes/lyricsRoutes');
const radioRoutes = require("./routes/radioRoutes");
// const iceRoutes = require("./routes/iceRoutes"); // ⭐ NUEVA RUTA PARA ICECAST
const onlineRoutes = require("./routes/onlineRoutes");


// ============================================================================
// MIDDLEWARES BÁSICOS
// ============================================================================
app.use(express.json());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// ============================================================================
// CONFIGURACIÓN DE CORS
// ============================================================================
const allowedOrigins = [
  "http://localhost:3000",
  "https://front-zoonito.vercel.app"
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
    allowedHeaders: "Content-Type,Authorization"
  })
);

// ============================================================================
// CONEXIÓN A MONGODB
// ============================================================================
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB conectado exitosamente");
    console.log("✅ GridFS se inicializará automáticamente en radioController");
    console.log("✅ GridFS para Icecast streaming inicializado");
  })
  .catch((err) => {
    console.error("❌ Error conectando a MongoDB:", err);
    process.exit(1);
  });

// ============================================================================
// MIDDLEWARE DE LOGGING (OPCIONAL)
// ============================================================================
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// RUTAS DE LA APLICACIÓN
// ============================================================================
app.use("/api/music", musicRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/user", userRoutes);
app.use("/api/listas", listaRoutes);
app.use("/api/cds", cdRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/eventos", eventoRoutes);
app.use("/api/eventos/patrocinioRoutes", patrocinioRoutes);
app.use('/api/share', shareRoutes);
app.use("/api/avisoadmin", avisosRoutes);
app.use('/api/canciones', cancionesRoutes);
app.use('/api/lyrics', lyricsRoutes);
app.use("/api/radio", radioRoutes);
// app.use("/api/ice", iceRoutes);

app.use("/api/ice", onlineRoutes);


// ============================================================================
// RUTA DE PRUEBA
// ============================================================================
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "¡Servidor funcionando correctamente!",
    mongodb: mongoose.connection.readyState === 1 ? "✅ Conectado" : "❌ Desconectado",
    icecast: {
      host: process.env.ICECAST_HOST || 'localhost',
      port: process.env.ICECAST_PORT || 8000,
      url: process.env.ICECAST_URL || 'http://localhost:8000',
    },
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// MANEJO DE RUTAS NO ENCONTRADAS
// ============================================================================
app.use((req, res) => {
  res.status(404).json({ 
    error: "Ruta no encontrada",
    path: req.path,
    method: req.method
  });
});

// ============================================================================
// MANEJO DE ERRORES GLOBAL
// ============================================================================
app.use((err, req, res, next) => {
  console.error("❌ Error en la aplicación:", err);
  
  // Error de Multer
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: "El archivo es demasiado grande. Máximo 50MB"
      });
    }
    return res.status(400).json({ 
      error: `Error al subir archivo: ${err.message}`
    });
  }
  
  // Error personalizado
  if (err.message === 'Solo se permiten archivos de audio') {
    return res.status(400).json({ 
      error: "Solo se permiten archivos de audio"
    });
  }
  
  // Error de CORS
  if (err.message === 'No permitido por CORS') {
    return res.status(403).json({ 
      error: "Acceso denegado por CORS"
    });
  }
  
  // Error genérico
  res.status(500).json({ 
    error: "Error interno del servidor",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("═══════════════════════════════════════════════");
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 URL local: http://localhost:${PORT}`);
  console.log(`📁 API Base: http://localhost:${PORT}/api`);
  console.log(`🎙️ Icecast URL: ${process.env.ICECAST_URL || 'http://localhost:8000'}`);
  console.log("═══════════════════════════════════════════════");
});

// ============================================================================
// MANEJO DE CIERRE GRACEFUL
// ============================================================================
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM recibido. Cerrando servidor...');
  
  try {
    await mongoose.connection.close();
    console.log('✅ Conexión a MongoDB cerrada');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al cerrar conexión:', err);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('👋 SIGINT recibido. Cerrando servidor...');
  
  try {
    await mongoose.connection.close();
    console.log('✅ Conexión a MongoDB cerrada');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al cerrar conexión:', err);
    process.exit(1);
  }
});

// ============================================================================
// MANEJO DE ERRORES NO CAPTURADOS
// ============================================================================
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;










