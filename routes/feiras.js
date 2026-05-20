// routes/feiras.js
const express = require('express');
const router = express.Router();
const feirasController = require('../controllers/feirasController');

router.get('/', feirasController.listar);

module.exports = router;
