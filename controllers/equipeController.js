// controllers/equipeController.js
const pool = require('../db');

exports.listar = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipe ORDER BY id ASC');
    res.render('equipe', { equipe: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar equipe');
  }
};
