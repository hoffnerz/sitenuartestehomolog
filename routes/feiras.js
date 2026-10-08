// routes/feiras.js
const express = require('express');
const router = express.Router();
const { registrarAcesso } = require('../middleware/estatisticas');
router.use(registrarAcesso);
const feirasController = require('../controllers/feirasController');

router.get('/', feirasController.listar);

module.exports = router;
