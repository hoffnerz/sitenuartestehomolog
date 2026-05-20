// controllers/artigosController.js
const pool = require('../db');

exports.listar = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM artigos ORDER BY data_publicacao DESC');
    res.render('artigos', { artigos: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar artigos');
  }
};
