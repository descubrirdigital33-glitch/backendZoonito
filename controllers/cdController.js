const CDCreado = require('../models/cdCreado');
const cloudinary = require('../config/cloudinary');

// Helper mejorado para subir a Cloudinary
const uploadToCloudinary = (buffer, folder, resource_type = 'image', filename = null) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = { 
      folder, 
      resource_type,
      transformation: resource_type === 'image' ? [
        { width: 800, height: 800, crop: 'limit' }
      ] : undefined
    };

    // Agregar public_id si se proporciona filename
    if (filename) {
      uploadOptions.public_id = filename;
    }

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('❌ Error uploading to Cloudinary:', error);
          reject(error);
        } else {
          console.log('✅ Uploaded to Cloudinary:', result.secure_url);
          resolve(result);
        }
      }
    );
    stream.end(buffer);
  });
};
// =========================
// OBTENER TODOS LOS CDS PÚBLICOS
// =========================
exports.getPublicCDs = async (req, res) => {
  try {
    const cds = await CDCreado.find({ isPublic: true })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(cds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =========================
// OBTENER CDS POR USUARIO
// =========================
exports.getCDsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const cds = await CDCreado.find({ userId }).sort({ createdAt: -1 });
    res.json(cds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =========================
// OBTENER CDS POR GÉNERO
// =========================
exports.getCDsByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const cds = await CDCreado.find({ genre, isPublic: true })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(cds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =========================
// OBTENER CD POR ID
// =========================
exports.getCDById = async (req, res) => {
  try {
    const { id } = req.params;
    const cd = await CDCreado.findById(id).populate('userId', 'name email');
    if (!cd) return res.status(404).json({ error: 'CD no encontrado' });
    res.json(cd);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// =========================
// CREAR CD
// =========================

exports.createCD = async (req, res) => {
  try {
    console.log('📦 Body recibido:', req.body);
    console.log('📁 Archivos recibidos:', {
      coverFile: req.files?.coverFile?.length || 0,
      audioFile: req.files?.audioFile?.length || 0
    });

    // Extraer campos del body
    let { title, artist, genre, userId } = req.body;

    // Decodificar UTF-8 si es necesario
    const decodeIfNeeded = (str) => {
      if (!str) return '';
      try {
        if (str.includes('�') || /[À-ÿ]/.test(str)) {
          return Buffer.from(str, 'latin1').toString('utf8');
        }
        return str;
      } catch (e) {
        return str;
      }
    };

    title = decodeIfNeeded(title).trim();
    artist = decodeIfNeeded(artist).trim();
    genre = decodeIfNeeded(genre).trim();

    console.log('📝 Datos decodificados:', { title, artist, genre });

    // Validaciones
    if (!title || !artist || !genre || !userId) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos',
        missing: { 
          title: !title, 
          artist: !artist, 
          genre: !genre, 
          userId: !userId 
        }
      });
    }

    if (!req.files?.audioFile || req.files.audioFile.length === 0) {
      return res.status(400).json({ error: 'Debes subir al menos un track' });
    }

    // === SUBIR COVER ===
    let coverUrl = null;
    if (req.files?.coverFile?.[0]) {
      const coverFile = req.files.coverFile[0];
      console.log('📸 Procesando portada:', {
        originalname: coverFile.originalname,
        mimetype: coverFile.mimetype,
        size: coverFile.size,
        hasBuffer: !!coverFile.buffer
      });

      try {
        const coverResult = await uploadToCloudinary(
          coverFile.buffer,
          'cd_covers',
          'image',
          `cover-${Date.now()}`
        );
        coverUrl = coverResult.secure_url;
        console.log('✅ Cover subida:', coverUrl);
      } catch (error) {
        console.error('❌ Error subiendo cover:', error.message);
        // Continuar sin cover
      }
    } else {
      console.log('ℹ️ No se proporcionó cover');
    }

    // === SUBIR TRACKS ===
    const tracks = [];
    const audioFiles = req.files.audioFile;
    console.log(`🎵 Procesando ${audioFiles.length} tracks...`);

    for (let i = 0; i < audioFiles.length; i++) {
      const file = audioFiles[i];
      
      // Decodificar nombre del archivo
      let trackName = decodeIfNeeded(file.originalname).replace(/\.[^/.]+$/, '');
      
      console.log(`⏳ Subiendo track ${i + 1}/${audioFiles.length}: ${trackName}`);

      try {
        const uploadResult = await uploadToCloudinary(
          file.buffer,
          'cd_tracks',
          'video',
          `track-${Date.now()}-${i}`
        );

        tracks.push({
          name: trackName,
          url: uploadResult.secure_url,
          duration: uploadResult.duration || 0,
          order: i
        });

        console.log(`✅ Track ${i + 1} subido`);
      } catch (error) {
        console.error(`❌ Error subiendo track ${i + 1}:`, error.message);
        throw new Error(`Error subiendo: ${trackName}`);
      }
    }

    // === GUARDAR EN MONGODB ===
    const newCD = new CDCreado({
      userId,
      title,
      artist,
      genre,
      coverImage: coverUrl, // Debe tener la URL de Cloudinary
      tracks,
      isPublic: true,
      likesCount: 0,
      plays: 0
    });

    const savedCD = await newCD.save();
    
    console.log('💾 CD guardado:', {
      _id: savedCD._id,
      title: savedCD.title,
      coverImage: savedCD.coverImage, // Verificar que no sea null
      tracksCount: savedCD.tracks.length
    });

    res.status(201).json({
      message: 'CD creado exitosamente',
      cd: savedCD
    });

  } catch (error) {
    console.error('💥 Error en createCD:', error);
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


// También actualizar el método updateCD
exports.updateCD = async (req, res) => {
  try {
    const { id } = req.params;
    const cd = await CDCreado.findById(id);
    if (!cd) return res.status(404).json({ error: 'CD no encontrado' });

    const { title, artist, genre } = req.body;

    if (title) cd.title = Buffer.from(title, 'latin1').toString('utf8').trim();
    if (artist) cd.artist = Buffer.from(artist, 'latin1').toString('utf8').trim();
    if (genre) cd.genre = Buffer.from(genre, 'latin1').toString('utf8').trim();

    // CAMBIAR req.files.cover por req.files.coverFile
    if (req.files?.coverFile?.[0]) {
      if (cd.coverImage) {
        const publicId = cd.coverImage.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(`cd_covers/${publicId}`);
      }
      
      const coverResult = await uploadToCloudinary(
        req.files.coverFile[0].buffer, 
        'cd_covers', 
        'image'
      );
      cd.coverImage = coverResult.secure_url;
    }

    // CAMBIAR req.files.tracks por req.files.audioFile
    if (req.files?.audioFile && req.files.audioFile.length > 0) {
      for (const track of cd.tracks) {
        const publicId = track.url.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(`cd_tracks/${publicId}`, { resource_type: 'video' });
      }

      const newTracks = [];
      for (let i = 0; i < req.files.audioFile.length; i++) {
        const file = req.files.audioFile[i];
        let fileName = file.originalname;
        try {
          fileName = Buffer.from(fileName, 'latin1').toString('utf8');
        } catch (e) {
          console.warn('⚠️ No se pudo decodificar nombre:', fileName);
        }
        
        const uploadResult = await uploadToCloudinary(
          file.buffer, 
          'cd_tracks', 
          'video'
        );
        
        newTracks.push({
          name: fileName.replace(/\.[^/.]+$/, ''),
          url: uploadResult.secure_url,
          duration: uploadResult.duration || 0,
          order: i
        });
      }
      cd.tracks = newTracks;
    }

    await cd.save();
    res.json({ message: 'CD actualizado exitosamente', cd });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// =========================
// ELIMINAR CD
// =========================
exports.deleteCD = async (req, res) => {
  try {
    const { id } = req.params;
    const cd = await CDCreado.findById(id);
    if (!cd) return res.status(404).json({ error: 'CD no encontrado' });

    // Eliminar portada de Cloudinary
    if (cd.coverImage) {
      try {
        const publicId = cd.coverImage.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(`cd_covers/${publicId}`);
      } catch (err) {
        console.error('Error eliminando portada:', err);
      }
    }

    // Eliminar tracks de Cloudinary
    for (const track of cd.tracks) {
      try {
        const publicId = track.url.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(`cd_tracks/${publicId}`, { resource_type: 'video' });
      } catch (err) {
        console.error('Error eliminando track:', err);
      }
    }

    await CDCreado.findByIdAndDelete(id);
    res.json({ message: 'CD eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =========================
// TOGGLE LIKE
// =========================
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId requerido' });
    }

    const cd = await CDCreado.findById(id);
    if (!cd) return res.status(404).json({ error: 'CD no encontrado' });

    if (cd.hasLikedBy(userId)) {
      await cd.removeLike(userId);
      res.json({ message: 'Like removido', likesCount: cd.likesCount, liked: false });
    } else {
      await cd.addLike(userId);
      res.json({ message: 'Like agregado', likesCount: cd.likesCount, liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =========================
// OBTENER LIKES
// =========================
exports.getLikes = async (req, res) => {
  try {
    const { id } = req.params;
    const cd = await CDCreado.findById(id).populate('likes', 'name email');
    if (!cd) return res.status(404).json({ error: 'CD no encontrado' });
    res.json({ likesCount: cd.likesCount, likes: cd.likes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =========================
// INCREMENTAR REPRODUCCIONES
// =========================
exports.incrementPlay = async (req, res) => {
  try {
    const { id } = req.params;
    const cd = await CDCreado.findById(id);
    if (!cd) return res.status(404).json({ error: 'CD no encontrado' });

    cd.plays = (cd.plays || 0) + 1;
    await cd.save();
    res.json({ plays: cd.plays });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =========================
// OBTENER ESTADÍSTICAS DEL CD
// =========================
exports.getCDStats = async (req, res) => {
  try {
    const { id } = req.params;
    const cd = await CDCreado.findById(id);
    if (!cd) return res.status(404).json({ error: 'CD no encontrado' });

    res.json({
      plays: cd.plays,
      likesCount: cd.likesCount,
      tracksCount: cd.tracks.length,
      duration: cd.duration
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};