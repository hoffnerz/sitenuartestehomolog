// routes/producoes.js
const express = require('express');
const router = express.Router();
const producoesController = require('../controllers/producoesController');

router.get('/', producoesController.listar);

module.exports = router;
