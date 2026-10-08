const express = require('express');
const router = express.Router();
const { registrarAcesso } = require('../middleware/estatisticas');
router.use(registrarAcesso);
const projetosController = require('../controllers/projetosController');

router.get('/', projetosController.renderProjetos);

module.exports = router;