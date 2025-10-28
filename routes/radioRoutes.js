// routes/radioRoutes.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../controllers/authController");
const { uploadImage } = require("../middleware/upload");
const multer = require("multer");
const Radio = require("../models/Radio"); // ⬅️ AGREGAR ESTA LÍNEA
const User = require("../models/Usuario");   // ⬅️ AGREGAR ESTA LÍNEA
const {
  createRadio,
  getRadio,
  updateRadio,
  deleteRadio,
  toggleAutomate,
  generateGuestCode,
  joinAsGuest,
  getTracks,
  uploadTrack,
  deleteTrack,
  reorderTracks,
  getMessages,
  sendMessage,
  toggleLike,
  startStream,
  stopStream,
  startIcecastStream,
  streamAudio,
  streamImage,
  unregisterListener,
  registerListener
} = require("../controllers/radioController");

// ============================================================================
// CONFIGURACIÓN DE MULTER PARA AUDIO
// ============================================================================
const audioStorage = multer.memoryStorage();
const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de audio'));
    }
  }
});

// ============================================================================
// STREAMING (IMPORTANTE: ESTAS RUTAS DEBEN IR PRIMERO)
// ============================================================================
router.get("/stream-audio/:fileId", streamAudio);
router.get("/image/:fileId", streamImage);

// ============================================================================
// TRANSMISIÓN EN VIVO (DEBE IR ANTES DE LAS RUTAS GENÉRICAS)
// ============================================================================
router.post("/:radioId/live", authMiddleware, async (req, res) => {
  try {
    const { radioId } = req.params;
    const { isLive } = req.body;
    
    console.log(`[LIVE] 📡 Solicitud para radio ${radioId}, isLive: ${isLive}`);
    console.log(`[LIVE] 👤 Usuario: ${req.user._id}`);
    
    // Buscar la radio
    const radio = await Radio.findById(radioId);
    
    if (!radio) {
      console.log(`[LIVE] ❌ Radio no encontrada: ${radioId}`);
      return res.status(404).json({ error: 'Radio no encontrada' });
    }
    
    // Verificar que el usuario sea el dueño
    if (radio.idMusico.toString() !== req.user._id.toString()) {
      console.log(`[LIVE] ❌ Usuario no autorizado`);
      return res.status(403).json({ error: 'No tienes permiso para modificar esta radio' });
    }
    
    // Buscar el usuario completo para verificar isPremium
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.log(`[LIVE] ❌ Usuario no encontrado`);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Verificar que el usuario sea Premium
    if (!user.isPremium) {
      console.log(`[LIVE] ❌ Usuario no es Premium`);
      return res.status(403).json({ error: 'Necesitas ser Premium para transmitir' });
    }
    
    // Actualizar el estado de transmisión
    radio.isLive = isLive;
    await radio.save();
    
    console.log(`[LIVE] ✅ Radio "${radio.name}" - Estado: ${isLive ? 'EN VIVO 🔴' : 'OFF LINE ⚫'}`);
    
    res.json(radio);
  } catch (error) {
    console.error('[LIVE] ❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// RADIO CRUD
// ============================================================================
router.post("/", authMiddleware, uploadImage.single("logo"), createRadio);
router.get("/:radioId", getRadio);
router.put("/:radioId", authMiddleware, uploadImage.single("logo"), updateRadio);
router.delete("/:radioId", authMiddleware, deleteRadio);
// En routes/radioRoutes.js - AGREGAR:

router.post('/:radioId/listener/register', authMiddleware, registerListener);
router.post('/:radioId/listener/unregister', authMiddleware, unregisterListener);
// ============================================================================
// AUTOMATIZACIÓN
// ============================================================================
router.post("/:radioId/automate", authMiddleware, toggleAutomate);

// ============================================================================
// INVITADOS
// ============================================================================
router.post("/:radioId/guest-code", authMiddleware, generateGuestCode);
router.post("/:radioId/join-guest", authMiddleware, joinAsGuest);

// ============================================================================
// TRACKS
// ============================================================================
router.get("/:radioId/tracks", getTracks);
router.post("/:radioId/tracks", authMiddleware, uploadAudio.single("audio"), uploadTrack);
router.delete("/:radioId/tracks/:trackId", authMiddleware, deleteTrack);
router.put("/:radioId/tracks/reorder", authMiddleware, reorderTracks);

// ============================================================================
// CHAT
// ============================================================================
router.get("/:radioId/chat", getMessages);
router.post("/:radioId/chat", authMiddleware, sendMessage);

// ============================================================================
// LIKES
// ============================================================================
router.post("/:radioId/like", authMiddleware, toggleLike);

// ============================================================================
// STREAM CONTROL
// ============================================================================
router.post("/:radioId/stream/start", authMiddleware, startStream);
router.post("/:radioId/stream/stop", authMiddleware, stopStream);
router.post("/start-stream", startIcecastStream);

module.exports = router;