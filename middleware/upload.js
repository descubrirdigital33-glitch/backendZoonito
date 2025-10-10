const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// ===================================
// STORAGE PARA IMÁGENES (AVATARES)
// ===================================
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'user_avatars',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }],
    public_id: (req, file) => {
      return `avatar-${Date.now()}`;
    }
  }
});

// ===================================
// STORAGE PARA COVERS DE CDs
// ===================================
const coverStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cd_covers',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
    public_id: (req, file) => {
      let filename = file.originalname.replace(/\.[^/.]+$/, '');
      try {
        if (filename.includes('�') || /[À-ÿ]/.test(filename)) {
          filename = Buffer.from(filename, 'latin1').toString('utf8');
        }
      } catch (e) {
        console.warn('⚠️ Error decodificando nombre de cover');
      }
      return `cover-${Date.now()}-${filename}`;
    }
  }
});

// ===================================
// STORAGE PARA TRACKS DE CDs
// ===================================
const trackStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cd_tracks',
    resource_type: 'video',
    allowed_formats: ['mp3', 'wav', 'ogg', 'm4a', 'mp4', 'avi', 'mov', 'webm'],
    public_id: (req, file) => {
      let filename = file.originalname.replace(/\.[^/.]+$/, '');
      try {
        if (filename.includes('�') || /[À-ÿ]/.test(filename)) {
          filename = Buffer.from(filename, 'latin1').toString('utf8');
        }
      } catch (e) {
        console.warn('⚠️ Error decodificando nombre de track');
      }
      return `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${filename}`;
    }
  }
});

// ===================================
// MULTER INSTANCES
// ===================================
const uploadImage = multer({ 
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB para avatares
});

const uploadCover = multer({ 
  storage: coverStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB para covers
});

const uploadAudio = multer({ 
  storage: trackStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB para audio
});

// ===================================
// MIDDLEWARE PARA CDs (MEMORY STORAGE)
// ===================================
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { 
    fileSize: 50 * 1024 * 1024,
    files: 21
  },
  fileFilter: (req, file, cb) => {
    try {
      file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    } catch (e) {
      console.warn('No se pudo decodificar nombre de archivo:', file.originalname);
    }

    if (file.fieldname === 'coverFile') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten imágenes para la portada'));
      }
    } else if (file.fieldname === 'audioFile') {
      if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos de audio/video para los tracks'));
      }
    } else {
      cb(null, true);
    }
  }
});

const uploadFields = upload.fields([
  { name: 'coverFile', maxCount: 1 },
  { name: 'audioFile', maxCount: 20 }
]);

// ===================================
// EXPORTS
// ===================================
module.exports = {
  uploadImage,      // Para avatares de usuario
  uploadCover,      // Para covers de CDs
  uploadAudio,      // Para tracks individuales
  uploadFields      // Para subir CD completo
};