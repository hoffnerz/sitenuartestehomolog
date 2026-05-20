const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Rotas de Autenticação
router.get('/', adminController.renderLogin);
router.post('/login', adminController.login);
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

router.post('/adicionar-link-externo', adminController.adicionarLinkExterno);
router.post('/adicionar-projeto', adminController.adicionarProjeto);
router.post('/adicionar-producao', adminController.adicionarProducao);
router.post('/adicionar-artigo', adminController.adicionarArtigo);
router.post('/adicionar-feira', adminController.adicionarFeira);
router.post('/adicionar-edital', adminController.adicionarEdital);
router.post('/adicionar-noticia', adminController.adicionarNoticia);
router.post('/adicionar-equipe', adminController.adicionarMembroEquipe);

router.post('/deletar-link-externo/:id', adminController.deletarLinkExterno);
router.post('/deletar-projeto/:id', adminController.deletarProjeto);
router.post('/deletar-producao/:id', adminController.deletarProducao);
router.post('/deletar-artigo/:id', adminController.deletarArtigo);
router.post('/deletar-feira/:id', adminController.deletarFeira);
router.post('/deletar-edital/:id', adminController.deletarEdital);
router.post('/deletar-noticia/:id', adminController.deletarNoticia);
router.post('/deletar-equipe/:id', adminController.deletarMembroEquipe);

router.post('/alterar-link-externo/:id', adminController.alterarLinkExterno);
router.post('/alterar-projeto/:id', adminController.alterarProjeto);
router.post('/alterar-producao/:id', adminController.alterarProducao);
router.post('/alterar-artigo/:id', adminController.alterarArtigo);
router.post('/alterar-feira/:id', adminController.alterarFeira);
router.post('/alterar-edital/:id', adminController.alterarEdital);
router.post('/alterar-noticia/:id', adminController.alterarNoticia);
router.post('/alterar-equipe/:id', adminController.alterarMembroEquipe);

module.exports = router;