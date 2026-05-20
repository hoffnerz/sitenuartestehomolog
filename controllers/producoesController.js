// controllers/producoesController.js
const pool = require('../db');

exports.listar = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, pr.titulo AS projeto_titulo
      FROM producoes p
      LEFT JOIN projetos pr ON p.projeto_id = pr.id
      ORDER BY p.data_publicacao DESC;
    `);
    
    const projetosResult = await pool.query('SELECT * FROM projetos ORDER BY titulo ASC');
    
    res.render('producoes', { 
        producoes: result.rows, 
        projetos: projetosResult.rows,
        userPhoto: req.session.userPhoto || null
    });
  } catch (err) {
    console.error('Erro ao buscar produções:', err);
    res.status(500).send('Erro ao buscar produções');
  }
};