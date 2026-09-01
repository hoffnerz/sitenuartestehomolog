// routes/links.js
const express = require('express');
const router = express.Router();
const linksExternosController = require('../controllers/linksExternosController');

router.get('/', linksExternosController.listar);
router.get('/click/:id', linksExternosController.registrarCliqueRedirecionar);

module.exports = router;
