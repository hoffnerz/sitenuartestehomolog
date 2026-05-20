const pool = require('../db');

exports.renderProjetos = async (req, res) => { 
    try {
        const result = await pool.query('SELECT * FROM projetos ORDER BY data_criacao DESC');
        res.render('projetos', { projetos: result.rows,
            userPhoto: req.session.userPhoto || null
         });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar projetos');
    }
};