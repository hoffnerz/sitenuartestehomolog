// controllers/feirasController.js
const pool = require('../db');
const conteudoMetadata = require('../middleware/conteudoMetadata');

exports.listar = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM feiras ORDER BY ano DESC');
    const galerias = conteudoMetadata.obterImagensFeira(result.rows.map(item => item.id));
    const feiras = result.rows.map(item => ({ ...item, imagens: galerias[String(item.id)] || [] }));
    res.render('feiras', { feiras });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar feiras');
  }
};
