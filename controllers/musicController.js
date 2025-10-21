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

//     const { title, artist, album, genre, soloist, avance, coverUrl } = req.body;
//     const id = req.params.id;

//     // Validar ID
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "ID inválido" });
//     }

//     // Buscar la música
//     const music = await Music.findById(id);
//     if (!music) {
//       return res.status(404).json({ message: "Música no encontrada" });
//     }

//     console.log("📝 Música actual:", {
//       title: music.title,
//       artist: music.artist,
//       album: music.album,
//       genre: music.genre,
//       soloist: music.soloist,
//       avance: music.avance,
//       coverUrl: music.coverUrl
//     });

//     // Actualizar solo los campos que vienen en el body
//     if (title !== undefined) {
//       music.title = title;
//       console.log("✏️ Título actualizado:", title);
//     }
    
//     if (artist !== undefined) {
//       music.artist = artist;
//       console.log("✏️ Artista actualizado:", artist);
//     }
    
//     if (album !== undefined) {
//       music.album = album;
//       console.log("✏️ Álbum actualizado:", album);
//     }
    
//     if (genre !== undefined) {
//       music.genre = genre;
//       console.log("✏️ Género actualizado:", genre);
//     }
    
//     if (soloist !== undefined) {
//       music.soloist = soloist === "true" || soloist === true;
//       console.log("✏️ Solista actualizado:", music.soloist);
//     }
    
//     if (avance !== undefined) {
//       music.avance = avance === "true" || avance === true;
//       console.log("✏️ Avance actualizado:", music.avance);
//     }

//     // Actualizar la portada si viene de Cloudinary
//     if (coverUrl !== undefined && coverUrl !== null && coverUrl !== "") {
//       music.coverUrl = coverUrl;
//       console.log("✏️ Portada actualizada:", coverUrl);
//     }

//     // Guardar cambios
//     await music.save();
    
//     console.log("✅ Música actualizada exitosamente");
//     console.log("📤 Datos finales:", {
//       title: music.title,
//       artist: music.artist,
//       album: music.album,
//       genre: music.genre,
//       soloist: music.soloist,
//       avance: music.avance,
//       coverUrl: music.coverUrl
//     });

//     res.json(music);

//   } catch (err) {
//     console.error("❌ Error actualizando música:", err);
//     console.error("❌ Stack trace:", err.stack);
//     res.status(500).json({ 
//       message: "Error actualizando música",
//       error: err.message 
//     });
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



const Music = require("../models/Music");
const Usuario = require("../models/Usuario");
const cloudinary = require("../config/cloudinary");
const Lyrics = require("../models/Lyrics");
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



// Agregar este método a tu musicController existente

exports.getMusicById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const music = await Music.findById(id);

    if (!music) {
      return res.status(404).json({ error: "Música no encontrada" });
    }

    console.log("✅ Canción encontrada:", music.title);
    res.json(music);
  } catch (err) {
    console.error("❌ Error obteniendo música:", err);
    res.status(500).json({ error: err.message });
  }
};




// Obtener letras de una canción
exports.getLyrics = async (req, res) => {
  try {
    const { songId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(songId)) {
      return res.status(400).json({ error: "songId inválido" });
    }

    const lyrics = await Lyrics.findOne({ songId });

    if (!lyrics) {
      return res.status(404).json({ error: "Letras no encontradas" });
    }

    console.log("✅ Letras encontradas para:", lyrics.title);
    res.json(lyrics);
  } catch (err) {
    console.error("❌ Error obteniendo letras:", err);
    res.status(500).json({ error: err.message });
  }
};

// Crear nuevas letras
exports.createLyrics = async (req, res) => {
  try {
    const { songId } = req.params;
    const { title, artist, lines } = req.body;

    if (!mongoose.Types.ObjectId.isValid(songId)) {
      return res.status(400).json({ error: "songId inválido" });
    }

    // Verificar que la canción existe
    const music = await Music.findById(songId);
    if (!music) {
      return res.status(404).json({ error: "Canción no encontrada" });
    }

    // Verificar si ya existen letras para esta canción
    const existingLyrics = await Lyrics.findOne({ songId });
    if (existingLyrics) {
      return res.status(400).json({ error: "Ya existen letras para esta canción. Usa PUT para actualizar." });
    }

    const newLyrics = new Lyrics({
      songId,
      title: title || music.title,
      artist: artist || music.artist,
      lines: lines || [],
    });

    await newLyrics.save();
    console.log("✅ Letras creadas exitosamente");
    res.status(201).json(newLyrics);
  } catch (err) {
    console.error("❌ Error creando letras:", err);
    res.status(500).json({ error: err.message });
  }
};

// Actualizar letras existentes
exports.updateLyrics = async (req, res) => {
  try {
    const { songId } = req.params;
    const { title, artist, lines } = req.body;

    if (!mongoose.Types.ObjectId.isValid(songId)) {
      return res.status(400).json({ error: "songId inválido" });
    }

    const lyrics = await Lyrics.findOne({ songId });

    if (!lyrics) {
      return res.status(404).json({ error: "Letras no encontradas" });
    }

    if (title) lyrics.title = title;
    if (artist) lyrics.artist = artist;
    if (lines) lyrics.lines = lines;

    await lyrics.save();
    console.log("✅ Letras actualizadas exitosamente");
    res.json(lyrics);
  } catch (err) {
    console.error("❌ Error actualizando letras:", err);
    res.status(500).json({ error: err.message });
  }
};


// Agregar este método al final de tu musicController.js

// Eliminar letras
exports.deleteLyrics = async (req, res) => {
  try {
    const { songId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(songId)) {
      return res.status(400).json({ error: "songId inválido" });
    }

    const lyrics = await Lyrics.findOneAndDelete({ songId });

    if (!lyrics) {
      return res.status(404).json({ error: "Letras no encontradas" });
    }

    console.log("✅ Letras eliminadas exitosamente");
    res.json({ message: "Letras eliminadas correctamente" });
  } catch (err) {
    console.error("❌ Error eliminando letras:", err);
    res.status(500).json({ error: err.message });
  }
};
