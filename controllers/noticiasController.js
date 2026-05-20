// controllers/noticiasController.js
const pool = require('../db');

exports.listar = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM noticias ORDER BY data_publicacao DESC');
    res.render('noticias', { noticias: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar notícias');
  }
};
