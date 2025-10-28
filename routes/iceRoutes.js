const express = require('express');
const router = express.Router();
const iceController = require('../controllers/iceController');

router.post('/start', iceController.startStream);
router.post('/stop', iceController.stopStream);
router.get('/status/:radioId', iceController.getStreamStatus);

module.exports = router;
