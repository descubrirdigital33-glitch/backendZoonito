const express = require('express');
const router = express.Router();
const cdController = require('../controllers/cdController');
const multer = require('multer');

// ===================================
// CONFIGURACIÓN MULTER MEMORY STORAGE
// ===================================
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB por archivo
    files: 21 // máximo 21 archivos (1 cover + 20 tracks)
  },
  fileFilter: (req, file, cb) => {
    // Decodificar correctamente el nombre del archivo
    try {
      file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    } catch (e) {
      console.warn('No se pudo decodificar nombre de archivo:', file.originalname);
    }

    // Validar tipos de archivo según el campo
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

// Middleware para manejar múltiples campos
const uploadFields = upload.fields([
  { name: 'coverFile', maxCount: 1 },
  { name: 'audioFile', maxCount: 20 }
]);

// Middleware para manejar errores de multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Archivo muy grande (máx 50MB por archivo)' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Máximo 20 tracks permitidos' });
    }
    return res.status(400).json({ error: `Error de subida: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

// ======================
// RUTAS CD
// ======================

// Crear CD
router.post('/', uploadFields, handleMulterError, cdController.createCD);

// Obtener CDs públicos
router.get('/public/feed', cdController.getPublicCDs);

// Obtener CDs por género
router.get('/genre/:genre', cdController.getCDsByGenre);

// Obtener CDs por usuario
router.get('/user/:userId', cdController.getCDsByUser);

// Obtener CD por ID
router.get('/:id', cdController.getCDById);

// Actualizar CD
router.put('/:id', uploadFields, handleMulterError, cdController.updateCD);

// Eliminar CD
router.delete('/:id', cdController.deleteCD);

// Toggle Like
router.post('/:id/like', cdController.toggleLike);

// Obtener likes
router.get('/:id/likes', cdController.getLikes);

// Incrementar reproducciones
router.post('/:id/play', cdController.incrementPlay);

// Obtener estadísticas
router.get('/:id/stats', cdController.getCDStats);

module.exports = router;