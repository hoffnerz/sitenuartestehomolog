// routes/editais.js
const express = require('express');
const router = express.Router();
const { registrarAcesso } = require('../middleware/estatisticas');
router.use(registrarAcesso);
const editaisController = require('../controllers/editaisController');

router.get('/', editaisController.listar);

module.exports = router;
