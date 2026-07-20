const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { criarUploadSeguro } = require('../middleware/upload');
const { gerarToken, verificarToken } = require('../middleware/csrf');

const uploadImagemProjeto = criarUploadSeguro('imagem_arquivo', '/admin/projetos');
const uploadFotoEquipe = criarUploadSeguro('foto_arquivo', '/admin/equipe');

// Garante que toda página do painel (GET) tenha um token CSRF disponível
// em res.locals.csrfToken para os formulários, sem precisar alterar
// nenhum controller individualmente.
router.use(gerarToken);

// Rotas de Autenticação
router.get('/', adminController.renderLogin);
router.post('/login', verificarToken, adminController.login);
router.get('/logout', adminController.logout);
// Rotas para as páginas de cada tabela

router.get('/links', adminController.renderLinkExternosAdmin); 
router.get('/painel', adminController.renderProjetosAdmin);
router.get('/projetos', adminController.renderProjetosAdmin);
router.get('/producoes', adminController.renderProducoesAdmin);
router.get('/artigos', adminController.renderArtigosAdmin);
router.get('/feiras', adminController.renderFeirasAdmin);
router.get('/editais', adminController.renderEditaisAdmin);
router.get('/noticias', adminController.renderNoticiasAdmin);
router.get('/equipe', adminController.renderEquipeAdmin);

// Rotas de Inserção, Deleção e Alteração
// Nas rotas que recebem upload de arquivo (multipart/form-data), o multer
// precisa rodar ANTES da verificação de CSRF, pois é ele quem interpreta
// o corpo da requisição e popula req.body (inclusive o campo _csrf).

router.post('/adicionar-link-externo', verificarToken, adminController.adicionarLinkExterno);
router.post('/adicionar-projeto', uploadImagemProjeto, verificarToken, adminController.adicionarProjeto);
router.post('/adicionar-producao', verificarToken, adminController.adicionarProducao);
router.post('/adicionar-artigo', verificarToken, adminController.adicionarArtigo);
router.post('/adicionar-feira', verificarToken, adminController.adicionarFeira);
router.post('/adicionar-edital', verificarToken, adminController.adicionarEdital);
router.post('/adicionar-noticia', verificarToken, adminController.adicionarNoticia);
router.post('/adicionar-equipe', uploadFotoEquipe, verificarToken, adminController.adicionarMembroEquipe);

router.post('/deletar-link-externo/:id', verificarToken, adminController.deletarLinkExterno);
router.post('/deletar-projeto/:id', verificarToken, adminController.deletarProjeto);
router.post('/deletar-producao/:id', verificarToken, adminController.deletarProducao);
router.post('/deletar-artigo/:id', verificarToken, adminController.deletarArtigo);
router.post('/deletar-feira/:id', verificarToken, adminController.deletarFeira);
router.post('/deletar-edital/:id', verificarToken, adminController.deletarEdital);
router.post('/deletar-noticia/:id', verificarToken, adminController.deletarNoticia);
router.post('/deletar-equipe/:id', verificarToken, adminController.deletarMembroEquipe);

router.post('/alterar-link-externo/:id', verificarToken, adminController.alterarLinkExterno);
router.post('/alterar-projeto/:id', uploadImagemProjeto, verificarToken, adminController.alterarProjeto);
router.post('/alterar-producao/:id', verificarToken, adminController.alterarProducao);
router.post('/alterar-artigo/:id', verificarToken, adminController.alterarArtigo);
router.post('/alterar-feira/:id', verificarToken, adminController.alterarFeira);
router.post('/alterar-edital/:id', verificarToken, adminController.alterarEdital);
router.post('/alterar-noticia/:id', verificarToken, adminController.alterarNoticia);
router.post('/alterar-equipe/:id', uploadFotoEquipe, verificarToken, adminController.alterarMembroEquipe);

module.exports = router;
