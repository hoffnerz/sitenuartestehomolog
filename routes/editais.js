// routes/editais.js
const express = require('express');
const router = express.Router();
const editaisController = require('../controllers/editaisController');

router.get('/', editaisController.listar);

module.exports = router;
