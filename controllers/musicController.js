const Music = require("../models/Music");
const Usuario = require("../models/Usuario");
const cloudinary = require("../config/cloudinary");
const Lyrics = require("../models/Lyrics");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const mongoose = require("mongoose");

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
    let filter = {};
    
    if (userId) {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        filter.idMusico = new mongoose.Types.ObjectId(userId);
      } else {
        filter.idMusico = userId;
      }
    }
    
    const musics = await Music.find(filter).sort({ createdAt: -1 });
    res.json(musics);
  } catch (err) {
    res.status(500).json({ message: err.message, musics: [] });
  }
};

exports.addMusic = async (req, res) => {
  try {
    const { title, artist, album, genre, soloist, avance, audioUrl, coverUrl } = req.body;
    
    const userId = req.body.userId || req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: "userId es requerido" });
    }
    
    let audioFilePath, audioPublicId, coverFilePath, coverPublicId;

    if (req.files?.audioFile?.[0]) {
      const audioFile = req.files.audioFile[0];
      const coverFile = req.files?.coverFile?.[0];
      
      audioFilePath = audioFile.path;
      audioPublicId = audioFile.filename;
      coverFilePath = coverFile?.path;
      coverPublicId = coverFile?.filename;
    } else if (audioUrl) {
      audioFilePath = audioUrl;
      audioPublicId = audioUrl.split('/').pop().split('.')[0];
      
      if (coverUrl && typeof coverUrl === 'string' && coverUrl.trim() !== '' && coverUrl !== 'undefined' && coverUrl !== 'null') {
        coverFilePath = coverUrl.trim();
        coverPublicId = coverUrl.split('/').pop().split('.')[0];
      }
    } else {
      return res.status(400).json({ 
        error: "Archivo de audio o audioUrl es requerido" 
      });
    }

    let avatarArtist;
    const usuario = await Usuario.findById(userId).select("avatar");
    if (usuario) {
      avatarArtist = usuario.avatar;
    }

    const musicData = {
      title,
      artist,
      avance: avance === "true" || avance === true,
      album: album || undefined,
      genre: genre || undefined,
      soloist: soloist === "true" || soloist === true,
      audioUrl: audioFilePath,
      audioPublicId: audioPublicId,
      idMusico: userId,
      avatarArtist: avatarArtist || null,
    };

    if (coverFilePath && coverFilePath !== 'undefined' && coverFilePath !== 'null') {
      musicData.coverUrl = coverFilePath;
      musicData.coverPublicId = coverPublicId;
    }

    const newMusic = new Music(musicData);
    await newMusic.save();
    
    res.status(201).json(newMusic);
    
  } catch (error) {
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
    res.status(500).json({ message: err.message });
  }
};

exports.updateMusic = async (req, res) => {
  try {
    const id = req.params.id;
    
    console.error('==================== UPDATE MUSIC INICIADO ====================');
    console.error('🆔 ID:', id);
    console.error('📦 Body recibido:', JSON.stringify(req.body, null, 2));
    
    const music = await Music.findById(id);
    
    if (!music) {
      console.error('❌ Música no encontrada');
      return res.status(404).json({ message: "Música no encontrada" });
    }

    console.error('✅ Música encontrada:', music.title);
    console.error('🖼️ coverUrl ACTUAL en BD:', music.coverUrl);

    const { title, artist, album, genre, soloist, avance, coverUrl } = req.body;

    // ✅ CREAR OBJETO DE ACTUALIZACIÓN LIMPIO
    const updateFields = {};
    
    if (title !== undefined) updateFields.title = title;
    if (artist !== undefined) updateFields.artist = artist;
    if (album !== undefined) updateFields.album = album;
    if (genre !== undefined) updateFields.genre = genre;
    
    updateFields.soloist = soloist === "true" || soloist === true;
    updateFields.avance = avance === "true" || avance === true;

    // ✅ PROCESAR COVERURL
    console.error('==================== PROCESANDO COVERURL ====================');
    console.error('coverUrl recibido:', coverUrl);
    console.error('tipo:', typeof coverUrl);

    if (coverUrl !== undefined && coverUrl !== null) {
      if (typeof coverUrl === 'string') {
        const trimmed = coverUrl.trim();
        console.error('URL limpia:', trimmed);
        console.error('Length:', trimmed.length);
        console.error('Es URL de Cloudinary?:', trimmed.includes('cloudinary.com'));
        
        if (trimmed !== '' && 
            trimmed !== 'undefined' && 
            trimmed !== 'null' &&
            trimmed.length > 10) {  // URL mínima válida
          
          console.error('✅ URL VÁLIDA, agregando a updateFields');
          updateFields.coverUrl = trimmed;
          
          // Extraer publicId
          try {
            const urlParts = trimmed.split('/');
            const uploadIndex = urlParts.indexOf('upload');
            if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
              const pathParts = urlParts.slice(uploadIndex + 2);
              const pathStr = pathParts.join('/');
              const publicIdWithExt = pathStr.split('.')[0];
              updateFields.coverPublicId = publicIdWithExt;
              console.error('✅ coverPublicId extraído:', publicIdWithExt);
            }
          } catch (e) {
            console.error('⚠️ Error extrayendo publicId:', e.message);
          }
        } else {
          console.error('⚠️ URL no válida, se ignora');
        }
      } else {
        console.error('⚠️ coverUrl NO es string');
      }
    } else {
      console.error('⚠️ coverUrl es undefined/null');
    }

    // Procesar archivos si vienen (multer)
    if (req.files?.audioFile?.[0]) {
      console.error('🎧 Audio desde archivo');
      if (music.audioPublicId) {
        await cloudinary.uploader.destroy(music.audioPublicId, { resource_type: "video" });
      }
      const audioFile = req.files.audioFile[0];
      updateFields.audioUrl = audioFile.path;
      updateFields.audioPublicId = audioFile.filename;
    }

    if (req.files?.coverFile?.[0]) {
      console.error('📁 Cover desde archivo, SOBRESCRIBE coverUrl del body');
      if (music.coverPublicId) {
        await cloudinary.uploader.destroy(music.coverPublicId);
      }
      const coverFile = req.files.coverFile[0];
      updateFields.coverUrl = coverFile.path;
      updateFields.coverPublicId = coverFile.filename;
    }

    console.error('==================== CAMPOS A ACTUALIZAR ====================');
    console.error(JSON.stringify(updateFields, null, 2));
    console.error('============================================================');

    // ✅ USAR findByIdAndUpdate con $set
    const updatedMusic = await Music.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { 
        new: true,
        runValidators: false  // Desactivar validaciones por si acaso
      }
    );

    if (!updatedMusic) {
      console.error('❌ No se pudo actualizar');
      return res.status(500).json({ message: "Error al actualizar" });
    }

    console.error('==================== GUARDADO EXITOSO ====================');
    console.error('coverUrl guardado:', updatedMusic.coverUrl);
    console.error('coverPublicId guardado:', updatedMusic.coverPublicId);
    console.error('title guardado:', updatedMusic.title);
    console.error('========================================================');
    
    res.json(updatedMusic);

  } catch (err) {
    console.error('❌ ERROR FATAL:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ message: err.message });
  }
};

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

    if (!music.likedBy) {
      music.likedBy = [];
    }

    const userIndex = music.likedBy.findIndex(id => id.toString() === userId.toString());

    if (userIndex > -1) {
      music.likedBy.splice(userIndex, 1);
      music.likes = Math.max(0, (music.likes || 0) - 1);
    } else {
      music.likedBy.push(userId);
      music.likes = (music.likes || 0) + 1;
    }

    await music.save();
    res.json({ 
      likes: music.likes, 
      liked: userIndex === -1 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

    const existingRatingIndex = music.ratings.findIndex(
      r => r.user.toString() === userId.toString()
    );

    if (existingRatingIndex > -1) {
      music.ratings[existingRatingIndex].value = rating;
    } else {
      music.ratings.push({ user: userId, value: rating });
    }

    await music.updateRating();

    res.json({ 
      newAverage: music.rating,
      totalRatings: music.ratings.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserLikes = async (req, res) => {
  try {
    const { userId } = req.params;
    const musics = await Music.find({ likedBy: userId }).select('_id');
    const likedIds = musics.map(m => m._id.toString());
    res.json(likedIds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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
    res.status(500).json({ error: err.message });
  }
};

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

    res.json(music);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

    res.json(lyrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createLyrics = async (req, res) => {
  try {
    const { songId } = req.params;
    const { title, artist, lines } = req.body;

    if (!mongoose.Types.ObjectId.isValid(songId)) {
      return res.status(400).json({ error: "songId inválido" });
    }

    const music = await Music.findById(songId);
    if (!music) {
      return res.status(404).json({ error: "Canción no encontrada" });
    }

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
    res.status(201).json(newLyrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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
    res.json(lyrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

    res.json({ message: "Letras eliminadas correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

