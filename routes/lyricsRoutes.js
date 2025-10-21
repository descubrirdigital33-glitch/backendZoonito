const express = require('express');
const router = express.Router();
const {
  getLyrics,
  createLyrics,
  updateLyrics,
  deleteLyrics, // ✅ Agregar esta importación
} = require('../controllers/musicController');

// Obtener letras por ID de canción
router.get('/:songId', getLyrics);

// Crear letras (si no existen)
router.post('/:songId', createLyrics);

// Actualizar letras existentes
router.put('/:songId', updateLyrics);

// ✅ Eliminar letras
router.delete('/:songId', deleteLyrics);

module.exports = router;