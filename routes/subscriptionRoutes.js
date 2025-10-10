const express = require('express');
const router = express.Router();
const { subscribe } = require('../controllers/suscriptionController');

router.post('/', subscribe);

module.exports = router;
