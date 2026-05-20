const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { userPhoto: null });
});

module.exports = router;