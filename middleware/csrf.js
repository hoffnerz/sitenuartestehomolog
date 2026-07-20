// Proteção CSRF simples para as rotas do painel de administração.
// Não depende de nenhuma biblioteca externa nem de tabela no banco:
// o token fica guardado na sessão (express-session) já usada pelo login.

const crypto = require('crypto');

// Garante que a sessão tenha um token e disponibiliza em res.locals
// para que qualquer view (<%= csrfToken %>) possa usá-lo sem que o
// controller precise passar essa variável manualmente no render().
function gerarToken(req, res, next) {
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }
    res.locals.csrfToken = req.session.csrfToken;
    next();
}

// Em toda requisição POST, exige que o campo oculto "_csrf" enviado
// pelo formulário bata com o token da sessão do usuário logado.
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
