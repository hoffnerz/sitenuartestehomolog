const express = require('express');
const router = express.Router();
const { registrarAcesso } = require('../middleware/estatisticas');
router.use(registrarAcesso);
const homeController = require('../controllers/homeController');

router.get('/', homeController.exibir);

module.exports = router;