const pool = require('../db');

exports.listar = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM link_externos
      ORDER BY ano_c DESC, titulo ASC;
    `);

    const registros = result.rows;

    const porAno = {};
    registros.forEach(item => {
      const ano = item.ano_c;

      if (!porAno[ano]) {
        porAno[ano] = [];
      }

      porAno[ano].push({
        id: item.id,
        titulo: item.titulo,
        url: item.url,
        descricao: item.descricao
      });
    });

    res.render('links_externos', { porAno });
  } catch (err) {
    console.error('Erro ao buscar links externos:', err);
    res.status(500).send('Erro ao buscar links externos');
  }
};
