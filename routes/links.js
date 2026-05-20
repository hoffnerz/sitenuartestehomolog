// routes/links.js
const express = require('express');
const router = express.Router();
const linksExternosController = require('../controllers/linksExternosController');

router.get('/', linksExternosController.listar);

module.exports = router;
