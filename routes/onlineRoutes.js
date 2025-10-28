// routes/onlineRoutes.js
const express = require('express');
const radioController = require('../controllers/onlineController');

const router = express.Router();

// Iniciar sesión de streaming
router.post('/start', radioController.startStreaming.bind(radioController));

// Detener sesión de streaming
router.post('/stop', radioController.stopStreaming.bind(radioController));

// Obtener estado del streaming
router.get('/status/:sessionId', radioController.getStreamingStatus.bind(radioController));

// Stream de audio de un track específico
router.get('/stream/:trackId', radioController.streamTrack.bind(radioController));

// Siguiente track
router.post('/next', radioController.nextTrack.bind(radioController));

module.exports = router;
