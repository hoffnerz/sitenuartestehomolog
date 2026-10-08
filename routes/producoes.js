// routes/producoes.js
const express = require('express');
const router = express.Router();
const { registrarAcesso } = require('../middleware/estatisticas');
router.use(registrarAcesso);
const producoesController = require('../controllers/producoesController');

router.get('/', producoesController.listar);

module.exports = router;
