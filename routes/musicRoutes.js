const express = require('express');
const router = express.Router();

const {
  getAllMusic,
  addMusic,
  deleteMusic,
  updateMusic,
  toggleLike,
  addRating,
  getUserLikes,
  getUserRatings
} = require('../controllers/musicController');

// Rutas
router.get('/', getAllMusic);                  // Obtener todas las canciones
router.post('/', addMusic);                    // Crear música (sin middleware)
router.put('/:id', express.json(), updateMusic); // Actualizar música JSON puro
router.delete('/:id', deleteMusic);            // Eliminar música

// Likes y ratings
router.post('/like', toggleLike);             
router.post('/rate', addRating);              
router.get('/user-likes/:userId', getUserLikes);
router.get('/user-ratings/:userId', getUserRatings);

module.exports = router;






