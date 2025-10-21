// routes/cancionesRoutes.js
const express = require('express');
const router = express.Router();
const cancionesController = require('../controllers/cancionesController');

// ============ RUTAS CRUD DE CANCIONES ============

// Obtener todas las canciones
router.get('/', cancionesController.obtenerTodas);

// ⚠️ Rutas específicas ANTES de rutas con parámetros
router.get('/:id/letra', cancionesController.obtenerLetra);
router.put('/:id/letra', cancionesController.actualizarLetra);

// Rutas con parámetros al final
router.get('/:id', cancionesController.obtenerPorId);
router.put('/:id', cancionesController.actualizar);
router.delete('/:id', cancionesController.eliminar);

// Crear nueva canción
router.post('/', cancionesController.crear);

module.exports = router;