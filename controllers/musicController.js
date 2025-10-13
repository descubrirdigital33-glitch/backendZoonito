// const Music = require("../models/Music");
// const Usuario = require("../models/Usuario");
// const cloudinary = require("../config/cloudinary");
// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const mongoose = require("mongoose");

// // Configurar storage para Cloudinary
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: async (req, file) => {
//     const isAudio = file.fieldname === "audioFile";
//     return {
//       folder: isAudio ? "music/audio" : "music/covers",
//       resource_type: isAudio ? "auto" : "image",
//       allowed_formats: isAudio
//         ? ["mp3", "wav", "ogg", "m4a", "mp4", "avi", "mov"]
//         : ["jpg", "png", "jpeg", "webp", "gif"],
//     };
//   },
// });

// const upload = multer({ storage });

// exports.uploadMiddleware = upload.fields([
//   { name: "audioFile", maxCount: 1 },
//   { name: "coverFile", maxCount: 1 },
// ]);


const Music = require("../models/Music");
const Usuario = require("../models/Usuario");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const mongoose = require("mongoose");

// Configurar storage para Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isAudio = file.fieldname === "audioFile";
    return {
      folder: isAudio ? "music/audio" : "music/covers",
      resource_type: isAudio ? "auto" : "image",
      format: !isAudio ? "jpg" : undefined, // 🔴 FUERZA JPG PARA PORTADAS
      quality: !isAudio ? "auto" : undefined, // Optimiza la calidad
      allowed_formats: isAudio
        ? ["mp3", "wav", "ogg", "m4a", "mp4", "avi", "mov"]
        : ["jpg", "png", "jpeg", "webp", "gif"],
    };
  },
});


const upload = multer({ storage });

exports.uploadMiddleware = upload.fields([
  { name: "audioFile", maxCount: 1 },
  { name: "coverFile", maxCount: 1 },
]);

exports.getAllMusic = async (req, res) => {
  try {
    const userId = req.query.userId;
    
    console.log("🔍 Buscando música para userId:", userId);
    
    let filter = {};
    
    if (userId) {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        filter.idMusico = new mongoose.Types.ObjectId(userId);
      } else {
        filter.idMusico = userId;
      }
    }
    
    console.log("🔍 Filtro aplicado:", filter);
    
    const musics = await Music.find(filter).sort({ createdAt: -1 });
    
    console.log("✅ Canciones encontradas:", musics.length);
    
    res.json(musics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message, musics: [] });
  }
};

exports.addMusic = async (req, res) => {
  try {
    
    const { title, artist, album, genre, soloist,avance } = req.body;
    
    const userId = req.body.userId || req.user?._id || req.user?.id;
    console.log("👤 userId extraído:", userId);

    if (!userId) {
      return res.status(400).json({ error: "userId es requerido" });
    }

    if (!req.files?.audioFile?.[0]) {
      return res.status(400).json({ error: "Archivo de audio es requerido" });
    }

    const audioFile = req.files.audioFile[0];
    const coverFile = req.files?.coverFile?.[0];

    // 🔹 Buscar avatar del usuario
    let avatarArtist;
    const usuario = await Usuario.findById(userId).select("avatar");
    if (usuario) {
      avatarArtist = usuario.avatar;
      console.log("🖼️ Avatar del artista:", avatarArtist);
    } else {
      console.warn("⚠️ Usuario no encontrado, no se pudo asignar avatar");
    }

    const newMusic = new Music({
      title,
      artist,
      avance,
      album: album || undefined,
      genre: genre || undefined,
      soloist: soloist === "true" || soloist === true,
      audioUrl: audioFile.path,
      audioPublicId: audioFile.filename,
      coverUrl: coverFile?.path || undefined,
      coverPublicId: coverFile?.filename || undefined,
      idMusico: userId,
      avatarArtist: avatarArtist || null,
    });

    await newMusic.save();
    
    res.status(201).json(newMusic);
  } catch (error) {
    console.error("❌ Error completo:", error);
    console.error("❌ Stack:", error.stack);
    res.status(500).json({ 
      error: "Error subiendo música",
      details: error.message
    });
  }
};

exports.deleteMusic = async (req, res) => {
  try {
    const music = await Music.findById(req.params.id);

    if (!music) {
      return res.status(404).json({ message: "Música no encontrada" });
    }

    if (music.audioPublicId) {
      await cloudinary.uploader.destroy(music.audioPublicId, {
        resource_type: "video",
      });
    }
    if (music.coverPublicId) {
      await cloudinary.uploader.destroy(music.coverPublicId);
    }

    await Music.findByIdAndDelete(req.params.id);
    res.json({ message: "Música eliminada correctamente" });
  } catch (err) {
    console.error("Error deleting music:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateMusic = async (req, res) => {
  try {
    const { title, artist, album, genre, soloist } = req.body;
    const id = req.params.id;

    const music = await Music.findById(id);
    if (!music) {
      return res.status(404).json({ message: "Música no encontrada" });
    }

    // Actualizar campos de texto
    if (title) music.title = title;
    if (artist) music.artist = artist;
    if (album) music.album = album;
    if (genre) music.genre = genre;
    if (soloist !== undefined) music.soloist = soloist === "true";

    // Actualizar archivo de audio si se envió uno nuevo
    if (req.files && req.files.audioFile) {
      // Eliminar audio anterior de Cloudinary
      if (music.audioPublicId) {
        await cloudinary.uploader.destroy(music.audioPublicId, {
          resource_type: "video",
        });
      }
      
      const audioFile = req.files.audioFile[0];
      music.audioUrl = audioFile.path;
      music.audioPublicId = audioFile.filename;
      console.log("🎵 Nuevo audio subido:", audioFile.path);
    }

    // 🔹 Actualizar portada si se envió una nueva
    if (req.files && req.files.coverFile) {
      // Eliminar portada anterior de Cloudinary
      if (music.coverPublicId) {
        await cloudinary.uploader.destroy(music.coverPublicId);
        console.log("🗑️ Portada anterior eliminada de Cloudinary");
      }
      
      const coverFile = req.files.coverFile[0];
      music.coverUrl = coverFile.path;
      music.coverPublicId = coverFile.filename;
      console.log("🖼️ Nueva portada subida:", coverFile.path);
    }

    await music.save();
    console.log("✅ Música actualizada exitosamente");
    res.json(music);
  } catch (err) {
    console.error("❌ Error actualizando música:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🆕 TOGGLE LIKE - Agregar o quitar like
exports.toggleLike = async (req, res) => {
  try {
    const { musicId, userId } = req.body;

    if (!musicId || !userId) {
      return res.status(400).json({ error: "musicId y userId son requeridos" });
    }

    const music = await Music.findById(musicId);

    if (!music) {
      return res.status(404).json({ error: "Música no encontrada" });
    }

    // Inicializar el array de likedBy si no existe
    if (!music.likedBy) {
      music.likedBy = [];
    }

    // Verificar si el usuario ya dio like
    const userIndex = music.likedBy.findIndex(id => id.toString() === userId.toString());

    if (userIndex > -1) {
      // Quitar like
      music.likedBy.splice(userIndex, 1);
      music.likes = Math.max(0, (music.likes || 0) - 1);
    } else {
      // Agregar like
      music.likedBy.push(userId);
      music.likes = (music.likes || 0) + 1;
    }

    await music.save();
    
    console.log(`✅ Like toggled - Total: ${music.likes}`);
    res.json({ 
      likes: music.likes, 
      liked: userIndex === -1 
    });
  } catch (err) {
    console.error("❌ Error toggle like:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🆕 AGREGAR/ACTUALIZAR RATING
exports.addRating = async (req, res) => {
  try {
    const { musicId, userId, rating } = req.body;

    if (!musicId || !userId || rating === undefined) {
      return res.status(400).json({ error: "musicId, userId y rating son requeridos" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "El rating debe estar entre 1 y 5" });
    }

    const music = await Music.findById(musicId);

    if (!music) {
      return res.status(404).json({ error: "Música no encontrada" });
    }

    // Buscar si el usuario ya calificó
    const existingRatingIndex = music.ratings.findIndex(
      r => r.user.toString() === userId.toString()
    );

    if (existingRatingIndex > -1) {
      // Actualizar rating existente
      music.ratings[existingRatingIndex].value = rating;
    } else {
      // Agregar nuevo rating
      music.ratings.push({ user: userId, value: rating });
    }

    // Calcular nuevo promedio
    await music.updateRating();

    console.log(`✅ Rating actualizado - Nuevo promedio: ${music.rating.toFixed(2)}`);
    res.json({ 
      newAverage: music.rating,
      totalRatings: music.ratings.length
    });
  } catch (err) {
    console.error("❌ Error add rating:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🆕 OBTENER LIKES DEL USUARIO
exports.getUserLikes = async (req, res) => {
  try {
    const { userId } = req.params;

    const musics = await Music.find({ likedBy: userId }).select('_id');
    const likedIds = musics.map(m => m._id.toString());

    res.json(likedIds);
  } catch (err) {
    console.error("❌ Error get user likes:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🆕 OBTENER RATINGS DEL USUARIO
exports.getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;

    const musics = await Music.find({ 'ratings.user': userId });
    
    const userRatings = {};
    musics.forEach(music => {
      const userRating = music.ratings.find(r => r.user.toString() === userId.toString());
      if (userRating) {
        userRatings[music._id.toString()] = userRating.value;
      }
    });

    res.json(userRatings);
  } catch (err) {
    console.error("❌ Error get user ratings:", err);
    res.status(500).json({ error: err.message });
  }
};




