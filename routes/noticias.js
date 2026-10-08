// routes/noticias.js
const express = require('express');
const router = express.Router();
const { registrarAcesso } = require('../middleware/estatisticas');
router.use(registrarAcesso);
const noticiasController = require('../controllers/noticiasController');

router.get('/', noticiasController.listar);

module.exports = router;
