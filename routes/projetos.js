const express = require('express');
const router = express.Router();
const projetosController = require('../controllers/projetosController');

router.get('/', projetosController.renderProjetos);

module.exports = router;