// controllers/editaisController.js
const pool = require('../db');

exports.listar = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM editais ORDER BY data_inicio DESC');
    res.render('editais', { editais: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar editais');
  }
};
