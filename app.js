const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const port = 3001;

// Middleware de sessão 
app.use(session({
    secret: 's6B3WoaUuyRWn0k9lzDzgMuu7yeOvC9VF',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 60 * 1000 } 
}));

// Middleware global
app.use((req, res, next) => {
    res.locals.isAdmin = req.session?.isAdmin || false;
    next();
});

// Middleware para processar dados de formulário e JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuração do EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware para arquivos estáticos (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/Imagens', express.static(path.join(__dirname, 'Imagens')));

// Importação das rotas
const indexRouter = require(path.join(__dirname, 'routes', 'index'));
const noticiasRouter = require(path.join(__dirname, 'routes', 'noticias'));
const producoesRouter = require(path.join(__dirname, 'routes', 'producoes'));
const artigosRouter = require(path.join(__dirname, 'routes', 'artigos'));
const feirasRouter = require(path.join(__dirname, 'routes', 'feiras'));
const editaisRouter = require(path.join(__dirname, 'routes', 'editais'));
const equipeRouter = require(path.join(__dirname, 'routes', 'equipe'));
const projetosRouter = require(path.join(__dirname, 'routes', 'projetos'));
const linksRouter = require(path.join(__dirname, 'routes', 'links'));
const adminRouter = require(path.join(__dirname, 'routes', 'admin'));

// Definição das rotas
app.use('/', indexRouter);
app.use('/noticias', noticiasRouter);
app.use('/producoes', producoesRouter);
app.use('/artigos', artigosRouter);
app.use('/feiras', feirasRouter);
app.use('/editais', editaisRouter);
app.use('/equipe', equipeRouter);
app.use('/projetos', projetosRouter);
app.use('/links', linksRouter);
app.use('/admin', adminRouter);

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
