// const Music = require("../models/Music");
// const Usuario = require("../models/Usuario");
// const cloudinary = require("../config/cloudinary");
// const mongoose = require("mongoose");

// // ===== GET ALL MUSIC =====
// exports.getAllMusic = async (req, res) => {
//   try {
//     const userId = req.query.userId;
    
//     console.log("🔍 Buscando música para userId:", userId);
    
//     let filter = {};
    
//     if (userId) {
//       if (mongoose.Types.ObjectId.isValid(userId)) {
//         filter.idMusico = new mongoose.Types.ObjectId(userId);
//       } else {
//         filter.idMusico = userId;
//       }
//     }
    
//     console.log("🔍 Filtro aplicado:", filter);
    
//     const musics = await Music.find(filter).sort({ createdAt: -1 });
    
//     console.log("✅ Canciones encontradas:", musics.length);
    
//     res.json(musics);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: err.message, musics: [] });
//   }
// };

// // ===== ADD MUSIC =====
// exports.addMusic = async (req, res) => {
//   try {
//     console.log("📦 Body recibido:", req.body);
    
//     const { title, artist, album, genre, soloist, avance, audioUrl, coverUrl } = req.body;
    
//     // Validaciones básicas
//     if (!title || !artist || !audioUrl) {
//       return res.status(400).json({ 
//         error: "title, artist y audioUrl son requeridos",
//         received: { title, artist, audioUrl }
//       });
//     }

//     // Extraer userId (desde body, user autenticado, o headers)
//     const userId = req.body.userId || req.user?._id || req.user?.id;
//     console.log("👤 userId extraído:", userId);

//     if (!userId) {
//       return res.status(400).json({ error: "userId es requerido" });
//     }

//     // Buscar avatar del usuario
//     let avatarArtist;
//     const usuario = await Usuario.findById(userId).select("avatar");
//     if (usuario) {
//       avatarArtist = usuario.avatar;
//       console.log("🖼️ Avatar del artista:", avatarArtist);
//     } else {
//       console.warn("⚠️ Usuario no encontrado, no se pudo asignar avatar");
//     }

//     // Crear nueva música
//     const newMusic = new Music({
//       title,
//       artist,
//       album: album || undefined,
//       genre: genre || undefined,
//       soloist: soloist === "true" || soloist === true,
//       avance: avance === "true" || avance === true,
//       audioUrl,
//       coverUrl: coverUrl || undefined,
//       idMusico: userId,
//       avatarArtist: avatarArtist || null,
//     });

//     console.log("💾 Guardando música:", newMusic);
//     await newMusic.save();
    
//     console.log("✅ Música guardada exitosamente con ID:", newMusic._id);
//     res.status(201).json(newMusic);
//   } catch (error) {
//     console.error("❌ Error completo:", error);
//     console.error("❌ Stack:", error.stack);
//     res.status(500).json({ 
//       error: "Error subiendo música",
//       details: error.message
//     });
//   }
// };

// // ===== UPDATE MUSIC =====
// exports.updateMusic = async (req, res) => {
//   try {
//     console.log("🔄 Actualizando música ID:", req.params.id);
//     console.log("📦 Datos recibidos (body):", req.body);

//     const { title, artist, album, genre, soloist, avance, audioUrl, coverUrl } = req.body;
//     const id = req.params.id;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "ID inválido" });
//     }

//     const music = await Music.findById(id);
//     if (!music) return res.status(404).json({ message: "Música no encontrada" });

//     if (title !== undefined) music.title = title;
//     if (artist !== undefined) music.artist = artist;
//     if (album !== undefined) music.album = album;
//     if (genre !== undefined) music.genre = genre;
//     if (soloist !== undefined) music.soloist = soloist === "true" || soloist === true;
//     if (avance !== undefined) music.avance = avance === "true" || avance === true;
//     if (audioUrl !== undefined) music.audioUrl = audioUrl;

//     // ✅ Guardamos directamente la URL subida a Cloudinary
//     if (coverUrl) {
//       music.coverUrl = coverUrl;
//     }

//     await music.save();
//     console.log("✅ Música actualizada exitosamente");
//     res.json(music);

//   } catch (err) {
//     console.error("❌ Error actualizando música:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // ===== DELETE MUSIC =====
// exports.deleteMusic = async (req, res) => {
//   try {
//     const music = await Music.findById(req.params.id);

//     if (!music) {
//       return res.status(404).json({ message: "Música no encontrada" });
//     }

//     // Eliminar archivos de Cloudinary si existen
//     if (music.audioPublicId) {
//       await cloudinary.uploader.destroy(music.audioPublicId, {
//         resource_type: "video",
//       });
//     }
//     if (music.coverPublicId) {
//       await cloudinary.uploader.destroy(music.coverPublicId);
//     }

//     await Music.findByIdAndDelete(req.params.id);
//     res.json({ message: "Música eliminada correctamente" });
//   } catch (err) {
//     console.error("Error deleting music:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // ===== TOGGLE LIKE =====
// exports.toggleLike = async (req, res) => {
//   try {
//     const { musicId, userId } = req.body;

//     if (!musicId || !userId) {
//       return res.status(400).json({ error: "musicId y userId son requeridos" });
//     }

//     const music = await Music.findById(musicId);

//     if (!music) {
//       return res.status(404).json({ error: "Música no encontrada" });
//     }

//     if (!music.likedBy) {
//       music.likedBy = [];
//     }

//     const userIndex = music.likedBy.findIndex(id => id.toString() === userId.toString());

//     if (userIndex > -1) {
//       music.likedBy.splice(userIndex, 1);
//       music.likes = Math.max(0, (music.likes || 0) - 1);
//     } else {
//       music.likedBy.push(userId);
//       music.likes = (music.likes || 0) + 1;
//     }

//     await music.save();
    
//     console.log(`✅ Like toggled - Total: ${music.likes}`);
//     res.json({ 
//       likes: music.likes, 
//       liked: userIndex === -1 
//     });
//   } catch (err) {
//     console.error("❌ Error toggle like:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // ===== ADD RATING =====
// exports.addRating = async (req, res) => {
//   try {
//     const { musicId, userId, rating } = req.body;

//     if (!musicId || !userId || rating === undefined) {
//       return res.status(400).json({ error: "musicId, userId y rating son requeridos" });
//     }

//     if (rating < 1 || rating > 5) {
//       return res.status(400).json({ error: "El rating debe estar entre 1 y 5" });
//     }

//     const music = await Music.findById(musicId);

//     if (!music) {
//       return res.status(404).json({ error: "Música no encontrada" });
//     }

//     const existingRatingIndex = music.ratings.findIndex(
//       r => r.user.toString() === userId.toString()
//     );

//     if (existingRatingIndex > -1) {
//       music.ratings[existingRatingIndex].value = rating;
//     } else {
//       music.ratings.push({ user: userId, value: rating });
//     }

//     await music.updateRating();

//     console.log(`✅ Rating actualizado - Nuevo promedio: ${music.rating.toFixed(2)}`);
//     res.json({ 
//       newAverage: music.rating,
//       totalRatings: music.ratings.length
//     });
//   } catch (err) {
//     console.error("❌ Error add rating:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // ===== GET USER LIKES =====
// exports.getUserLikes = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const musics = await Music.find({ likedBy: userId }).select('_id');
//     const likedIds = musics.map(m => m._id.toString());

//     res.json(likedIds);
//   } catch (err) {
//     console.error("❌ Error get user likes:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // ===== GET USER RATINGS =====
// exports.getUserRatings = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const musics = await Music.find({ 'ratings.user': userId });
    
//     const userRatings = {};
//     musics.forEach(music => {
//       const userRating = music.ratings.find(r => r.user.toString() === userId.toString());
//       if (userRating) {
//         userRatings[music._id.toString()] = userRating.value;
//       }
//     });

//     res.json(userRatings);
//   } catch (err) {
//     console.error("❌ Error get user ratings:", err);
//     res.status(500).json({ error: err.message });
//   }
// }

const express = require("express");
const router = express.Router();
const Music = require("../models/musicModel");
const User = require("../models/userModel");
const authenticate = require("../middlewares/auth");

// GET - Obtener todas las canciones
router.get("/", async (req, res) => {
  try {
    const musics = await Music.find()
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 });
    res.json(musics);
  } catch (error) {
    console.error("❌ Error al obtener canciones:", error);
    res.status(500).json({ message: "Error al obtener canciones" });
  }
});

// GET - Obtener canción por ID
router.get("/:id", async (req, res) => {
  try {
    const music = await Music.findById(req.params.id).populate(
      "userId",
      "username avatar"
    );
    if (!music) return res.status(404).json({ message: "Canción no encontrada" });
    res.json(music);
  } catch (error) {
    console.error("❌ Error al obtener canción:", error);
    res.status(500).json({ message: "Error al obtener canción" });
  }
});

// POST - Crear nueva canción
router.post("/", authenticate, async (req, res) => {
  try {
    console.log("📥 Recibiendo datos de canción:", req.body);

    const { title, artist, album, genre, soloist, avance, userId, audioUrl, coverUrl } = req.body;

    if (!title || !artist || !audioUrl) {
      return res.status(400).json({
        message: "Faltan campos requeridos: title, artist, audioUrl"
      });
    }

    const newMusic = new Music({
      title,
      artist,
      album: album || "",
      genre: genre || "",
      soloist: soloist || false,
      avance: avance || false,
      userId: userId || req.user._id,
      audioUrl,
      coverUrl: coverUrl || "",
      likes: 0,
      rating: 0,
    });

    await newMusic.save();
    console.log("✅ Canción creada:", newMusic);

    const populatedMusic = await newMusic.populate("userId", "username avatar");
    res.status(201).json(populatedMusic);
  } catch (error) {
    console.error("❌ Error al crear canción:", error);
    res.status(500).json({ message: "Error al crear canción", error: error.message });
  }
});

// PUT - Actualizar canción
router.put("/:id", authenticate, async (req, res) => {
  try {
    console.log("🔄 Actualizando canción con ID:", req.params.id);
    console.log("📦 Datos recibidos:", req.body);

    const { title, artist, album, genre, soloist, avance, coverUrl } = req.body;

    // Construir objeto de actualización solo con campos que se envían
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (artist !== undefined) updateData.artist = artist;
    if (album !== undefined) updateData.album = album;
    if (genre !== undefined) updateData.genre = genre;
    if (soloist !== undefined) updateData.soloist = soloist;
    if (avance !== undefined) updateData.avance = avance;
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl;

    console.log("📝 Datos a actualizar:", updateData);

    const updatedMusic = await Music.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("userId", "username avatar");

    if (!updatedMusic) {
      return res.status(404).json({ message: "Canción no encontrada" });
    }

    console.log("✅ Canción actualizada:", updatedMusic);
    res.json(updatedMusic);
  } catch (error) {
    console.error("❌ Error al actualizar canción:", error);
    res.status(500).json({
      message: "Error al actualizar canción",
      error: error.message
    });
  }
});

// DELETE - Eliminar canción
router.delete("/:id", authenticate, async (req, res) => {
  try {
    console.log("🗑️ Eliminando canción:", req.params.id);

    const deletedMusic = await Music.findByIdAndDelete(req.params.id);

    if (!deletedMusic) {
      return res.status(404).json({ message: "Canción no encontrada" });
    }

    console.log("✅ Canción eliminada");
    res.json({ message: "Canción eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar canción:", error);
    res.status(500).json({
      message: "Error al eliminar canción",
      error: error.message
    });
  }
});

module.exports = router;












