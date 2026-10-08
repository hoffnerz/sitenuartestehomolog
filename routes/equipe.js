// routes/equipe.js
const express = require('express');
const router = express.Router();
const { registrarAcesso } = require('../middleware/estatisticas');
router.use(registrarAcesso);
const equipeController = require('../controllers/equipeController');

router.get('/', equipeController.listar);

module.exports = router;
