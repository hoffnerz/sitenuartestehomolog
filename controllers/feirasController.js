// controllers/feirasController.js
const pool = require('../db');

exports.listar = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM feiras ORDER BY ano DESC');
    res.render('feiras', { feiras: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar feiras');
  }
};
