// routes/artigos.js
const express = require('express');
const router = express.Router();
const { registrarAcesso } = require('../middleware/estatisticas');
router.use(registrarAcesso);
const artigosController = require('../controllers/artigosController');

router.get('/', artigosController.listar);

module.exports = router;
