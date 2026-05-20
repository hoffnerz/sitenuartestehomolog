// routes/artigos.js
const express = require('express');
const router = express.Router();
const artigosController = require('../controllers/artigosController');

router.get('/', artigosController.listar);

module.exports = router;
