const conteudoMetadata = require('../middleware/conteudoMetadata');

exports.exibir = (req, res) => {
    res.render('index', {
        userPhoto: req.session && req.session.userPhoto ? req.session.userPhoto : null,
        homepage: conteudoMetadata.obterHomepage()
    });
};
