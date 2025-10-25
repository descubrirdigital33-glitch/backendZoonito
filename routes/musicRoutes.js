// const express = require('express');
// const router = express.Router();

// const {
//   getAllMusic,
//   addMusic,
//   deleteMusic,
//   updateMusic,
//   toggleLike,
//   addRating,
//   getUserLikes,
//   getUserRatings
// } = require('../controllers/musicController');

// // Rutas
// router.get('/', getAllMusic);                  // Obtener todas las canciones
// router.post('/', addMusic);                    // Crear música (sin middleware)
// router.put('/:id', express.json(), updateMusic); // Actualizar música JSON puro
// router.delete('/:id', deleteMusic);            // Eliminar música

// // Likes y ratings
// router.post('/like', toggleLike);             
// router.post('/rate', addRating);              
// router.get('/user-likes/:userId', getUserLikes);
// router.get('/user-ratings/:userId', getUserRatings);

// module.exports = router;



const express = require('express');
const router = express.Router();

const {
  getAllMusic,
  addMusic,
  deleteMusic,
  uploadMiddleware,
  updateMusic,
  toggleLike,
  addRating,
  getUserLikes,
  getUserRatings,
  getMusicById,
  getLyrics,
  createLyrics,
  updateLyrics,
  deleteLyrics
} = require('../controllers/musicController');

// ===== MIDDLEWARE CONDICIONAL =====
const conditionalUpload = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  
  console.log('🔍 [ROUTE] Content-Type recibido:', contentType);
  console.log('🔍 [ROUTE] Body preview:', JSON.stringify(req.body).substring(0, 200));
  
  // Si viene JSON, skip multer
  if (contentType.includes('application/json')) {
    console.log('✅ [ROUTE] Detectado JSON, omitiendo multer');
    return next();
  }
  
  // Si viene multipart/form-data, usar multer
  if (contentType.includes('multipart/form-data')) {
    console.log('✅ [ROUTE] Detectado FormData, usando multer');
    return uploadMiddleware(req, res, next);
  }
  
  // Por defecto, continuar sin multer
  console.log('⚠️ [ROUTE] Content-Type desconocido, continuando sin multer');
  next();
};

// ===== RUTAS DE LIKES Y RATINGS =====
router.post('/like', toggleLike);
router.post('/rate', addRating);
router.get('/user-likes/:userId', getUserLikes);
router.get('/user-ratings/:userId', getUserRatings);

// ===== RUTAS DE LETRAS =====
router.get('/lyrics/:songId', getLyrics);
router.post('/lyrics/:songId', createLyrics);
router.put('/lyrics/:songId', updateLyrics);
router.delete('/lyrics/:songId', deleteLyrics);

// ===== RUTAS DE MÚSICA =====
router.get('/', getAllMusic);
router.get('/:id', getMusicById);

// 🔥 RUTAS ACTUALIZADAS: Ahora aceptan tanto JSON como FormData
router.post('/', conditionalUpload, addMusic);
router.put('/:id', conditionalUpload, updateMusic);
router.delete('/:id', deleteMusic);

module.exports = router;






