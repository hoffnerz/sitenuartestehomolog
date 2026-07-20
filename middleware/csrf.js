const crypto = require('crypto');

function gerarToken(req, res, next) {
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }
    res.locals.csrfToken = req.session.csrfToken;
    next();
}

function verificarToken(req, res, next) {
    if (req.method !== 'POST') return next();

    const tokenEnviado = req.body && req.body._csrf;
    const tokenSessao = req.session && req.session.csrfToken;

    if (!tokenEnviado || !tokenSessao || tokenEnviado !== tokenSessao) {
        return res.status(403).send('Sessão expirada ou requisição inválida. Volte e tente novamente.');
    }
    next();
}

module.exports = { gerarToken, verificarToken };
