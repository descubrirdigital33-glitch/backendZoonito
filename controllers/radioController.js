// // controllers/radioController.js
// const Radio = require("../models/Radio");
// const Track = require("../models/track");
// const ChatMessage = require("../models/chatMessage");
// const User = require("../models/Usuario");
// const { GridFSBucket } = require("mongodb");
// const mongoose = require("mongoose");
// const crypto = require("crypto");
// const { startIcecastStreamFromMongo } = require("../services/icecastService");

// // Instancias de GridFS
// let gfsBucket;
// let gfsImageBucket;

// mongoose.connection.once("open", () => {
//   gfsBucket = new GridFSBucket(mongoose.connection.db, {
//     bucketName: "audioFiles",
//   });
  
//   gfsImageBucket = new GridFSBucket(mongoose.connection.db, {
//     bucketName: "images",
//   });
  
//   console.log("✅ GridFS buckets inicializados (audioFiles, images)");
// });

// // ============================================================================
// // TRACKS - CON DEBUG
// // ============================================================================

// exports.getTracks = async (req, res) => {
//   try {
//     const { radioId } = req.params;
    
//     console.log("=== GET TRACKS DEBUG ===");
//     console.log("1. RadioId recibido:", radioId);
//     console.log("2. Es ObjectId válido?", mongoose.Types.ObjectId.isValid(radioId));
    
//     // Verificar que la radio existe - buscar por _id o idMusico
//     let radio = await Radio.findById(radioId);
    
//     if (!radio) {
//       console.log("   Radio no encontrada por _id, buscando por idMusico...");
//       radio = await Radio.findOne({ idMusico: radioId });
//     }
    
//     console.log("3. Radio encontrada?", radio ? "SÍ" : "NO");
//     if (radio) {
//       console.log("   Radio._id:", radio._id);
//       console.log("   Radio.name:", radio.name);
//       console.log("   Radio.idMusico:", radio.idMusico);
//     }
    
//     if (!radio) {
//       console.log("❌ No se encontró ninguna radio");
//       return res.json([]);
//     }
    
//     // Buscar tracks usando el _id REAL de la radio
//     const tracks = await Track.find({ radioId: radio._id }).sort({ order: 1 }).lean();
//     console.log("4. Tracks encontrados para radio._id:", tracks.length);
    
//     if (tracks.length > 0) {
//       console.log("5. Primer track:", {
//         _id: tracks[0]._id,
//         title: tracks[0].title,
//         radioId: tracks[0].radioId,
//         fileId: tracks[0].fileId
//       });
//     }
    
//     // También buscar por string (por si acaso)
//     const tracksByString = await Track.find({ radioId: radioId.toString() }).lean();
//     console.log("6. Tracks por string:", tracksByString.length);
    
//     // Contar todos los tracks en la colección
//     const totalTracks = await Track.countDocuments();
//     console.log("7. Total tracks en DB:", totalTracks);
    
//     // Ver algunos tracks de ejemplo
//     if (totalTracks > 0) {
//       const sampleTracks = await Track.find().limit(3).lean();
//       console.log("8. Sample tracks:", sampleTracks.map(t => ({
//         radioId: t.radioId,
//         title: t.title
//       })));
//     }
    
//     res.json(tracks);
//   } catch (error) {
//     console.error("❌ Error obteniendo tracks:", error);
//     res.status(500).json({ message: "Error al obtener tracks", error: error.message });
//   }
// };

// exports.uploadTrack = async (req, res) => {
//   try {
//     console.log("\n=== UPLOAD TRACK DEBUG ===");
    
//     const userId = req.user?.id;
//     const { radioId } = req.params;
//     const { title, artist } = req.body;

//     console.log("1. User ID:", userId);
//     console.log("2. Radio ID:", radioId);
//     console.log("3. Title:", title);
//     console.log("4. Artist:", artist);
//     console.log("5. File received:", req.file ? "YES" : "NO");
//     if (req.file) {
//       console.log("   - Filename:", req.file.originalname);
//       console.log("   - Size:", req.file.size);
//       console.log("   - Mimetype:", req.file.mimetype);
//     }

//     // Verificar radio - buscar por _id o por idMusico
//     let radio = await Radio.findById(radioId);
    
//     if (!radio) {
//       console.log("   Radio no encontrada por _id, buscando por idMusico...");
//       radio = await Radio.findOne({ idMusico: radioId });
//     }
    
//     if (!radio) {
//       console.error("❌ Radio no encontrada ni por _id ni por idMusico");
//       return res.status(404).json({ message: "Radio no encontrada" });
//     }
    
//     console.log("6. Radio encontrada:", {
//       _id: radio._id,
//       name: radio.name,
//       idMusico: radio.idMusico
//     });

//     // Verificar autorización
//     if (radio.idMusico.toString() !== userId) {
//       console.error("❌ Usuario no autorizado");
//       return res.status(403).json({ message: "No autorizado" });
//     }
//     console.log("7. Usuario autorizado ✓");

//     // Verificar archivo
//     if (!req.file) {
//       console.error("❌ No se envió archivo");
//       return res.status(400).json({ message: "No se envió archivo de audio" });
//     }

//     // Verificar GridFS
//     if (!gfsBucket) {
//       console.error("❌ GridFS no inicializado");
//       return res.status(500).json({ message: "Sistema de archivos no disponible" });
//     }
//     console.log("8. GridFS inicializado ✓");

//     // Subir a GridFS
//     console.log("9. Iniciando subida a GridFS...");
//     const uploadStream = gfsBucket.openUploadStream(req.file.originalname, {
//       contentType: req.file.mimetype,
//       metadata: {
//         radioId,
//         title,
//         artist,
//         uploadedBy: userId,
//         uploadDate: new Date()
//       }
//     });

//     uploadStream.end(req.file.buffer);

//     await new Promise((resolve, reject) => {
//       uploadStream.on("finish", resolve);
//       uploadStream.on("error", reject);
//     });

//     const fileId = uploadStream.id;
//     console.log("10. Archivo subido a GridFS. FileId:", fileId);

//     const url = `/api/radio/stream-audio/${fileId}`;

//     // Obtener el último order - USAR radio._id
//     const lastTrack = await Track.findOne({ radioId: radio._id }).sort({ order: -1 });
//     const order = lastTrack ? lastTrack.order + 1 : 0;
//     console.log("11. Order calculado:", order, "(último:", lastTrack?.order, ")");

//     // Crear track - USAR EL _id REAL DE LA RADIO
//     const track = new Track({
//       radioId: radio._id, // ⭐ USAR radio._id, NO el parámetro radioId
//       title,
//       artist,
//       url,
//       fileId,
//       duration: 0,
//       order,
//     });

//     console.log("12. Track antes de guardar:", {
//       radioId: track.radioId,
//       radioIdType: typeof track.radioId,
//       title: track.title,
//       fileId: track.fileId
//     });

//     await track.save();
//     console.log("13. ✅ Track guardado en DB. ID:", track._id);

//     // Verificar que se guardó
//     const savedTrack = await Track.findById(track._id).lean();
//     console.log("14. Track recuperado de DB:", {
//       _id: savedTrack._id,
//       radioId: savedTrack.radioId,
//       title: savedTrack.title
//     });

//     // Contar tracks de esta radio - USAR radio._id
//     const trackCount = await Track.countDocuments({ radioId: radio._id });
//     console.log("15. Total tracks para esta radio:", trackCount);

//     res.status(201).json(track);
//   } catch (error) {
//     console.error("❌ Error en uploadTrack:", error);
//     res.status(500).json({ 
//       message: "Error al subir track",
//       error: error.message,
//       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// };

// exports.deleteTrack = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const { radioId, trackId } = req.params;

//     const radio = await Radio.findById(radioId);
//     if (!radio) {
//       return res.status(404).json({ message: "Radio no encontrada" });
//     }

//     if (radio.idMusico.toString() !== userId) {
//       return res.status(403).json({ message: "No autorizado" });
//     }

//     const track = await Track.findById(trackId);
//     if (!track) {
//       return res.status(404).json({ message: "Track no encontrado" });
//     }

//     // Eliminar archivo de GridFS
//     if (track.fileId) {
//       try {
//         await gfsBucket.delete(new mongoose.Types.ObjectId(track.fileId));
//         console.log("✅ Archivo eliminado de GridFS");
//       } catch (error) {
//         console.error("Error eliminando de GridFS:", error);
//       }
//     }

//     await Track.findByIdAndDelete(trackId);
//     console.log("✅ Track eliminado de DB");
    
//     res.json({ message: "Track eliminado exitosamente" });
//   } catch (error) {
//     console.error("Error eliminando track:", error);
//     res.status(500).json({ message: "Error al eliminar track" });
//   }
// };

// exports.reorderTracks = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const { radioId } = req.params;
//     const { trackIds } = req.body;

//     const radio = await Radio.findById(radioId);
//     if (!radio) {
//       return res.status(404).json({ message: "Radio no encontrada" });
//     }

//     if (radio.idMusico.toString() !== userId) {
//       return res.status(403).json({ message: "No autorizado" });
//     }

//     for (let i = 0; i < trackIds.length; i++) {
//       await Track.findByIdAndUpdate(trackIds[i], { order: i });
//     }

//     const tracks = await Track.find({ radioId }).sort({ order: 1 });
//     res.json(tracks);
//   } catch (error) {
//     console.error("Error reordenando tracks:", error);
//     res.status(500).json({ message: "Error al reordenar tracks" });
//   }
// };

// // ============================================================================
// // RESTO DE FUNCIONES (SIN CAMBIOS)
// // ============================================================================

// exports.createRadio = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) return res.status(401).json({ message: "No autenticado" });

//     const user = await User.findById(userId);
//     if (!user.isPremium) {
//       return res.status(403).json({ message: "Se requiere suscripción Premium" });
//     }

//     const { name, description } = req.body;
//     const mountPoint = `/radio_${crypto.randomBytes(4).toString("hex")}`;
//     const streamUrl = `${process.env.ICECAST_URL}${mountPoint}`;

//     const radio = new Radio({
//       idMusico: userId,
//       name,
//       description,
//       icecastMount: mountPoint,
//       streamUrl,
//     });

//     if (req.file) {
//       const uploadStream = gfsImageBucket.openUploadStream(req.file.originalname, {
//         contentType: req.file.mimetype,
//         metadata: {
//           uploadedBy: userId,
//           uploadedAt: new Date(),
//           type: 'radio-logo'
//         }
//       });

//       uploadStream.end(req.file.buffer);

//       await new Promise((resolve, reject) => {
//         uploadStream.on("finish", resolve);
//         uploadStream.on("error", reject);
//       });

//       const fileId = uploadStream.id;
//       radio.logo = `/api/radio/image/${fileId}`;
//       radio.logoFileId = fileId;
//     }

//     await radio.save();
//     res.status(201).json(radio);
//   } catch (error) {
//     console.error("Error creando radio:", error);
//     res.status(500).json({ message: "Error al crear radio" });
//   }
// };

// // En radioController.js
// // Función auxiliar para buscar radio
// const findRadioByIdOrMusician = async (id) => {
//   // Primero intentar como ObjectId válido
//   if (mongoose.Types.ObjectId.isValid(id)) {
//     let radio = await Radio.findById(id);
//     if (radio) return radio;
//   }
  
//   // Si no se encuentra, buscar por idMusico
//   return await Radio.findOne({ idMusico: id });
// };

// exports.getRadio = async (req, res) => {
//   try {
//     const { radioId } = req.params;
    
//     console.log(`🔍 Buscando radio con parámetro: ${radioId}`);
    
//     const radio = await findRadioByIdOrMusician(radioId);
    
//     if (!radio) {
//       console.log(`❌ Radio no encontrada con: ${radioId}`);
//       return res.status(404).json({ error: 'Radio no encontrada' });
//     }
    
//     console.log(`✅ Radio encontrada: ${radio._id} (${radio.name})`);
//     res.json(radio);
//   } catch (error) {
//     console.error('Error obteniendo radio:', error);
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.toggleLive = async (req, res) => {
//   try {
//     const { radioId } = req.params;
//     const { isLive } = req.body;
    
//     console.log(`[LIVE] 📡 Buscando radio con: ${radioId}`);
//     console.log(`[LIVE] Usuario autenticado: ${req.user?.id}`);
    
//     const radio = await findRadioByIdOrMusician(radioId);
    
//     if (!radio) {
//       console.log(`[LIVE] ❌ Radio no encontrada: ${radioId}`);
//       return res.status(404).json({ error: 'Radio no encontrada' });
//     }
    
//     console.log(`[LIVE] ✅ Radio encontrada: ${radio._id} (${radio.name})`);
//     console.log(`[LIVE] Dueño de la radio: ${radio.idMusico}`);
    
//     // Verificar que el usuario sea el dueño
//     if (radio.idMusico.toString() !== req.user.id.toString()) {
//       console.log(`[LIVE] ❌ Usuario no autorizado`);
//       return res.status(403).json({ error: 'No autorizado para modificar esta radio' });
//     }
    
//     radio.isLive = isLive;
//     await radio.save();
    
//     console.log(`[LIVE] ✅ Estado actualizado: isLive=${radio.isLive}`);
    
//     res.json(radio);
//   } catch (error) {
//     console.error('[LIVE] Error:', error);
//     res.status(500).json({ error: error.message });
//   }
// };



// exports.updateRadio = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const { radioId } = req.params;
//     const { name, description } = req.body;

//     const radio = await findRadioByIdOrMusician(radioId);

//     if (!radio) {
//       return res.status(404).json({ message: "Radio no encontrada" });
//     }

//     if (radio.idMusico.toString() !== userId) {
//       return res.status(403).json({ message: "No autorizado" });
//     }

//     if (name && name.trim()) radio.name = name.trim();
//     if (description !== undefined) radio.description = description.trim();

//     if (req.file) {
//       if (radio.logoFileId) {
//         try {
//           await gfsImageBucket.delete(new mongoose.Types.ObjectId(radio.logoFileId));
//         } catch (error) {
//           console.error('Error eliminando logo anterior:', error);
//         }
//       }

//       const uploadStream = gfsImageBucket.openUploadStream(req.file.originalname, {
//         contentType: req.file.mimetype,
//         metadata: {
//           uploadedBy: userId,
//           uploadedAt: new Date(),
//           type: 'radio-logo',
//           radioId: radio._id
//         }
//       });

//       uploadStream.end(req.file.buffer);

//       await new Promise((resolve, reject) => {
//         uploadStream.on("finish", resolve);
//         uploadStream.on("error", reject);
//       });

//       const fileId = uploadStream.id;
//       radio.logo = `/api/radio/image/${fileId}`;
//       radio.logoFileId = fileId;
//     }

//     await radio.save();
//     const radioCompleta = await Radio.findById(radio._id).populate('idMusico', 'name avatar isPremium email');
//     res.json(radioCompleta);
//   } catch (error) {
//     console.error("Error actualizando radio:", error);
//     res.status(500).json({ message: "Error al actualizar radio", error: error.message });
//   }
// };

// exports.deleteRadio = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const { radioId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(radioId)) {
//       return res.status(400).json({ message: "ID inválido" });
//     }

//     let radio = await Radio.findById(radioId);
//     if (!radio) {
//       radio = await Radio.findOne({ idMusico: radioId });
//     }

//     if (!radio) {
//       return res.status(404).json({ message: "Radio no encontrada" });
//     }

//     if (radio.idMusico.toString() !== userId) {
//       return res.status(403).json({ message: "No autorizado" });
//     }

//     if (radio.logoFileId) {
//       try {
//         await gfsImageBucket.delete(new mongoose.Types.ObjectId(radio.logoFileId));
//       } catch (error) {
//         console.error('Error eliminando logo:', error);
//       }
//     }

//     const tracks = await Track.find({ radioId: radio._id });
//     for (const track of tracks) {
//       if (track.fileId) {
//         try {
//           await gfsBucket.delete(new mongoose.Types.ObjectId(track.fileId));
//         } catch (error) {
//           console.error('Error eliminando track:', error);
//         }
//       }
//     }
//     await Track.deleteMany({ radioId: radio._id });
//     await ChatMessage.deleteMany({ radioId: radio._id });
//     await Radio.findByIdAndDelete(radio._id);

//     res.json({ message: "Radio eliminada exitosamente" });
//   } catch (error) {
//     console.error("Error eliminando radio:", error);
//     res.status(500).json({ message: "Error al eliminar radio" });
//   }
// };

// exports.toggleAutomate = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const { radioId } = req.params;

//     const radio = await Radio.findById(radioId);
//     if (!radio) {
//       return res.status(404).json({ message: "Radio no encontrada" });
//     }

//     if (radio.idMusico.toString() !== userId) {
//       return res.status(403).json({ message: "No autorizado" });
//     }

//     radio.isAutomated = !radio.isAutomated;

//     if (radio.isAutomated) {
//       const tracks = await Track.find({ radioId }).sort({ order: 1 });
//       radio.autoPlaylist = tracks.map((t) => t._id);
//       radio.isLive = true;
//     } else {
//       radio.autoPlaylist = [];
//       radio.isLive = false;
//     }

//     await radio.save();
//     res.json(radio);
//   } catch (error) {
//     console.error("Error en automatización:", error);
//     res.status(500).json({ message: "Error al automatizar radio" });
//   }
// };

// exports.generateGuestCode = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const { radioId } = req.params;

//     const radio = await Radio.findById(radioId);
//     if (!radio) {
//       return res.status(404).json({ message: "Radio no encontrada" });
//     }

//     if (radio.idMusico.toString() !== userId) {
//       return res.status(403).json({ message: "No autorizado" });
//     }

//     const code = crypto.randomBytes(3).toString("hex").toUpperCase();
//     radio.guestCode = code;
//     radio.allowGuests = true;

//     await radio.save();
//     res.json(radio);
//   } catch (error) {
//     console.error("Error generando código:", error);
//     res.status(500).json({ message: "Error al generar código" });
//   }
// };

// exports.joinAsGuest = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const { radioId } = req.params;
//     const { code } = req.body;

//     const radio = await Radio.findById(radioId);
//     if (!radio) {
//       return res.status(404).json({ message: "Radio no encontrada" });
//     }

//     if (!radio.allowGuests) {
//       return res.status(403).json({ message: "Radio no permite invitados" });
//     }

//     if (radio.guestCode !== code) {
//       return res.status(401).json({ message: "Código inválido" });
//     }

//     const alreadyGuest = radio.activeGuests.find((g) => g.userId.toString() === userId);
//     if (alreadyGuest) {
//       return res.json({ message: "Ya estás conectado como invitado" });
//     }

//     radio.activeGuests.push({
//       userId,
//       connectedAt: new Date(),
//       isMuted: false,
//     });

//     await radio.save();
//     res.json({ message: "Conectado como invitado exitosamente" });
//   } catch (error) {
//     console.error("Error conectando invitado:", error);
//     res.status(500).json({ message: "Error al conectar como invitado" });
//   }
// };


// // En radioController.js - REEMPLAZAR estas funciones:

// // Obtener mensajes - buscar por _id REAL de la radio
// // En radioController.js - REEMPLAZAR getMessages y sendMessage:

// exports.getMessages = async (req, res) => {
//   try {
//     const { radioId } = req.params;
//     const limit = parseInt(req.query.limit) || 50;

//     console.log("🔍 [CHAT] Buscando mensajes para radioId:", radioId);

//     // Buscar la radio primero (por _id o idMusico)
//     const radio = await findRadioByIdOrMusician(radioId);
    
//     if (!radio) {
//       console.log("❌ [CHAT] Radio no encontrada");
//       return res.status(404).json({ message: "Radio no encontrada" });
//     }

//     console.log("✅ [CHAT] Radio encontrada:", radio._id);
//     console.log("   [CHAT] idMusico:", radio.idMusico);

//     // Buscar mensajes tanto por radio._id como por idMusico
//     const messages = await ChatMessage.find({
//       $or: [
//         { radioId: radio._id },
//         { radioId: radio.idMusico }
//       ]
//     })
//       .sort({ createdAt: -1 })
//       .limit(limit)
//       .lean();

//     console.log("📨 [CHAT] Mensajes encontrados:", messages.length);

//     res.json(messages.reverse());
//   } catch (error) {
//     console.error("❌ [CHAT] Error obteniendo mensajes:", error);
//     res.status(500).json({ message: "Error al obtener mensajes" });
//   }
// };

// exports.sendMessage = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const { radioId } = req.params;
//     const { text } = req.body;

//     console.log("📤 [CHAT] Enviando mensaje:");
//     console.log("   userId:", userId);
//     console.log("   radioId param:", radioId);
//     console.log("   text:", text);

//     if (!text || text.trim().length === 0) {
//       return res.status(400).json({ message: "Mensaje vacío" });
//     }

//     // Buscar la radio
//     const radio = await findRadioByIdOrMusician(radioId);
    
//     if (!radio) {
//       console.log("❌ [CHAT] Radio no encontrada");
//       return res.status(404).json({ message: "Radio no encontrada" });
//     }

//     console.log("✅ [CHAT] Radio encontrada:", radio._id);
//     console.log("   [CHAT] idMusico:", radio.idMusico);

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "Usuario no encontrado" });
//     }

//     // GUARDAR CON EL idMusico para que sea consistente
//     const message = new ChatMessage({
//       radioId: radio.idMusico, // ⭐ Usar idMusico para consistencia
//       userId,
//       userName: user.name,
//       userAvatar: user.avatar,
//       text: text.trim(),
//     });

//     await message.save();
    
//     console.log("✅ [CHAT] Mensaje guardado:", message._id);
//     console.log("   [CHAT] radioId guardado:", message.radioId);

//     res.status(201).json(message);
//   } catch (error) {
//     console.error("❌ [CHAT] Error enviando mensaje:", error);
//     res.status(500).json({ message: "Error al enviar mensaje" });
//   }
// };

// // NUEVA FUNCIÓN: Registrar oyente
// exports.registerListener = async (req, res) => {
//   try {
//     const { radioId } = req.params;
//     const userId = req.user?.id || `guest_${Date.now()}`;

//     const radio = await findRadioByIdOrMusician(radioId);
//     if (!radio) {
//       return res.status(404).json({ message: "Radio no encontrada" });
//     }

//     // Agregar a oyentes activos (expira en 30 segundos)
//     const listenerKey = `listener:${radio._id}:${userId}`;
    
//     // Aquí deberías usar Redis en producción, pero por simplicidad:
//     if (!radio.activeListeners) radio.activeListeners = [];
    
//     const existingIndex = radio.activeListeners.findIndex(
//       l => l.userId === userId
//     );
    
//     if (existingIndex !== -1) {
//       radio.activeListeners[existingIndex].lastPing = new Date();
//     } else {
//       radio.activeListeners.push({
//         userId,
//         lastPing: new Date()
//       });
//     }

//     // Limpiar oyentes inactivos (más de 30 segundos sin ping)
//     const thirtySecondsAgo = new Date(Date.now() - 30000);
//     radio.activeListeners = radio.activeListeners.filter(
//       l => new Date(l.lastPing) > thirtySecondsAgo
//     );

//     radio.listeners = radio.activeListeners.length;
//     await radio.save();

//     res.json({ listeners: radio.listeners });
//   } catch (error) {
//     console.error("Error registrando oyente:", error);
//     res.status(500).json({ message: "Error al registrar oyente" });
//   }
// };

// // NUEVA FUNCIÓN: Desregistrar oyente
// exports.unregisterListener = async (req, res) => {
//   try {
//     const { radioId } = req.params;
//     const userId = req.user?.id || req.body.guestId;

//     const radio = await findRadioByIdOrMusician(radioId);
//     if (!radio) {
//       return res.status(404).json({ message: "Radio no encontrada" });
//     }

//     if (!radio.activeListeners) radio.activeListeners = [];
    
//     radio.activeListeners = radio.activeListeners.filter(
//       l => l.userId !== userId
//     );

//     radio.listeners = radio.activeListeners.length;
//     await radio.save();

//     res.json({ listeners: radio.listeners });
//   } catch (error) {
//     console.error("Error desregistrando oyente:", error);
//     res.status(500).json({ message: "Error al desregistrar oyente" });
//   }
// };


// exports.toggleLike = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const { radioId } = req.params;

//     const radio = await Radio.findById(radioId);
//     if (!radio) {
//       return res.status(404).json({ message: "Radio no encontrada" });
//     }

//     const userObjectId = new mongoose.Types.ObjectId(userId);
//     const hasLiked = radio.likedBy.some((id) => id.equals(userObjectId));

//     if (hasLiked) {
//       radio.likedBy = radio.likedBy.filter((id) => !id.equals(userObjectId));
//       radio.likes = Math.max(0, radio.likes - 1);
//     } else {
//       radio.likedBy.push(userObjectId);
//       radio.likes += 1;
//     }

//     await radio.save();
//     res.json({ likes: radio.likes, liked: !hasLiked });
//   } catch (error) {
//     console.error("Error toggle like:", error);
//     res.status(500).json({ message: "Error al dar like" });
//   }
// };

// exports.startStream = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const { radioId } = req.params;

//     const radio = await Radio.findById(radioId);
//     if (!radio) {
//       return res.status(404).json({ message: "Radio no encontrada" });
//     }

//     if (radio.idMusico.toString() !== userId) {
//       return res.status(403).json({ message: "No autorizado" });
//     }

//     radio.isLive = true;
//     await radio.save();

//     res.json({ message: "Stream iniciado", radio });
//   } catch (error) {
//     console.error("Error iniciando stream:", error);
//     res.status(500).json({ message: "Error al iniciar stream" });
//   }
// };

// exports.stopStream = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const { radioId } = req.params;

//     const radio = await Radio.findById(radioId);
//     if (!radio) {
//       return res.status(404).json({ message: "Radio no encontrada" });
//     }

//     if (radio.idMusico.toString() !== userId) {
//       return res.status(403).json({ message: "No autorizado" });
//     }

//     radio.isLive = false;
//     radio.isAutomated = false;
//     await radio.save();

//     res.json({ message: "Stream detenido", radio });
//   } catch (error) {
//     console.error("Error deteniendo stream:", error);
//     res.status(500).json({ message: "Error al detener stream" });
//   }
// };

// exports.streamAudio = async (req, res) => {
//   try {
//     const { fileId } = req.params;
//     const objectId = new mongoose.Types.ObjectId(fileId);
//     const downloadStream = gfsBucket.openDownloadStream(objectId);

//     downloadStream.on("error", (error) => {
//       console.error("Error streaming audio:", error);
//       res.status(404).json({ message: "Archivo no encontrado" });
//     });

//     res.set("Content-Type", "audio/mpeg");
//     downloadStream.pipe(res);
//   } catch (error) {
//     console.error("Error en stream de audio:", error);
//     res.status(500).json({ message: "Error al reproducir audio" });
//   }
// };

// exports.streamImage = async (req, res) => {
//   try {
//     const { fileId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(fileId)) {
//       return res.status(400).json({ message: "ID de archivo inválido" });
//     }

//     const objectId = new mongoose.Types.ObjectId(fileId);
//     const downloadStream = gfsImageBucket.openDownloadStream(objectId);

//     downloadStream.on("error", (error) => {
//       console.error("Error streaming imagen:", error);
//       res.status(404).json({ message: "Imagen no encontrada" });
//     });

//     downloadStream.on("file", (file) => {
//       res.set("Content-Type", file.contentType || "image/jpeg");
//       res.set("Cache-Control", "public, max-age=31536000");
//     });

//     downloadStream.pipe(res);
//   } catch (error) {
//     console.error("Error en stream de imagen:", error);
//     res.status(500).json({ message: "Error al cargar imagen" });
//   }
// };

// exports.startIcecastStream = async (req, res) => {
//   try {
//     const { fileId } = req.body;
//     if (!fileId) return res.status(400).json({ message: "Falta fileId" });

//     await startIcecastStreamFromMongo(fileId);

//     res.json({ message: "🎧 Transmisión iniciada correctamente" });
//   } catch (error) {
//     console.error("Error al iniciar transmisión:", error);
//     res.status(500).json({ message: "Error al iniciar transmisión" });
//   }

// };








// controllers/onlineController.js
const StreamingSession = require('../models/onlineModels');
const Track = require('../models/track');
const mongoose = require('mongoose');

class RadioStreamController {
  constructor() {
    this.activeSessions = new Map();
    this.gfs = null;
  }

  initGridFS() {
    if (!this.gfs && mongoose.connection.db) {
      this.gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'audio'
      });
    }
    return this.gfs;
  }

  /**
   * Inicia una sesión de streaming
   * POST /api/ice/start
   */
  async startStreaming(req, res) {
    try {
      const { trackId, playlistId, userId, radioId } = req.body;
      
      let tracks = [];
      if (trackId) {
        const track = await Track.findById(trackId);
        if (!track) return res.status(404).json({ error: 'Track no encontrado' });
        tracks = [track];
      } else if (playlistId) {
        tracks = await Track.find({ playlistId }).sort({ order: 1 });
      } else if (radioId) {
        tracks = await Track.find({ radioId }).sort({ order: 1 });
      }

      if (tracks.length === 0) {
        return res.status(400).json({ error: 'No hay tracks disponibles' });
      }

      const session = new StreamingSession({
        userId: userId || new mongoose.Types.ObjectId(),
        trackQueue: tracks.map(t => t._id),
        currentTrackIndex: 0,
        isActive: true,
        listeners: 1,
        startedAt: new Date()
      });
      
      await session.save();

      this.activeSessions.set(session._id.toString(), {
        session,
        tracks,
        currentIndex: 0
      });

      res.json({
        success: true,
        sessionId: session._id,
        currentTrack: tracks[0],
        totalTracks: tracks.length,
        streamUrl: `/api/ice/stream/${tracks[0]._id}`
      });

    } catch (error) {
      console.error('Error iniciando streaming:', error);
      res.status(500).json({ error: 'Error al iniciar streaming', details: error.message });
    }
  }

  /**
   * Detiene una sesión de streaming
   * POST /api/ice/stop
   */
  async stopStreaming(req, res) {
    try {
      const { sessionId } = req.body;

      await StreamingSession.findByIdAndUpdate(sessionId, {
        isActive: false,
        endedAt: new Date()
      });

      this.activeSessions.delete(sessionId);

      res.json({ success: true, message: 'Streaming detenido' });

    } catch (error) {
      console.error('Error deteniendo streaming:', error);
      res.status(500).json({ error: 'Error al detener streaming' });
    }
  }

  /**
   * Obtiene el estado actual del streaming
   * GET /api/ice/status/:sessionId
   */
  async getStreamingStatus(req, res) {
    try {
      const { sessionId } = req.params;
      const session = await StreamingSession.findById(sessionId).populate('trackQueue');
      
      if (!session) {
        return res.status(404).json({ error: 'Sesión no encontrada' });
      }

      const currentTrack = session.trackQueue[session.currentTrackIndex];

      res.json({
        isActive: session.isActive,
        currentTrack,
        currentIndex: session.currentTrackIndex,
        totalTracks: session.trackQueue.length,
        listeners: session.listeners,
        startedAt: session.startedAt,
        streamUrl: currentTrack ? `/api/ice/stream/${currentTrack._id}` : null
      });

    } catch (error) {
      console.error('Error obteniendo estado:', error);
      res.status(500).json({ error: 'Error al obtener estado' });
    }
  }

  /**
   * Stream de audio usando GridFS con soporte para range requests
   * GET /api/ice/stream/:trackId
   */
  async streamTrack(req, res) {
    try {
      const { trackId } = req.params;
      
      // Validar ObjectId
      if (!mongoose.Types.ObjectId.isValid(trackId)) {
        return res.status(400).json({ error: 'ID de track inválido' });
      }

      const track = await Track.findById(trackId);

      if (!track || !track.fileId) {
        return res.status(404).json({ error: 'Audio no encontrado' });
      }

      const gfs = this.initGridFS();
      if (!gfs) {
        return res.status(500).json({ error: 'GridFS no inicializado' });
      }

      // Buscar el archivo en GridFS
      const files = await gfs.find({ _id: track.fileId }).toArray();
      
      if (!files || files.length === 0) {
        return res.status(404).json({ error: 'Archivo de audio no encontrado en GridFS' });
      }

      const file = files[0];

      // Headers para streaming de audio
      res.setHeader('Content-Type', file.contentType || 'audio/mpeg');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Range');
      res.setHeader('Cache-Control', 'no-cache');

      // Manejar range requests para seek/pausa
      const range = req.headers.range;
      
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : file.length - 1;
        const chunksize = (end - start) + 1;

        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${file.length}`);
        res.setHeader('Content-Length', chunksize);

        // Stream con rango específico
        const downloadStream = gfs.openDownloadStream(track.fileId, {
          start,
          end: end + 1
        });

        downloadStream.on('error', (error) => {
          console.error('Error en stream con rango:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Error al hacer streaming' });
          }
        });

        downloadStream.pipe(res);

      } else {
        // Stream completo
        res.setHeader('Content-Length', file.length);
        
        const downloadStream = gfs.openDownloadStream(track.fileId);

        downloadStream.on('error', (error) => {
          console.error('Error en stream completo:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Error al hacer streaming' });
          }
        });

        downloadStream.on('end', () => {
          console.log('✅ Stream completado para track:', trackId);
        });

        downloadStream.pipe(res);
      }

    } catch (error) {
      console.error('Error streaming track:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error al hacer streaming', details: error.message });
      }
    }
  }

  /**
   * Siguiente track en la cola
   * POST /api/ice/next
   */
  async nextTrack(req, res) {
    try {
      const { sessionId } = req.body;
      const sessionData = this.activeSessions.get(sessionId);
      
      if (!sessionData) {
        return res.status(404).json({ error: 'Sesión no encontrada' });
      }

      const nextIndex = sessionData.currentIndex + 1;
      sessionData.currentIndex = nextIndex >= sessionData.tracks.length ? 0 : nextIndex;

      await StreamingSession.findByIdAndUpdate(sessionId, { 
        currentTrackIndex: sessionData.currentIndex 
      });

      const currentTrack = sessionData.tracks[sessionData.currentIndex];

      res.json({
        success: true,
        currentTrack,
        currentIndex: sessionData.currentIndex,
        streamUrl: `/api/ice/stream/${currentTrack._id}`
      });

    } catch (error) {
      console.error('Error cambiando track:', error);
      res.status(500).json({ error: 'Error al cambiar track' });
    }
  }
}

module.exports = new RadioStreamController();
