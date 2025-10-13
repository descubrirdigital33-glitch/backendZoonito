const express = require('express');
const router = express.Router();
const {
  getAllMusic,
  addMusic,
  deleteMusic,
  // uploadMiddleware,
  updateMusic,
  toggleLike,      // 🆕 Toggle like
  addRating,       // 🆕 Agregar/actualizar rating
  getUserLikes,    // 🆕 Obtener likes del usuario
  getUserRatings   // 🆕 Obtener ratings del usuario
} = require('../controllers/musicController');

// ===== RUTAS EXISTENTES =====
router.get('/', getAllMusic);
router.post('/', addMusic);
router.put('/:id', updateMusic);
router.delete('/:id', deleteMusic);

// ===== 🆕 NUEVAS RUTAS PARA LIKES Y RATING =====
router.post('/like', toggleLike);                        // Toggle like (agregar/quitar)
router.post('/rate', addRating);                         // Agregar o actualizar rating
router.get('/user-likes/:userId', getUserLikes);         // Obtener canciones con like del usuario
router.get('/user-ratings/:userId', getUserRatings);     // Obtener ratings del usuario


module.exports = router;
