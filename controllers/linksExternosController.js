const pool = require('../db');
const { registrarClique } = require('../middleware/estatisticas');

exports.listar = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        titulo,
        url,
        descricao,
        ano_c,
        ROW_NUMBER() OVER (ORDER BY id ASC) AS numero_edicao
      FROM link_externos
      ORDER BY id DESC;
    `);

    const registros = result.rows.map(item => ({
      id: item.id,
      titulo: item.titulo,
      url: item.url,
      descricao: item.descricao,
      ano: item.ano_c,
      numero_edicao: Number(item.numero_edicao)
    }));

    const edicoesRecentes = registros.slice(0, 8);

    const porAno = {};

    registros.forEach(item => {
      const ano = item.ano;

      if (!porAno[ano]) {
        porAno[ano] = [];
      }

      porAno[ano].push({
        id: item.id,
        titulo: item.titulo,
        url: item.url,
        descricao: item.descricao,
        numero_edicao: item.numero_edicao
      });
    });

    res.render('links_externos', {
      porAno,
      edicoesRecentes
    });
  } catch (err) {
    console.error('Erro ao buscar links externos:', err);
    res.status(500).send('Erro ao buscar links externos');
  }
};

exports.registrarCliqueRedirecionar = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT titulo, url FROM link_externos WHERE id = $1', [id]);
    const link = result.rows[0];

    if (!link) {
      return res.redirect('/links');
    }
    registrarClique(req, { linkId: id, titulo: link.titulo });

    res.redirect(link.url);
  } catch (err) {
    console.error('Erro ao registrar clique e redirecionar:', err);
    res.redirect('/links');
  }
};
