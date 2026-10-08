// controllers/producoesController.js
const pool = require('../db');
const conteudoMetadata = require('../middleware/conteudoMetadata');

exports.listar = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, pr.titulo AS projeto_titulo
      FROM producoes p
      LEFT JOIN projetos pr ON p.projeto_id = pr.id
      ORDER BY p.data_publicacao DESC;
    `);
    
    const projetosResult = await pool.query('SELECT * FROM projetos ORDER BY titulo ASC');
    
    const tipos = conteudoMetadata.obterTiposProducoes(result.rows.map(item => item.id));
    const producoes = result.rows.map(item => ({ ...item, tipo: tipos[String(item.id)] || 'Animacoes' }));
    res.render('producoes', { 
        producoes, 
        projetos: projetosResult.rows,
        userPhoto: req.session.userPhoto || null
    });
  } catch (err) {
    console.error('Erro ao buscar produções:', err);
    res.status(500).send('Erro ao buscar produções');
  }
};