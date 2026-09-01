const pool = require('../db');
const bcrypt = require('bcrypt');
const { obterEstatisticas } = require('../middleware/estatisticas');
const saltRounds = 10;
const { removerArquivoAntigo } = require('../middleware/upload');


const tentativasLogin = new Map();
const MAX_TENTATIVAS = 5;
const BLOQUEIO_MS = 15 * 60 * 1000; // 15 minutos

function registrarTentativaFalha(chave) {
    const agora = Date.now();
    const registro = tentativasLogin.get(chave) || { falhas: 0, bloqueadoAte: null };
    registro.falhas += 1;
    if (registro.falhas >= MAX_TENTATIVAS) {
        registro.bloqueadoAte = agora + BLOQUEIO_MS;
        registro.falhas = 0;
    }
    tentativasLogin.set(chave, registro);
}


exports.login = async (req, res) => {
    const { email, senha } = req.body;
    const chave = (email || '').trim().toLowerCase();
    const agora = Date.now();
    const registro = tentativasLogin.get(chave);

    if (registro && registro.bloqueadoAte && registro.bloqueadoAte > agora) {
        const minutosRestantes = Math.ceil((registro.bloqueadoAte - agora) / 60000);
        return res.render('admin/login', { erro: `Muitas tentativas incorretas. Tente novamente em ${minutosRestantes} minuto(s).` });
    }

    try {
        const result = await pool.query('SELECT * FROM equipe WHERE email = $1', [email]);
        const usuario = result.rows[0];

        if (usuario) {
            const match = await bcrypt.compare(senha, usuario.senha);
            if (match && usuario.permissao === 'admin') {
                tentativasLogin.delete(chave);
                req.session.autenticado = true;
                req.session.userEmail = usuario.email;
                req.session.userPhoto = usuario.foto_url;
                res.redirect('/admin/projetos');
            } else {
                registrarTentativaFalha(chave);
                res.render('admin/login', { erro: 'Email, senha ou permissão inválidos.' });
            }
        } else {
            registrarTentativaFalha(chave);
            res.render('admin/login', { erro: 'Email, senha ou permissão inválidos.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao autenticar');
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/admin');
    });
};

exports.renderEstatisticas = (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    try {
        const estatisticas = obterEstatisticas();
        res.render('admin/estatisticas', {
            ...estatisticas,
            userPhoto: req.session.userPhoto
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao carregar estatísticas');
    }
};

exports.renderProjetosAdmin = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    try {
        const projetos = await pool.query('SELECT * FROM projetos ORDER BY titulo ASC');
        res.render('admin/projetos', { projetos: projetos.rows, sucesso: req.query.sucesso, userPhoto: req.session.userPhoto });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao carregar projetos');
    }
};


exports.renderLinkExternosAdmin = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    try {
        const links = await pool.query('SELECT * FROM link_externos ORDER BY titulo ASC'); 
        
        res.render('admin/links_externos', { 
            links: links.rows, 
            sucesso: req.query.sucesso, 
            userPhoto: req.session.userPhoto 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao carregar links externos');
    }
};

exports.renderProducoesAdmin = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    try {
        const producoes = await pool.query('SELECT * FROM producoes ORDER BY titulo ASC');
        const projetos = await pool.query('SELECT id, titulo FROM projetos ORDER BY titulo ASC');
        res.render('admin/producoes', { producoes: producoes.rows, projetos: projetos.rows, sucesso: req.query.sucesso, userPhoto: req.session.userPhoto });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao carregar produções');
    }
};

exports.renderArtigosAdmin = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    try {
        const artigos = await pool.query('SELECT * FROM artigos ORDER BY titulo ASC');
        const projetos = await pool.query('SELECT id, titulo FROM projetos ORDER BY titulo ASC');
        res.render('admin/artigos', { artigos: artigos.rows, projetos: projetos.rows, sucesso: req.query.sucesso, userPhoto: req.session.userPhoto });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao carregar artigos');
    }
};

exports.renderFeirasAdmin = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    try {
        const feiras = await pool.query('SELECT * FROM feiras ORDER BY titulo ASC');
        const projetos = await pool.query('SELECT id, titulo FROM projetos ORDER BY titulo ASC');
        res.render('admin/feiras', { feiras: feiras.rows, projetos: projetos.rows, sucesso: req.query.sucesso, userPhoto: req.session.userPhoto });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao carregar feiras');
    }
};

exports.renderEditaisAdmin = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    try {
        const editais = await pool.query('SELECT * FROM editais ORDER BY titulo ASC');
        const projetos = await pool.query('SELECT id, titulo FROM projetos ORDER BY titulo ASC');
        res.render('admin/editais', { editais: editais.rows, projetos: projetos.rows, sucesso: req.query.sucesso, userPhoto: req.session.userPhoto });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao carregar editais');
    }
};

exports.renderNoticiasAdmin = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    try {
        const noticias = await pool.query('SELECT * FROM noticias ORDER BY titulo ASC');
        res.render('admin/noticias', { noticias: noticias.rows, sucesso: req.query.sucesso, userPhoto: req.session.userPhoto });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao carregar notícias');
    }
};

exports.renderEquipeAdmin = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    try {
        const equipe = await pool.query('SELECT * FROM equipe ORDER BY nome ASC');
        res.render('admin/equipe', { equipe: equipe.rows, sucesso: req.query.sucesso, userPhoto: req.session.userPhoto });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao carregar equipe');
    }
};

// Funções de Inserção
exports.adicionarProjeto = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { titulo, descricao, imagem_url } = req.body;
    const imagemFinal = req.file ? '/uploads/' + req.file.filename : (imagem_url || null);
    try {
        await pool.query('INSERT INTO projetos (titulo, descricao, imagem_url, modificado_em, modificado_por) VALUES ($1, $2, $3, NOW(), $4)', [titulo, descricao, imagemFinal, req.session.userEmail]);
        res.redirect('/admin/projetos?sucesso=true');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao adicionar projeto');
    }
};

exports.adicionarLinkExterno = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { titulo, url, ano_c, descricao } = req.body; 

    try {
        await pool.query('INSERT INTO link_externos (titulo, url, ano_c, descricao, modificado_em, modificado_por) VALUES ($1, $2, $3, $4, NOW(), $5)', 
        [titulo, url, ano_c, descricao, req.session.userEmail]);
        
        res.redirect('/admin/links?sucesso=true');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao adicionar link externo');
    }
};

exports.adicionarProducao = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { titulo, descricao, link_externo, data_publicacao, projeto_id } = req.body;
    try {
        await pool.query('INSERT INTO producoes (titulo, descricao, link_externo, data_publicacao, projeto_id, modificado_em, modificado_por) VALUES ($1, $2, $3, $4, $5, NOW(), $6)', [titulo, descricao, link_externo, data_publicacao, projeto_id, req.session.userEmail]);
        res.redirect('/admin/producoes?sucesso=true');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao adicionar produção');
    }
};

exports.adicionarArtigo = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { titulo, resumo, link_externo, data_publicacao, projeto_id } = req.body;
    try {
        await pool.query('INSERT INTO artigos (titulo, resumo, link_externo, data_publicacao, projeto_id, modificado_em, modificado_por) VALUES ($1, $2, $3, $4, $5, NOW(), $6)', [titulo, resumo, link_externo, data_publicacao, projeto_id, req.session.userEmail]);
        res.redirect('/admin/artigos?sucesso=true');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao adicionar artigo');
    }
};

exports.adicionarFeira = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { titulo, descricao, ano, link_externo, projeto_id } = req.body;
    try {
        await pool.query('INSERT INTO feiras (titulo, descricao, ano, link_externo, projeto_id, modificado_em, modificado_por) VALUES ($1, $2, $3, $4, $5, NOW(), $6)', [titulo, descricao, ano, link_externo, projeto_id, req.session.userEmail]);
        res.redirect('/admin/feiras?sucesso=true');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao adicionar feira');
    }
};

exports.adicionarEdital = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { titulo, descricao, status, data_inicio, data_fim, projeto_id } = req.body;
    
    try {
        await pool.query('INSERT INTO editais (titulo, descricao, status, data_inicio, data_fim, projeto_id, modificado_em, modificado_por) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)', 
        [titulo, descricao, status, data_inicio, data_fim, projeto_id, req.session.userEmail]);
        
        res.redirect('/admin/editais?sucesso=true');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao adicionar edital');
    }
};
exports.adicionarNoticia = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { titulo, conteudo, link_externo } = req.body;
    try {
        await pool.query('INSERT INTO noticias (titulo, conteudo, link_externo, modificado_em, modificado_por) VALUES ($1, $2, $3, NOW(), $4)', [titulo, conteudo, link_externo, req.session.userEmail]);
        res.redirect('/admin/noticias?sucesso=true');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao adicionar notícia');
    }
};

exports.adicionarMembroEquipe = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { nome, foto_url, descricao, lattes_url, funcao, senha, email, permissao } = req.body;
    const fotoFinal = req.file ? '/uploads/' + req.file.filename : (foto_url || null);

    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    try {
        await pool.query('INSERT INTO equipe (nome, foto_url, descricao, lattes_url, funcao, senha, email, permissao, modificado_em, modificado_por) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9)', [nome, fotoFinal, descricao, lattes_url, funcao, hashedPassword, email, permissao, req.session.userEmail]);
        res.redirect('/admin/equipe?sucesso=true');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao adicionar membro da equipe');
    }
};

// Funções de Deleção
exports.deletarProjeto = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { id } = req.params;
    try {
        const anterior = await pool.query('SELECT imagem_url FROM projetos WHERE id = $1', [id]);
        const imagemAnterior = anterior.rows[0] ? anterior.rows[0].imagem_url : null;

        await pool.query('DELETE FROM projetos WHERE id = $1', [id]);

        if (imagemAnterior) removerArquivoAntigo(imagemAnterior);

        res.redirect('/admin/projetos?sucesso=deletado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao deletar projeto');
    }
};

exports.deletarLinkExterno = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM link_externos WHERE id = $1', [id]);
        res.redirect('/admin/links?sucesso=deletado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao deletar link externo');
    }
};

exports.deletarProducao = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM producoes WHERE id = $1', [id]);
        res.redirect('/admin/producoes?sucesso=deletado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao deletar produção');
    }
};

exports.deletarArtigo = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM artigos WHERE id = $1', [id]);
        res.redirect('/admin/artigos?sucesso=deletado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao deletar artigo');
    }
};

exports.deletarFeira = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM feiras WHERE id = $1', [id]);
        res.redirect('/admin/feiras?sucesso=deletado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao deletar feira');
    }
};

exports.deletarEdital = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM editais WHERE id = $1', [id]);
        res.redirect('/admin/editais?sucesso=deletado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao deletar edital');
    }
};

exports.deletarNoticia = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM noticias WHERE id = $1', [id]);
        res.redirect('/admin/noticias?sucesso=deletado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao deletar notícia');
    }
};

exports.deletarMembroEquipe = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { id } = req.params;
    try {
        const anterior = await pool.query('SELECT foto_url FROM equipe WHERE id = $1', [id]);
        const fotoAnterior = anterior.rows[0] ? anterior.rows[0].foto_url : null;

        await pool.query('DELETE FROM equipe WHERE id = $1', [id]);

        if (fotoAnterior) removerArquivoAntigo(fotoAnterior);

        res.redirect('/admin/equipe?sucesso=deletado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao deletar membro da equipe');
    }
};

// Funções de Alteração
exports.alterarProjeto = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { id } = req.params;
    const { titulo, descricao, imagem_url } = req.body;
    const imagemFinal = req.file ? '/uploads/' + req.file.filename : (imagem_url || null);
    try {
        const anterior = await pool.query('SELECT imagem_url FROM projetos WHERE id = $1', [id]);
        const imagemAnterior = anterior.rows[0] ? anterior.rows[0].imagem_url : null;

        await pool.query('UPDATE projetos SET titulo = $1, descricao = $2, imagem_url = $3, modificado_em = NOW(), modificado_por = $4 WHERE id = $5', [titulo, descricao, imagemFinal, req.session.userEmail, id]);

        if (imagemAnterior && imagemAnterior !== imagemFinal) {
            removerArquivoAntigo(imagemAnterior);
        }

        res.redirect('/admin/projetos?sucesso=alterado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao alterar o projeto');
    }
};

exports.alterarLinkExterno = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { id } = req.params;
    const { titulo, url, ano_c, descricao } = req.body;
    
    try {
        await pool.query('UPDATE link_externos SET titulo = $1, url = $2, ano_c = $3, descricao = $4, modificado_em = NOW(), modificado_por = $5 WHERE id = $6', 
        [titulo, url, ano_c, descricao, req.session.userEmail, id]);
        
        res.redirect('/admin/links?sucesso=alterado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao alterar link externo');
    }
};

exports.alterarProducao = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { id } = req.params;
    const { titulo, descricao, link_externo, data_publicacao, projeto_id } = req.body;
    try {
        await pool.query('UPDATE producoes SET titulo = $1, descricao = $2, link_externo = $3, data_publicacao = $4, projeto_id = $5, modificado_em = NOW(), modificado_por = $6 WHERE id = $7', [titulo, descricao, link_externo, data_publicacao, projeto_id, req.session.userEmail, id]);
        res.redirect('/admin/producoes?sucesso=alterado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao alterar a produção');
    }
};

exports.alterarArtigo = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { id } = req.params;
    const { titulo, resumo, link_externo, data_publicacao, projeto_id } = req.body;
    try {
        await pool.query('UPDATE artigos SET titulo = $1, resumo = $2, link_externo = $3, data_publicacao = $4, projeto_id = $5, modificado_em = NOW(), modificado_por = $6 WHERE id = $7', [titulo, resumo, link_externo, data_publicacao, projeto_id, req.session.userEmail, id]);
        res.redirect('/admin/artigos?sucesso=alterado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao alterar o artigo');
    }
};

exports.alterarFeira = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { id } = req.params;
    const { titulo, descricao, ano, link_externo, projeto_id } = req.body;
    try {
        await pool.query('UPDATE feiras SET titulo = $1, descricao = $2, ano = $3, link_externo = $4, projeto_id = $5, modificado_em = NOW(), modificado_por = $6 WHERE id = $7', [titulo, descricao, ano, link_externo, projeto_id, req.session.userEmail, id]);
        res.redirect('/admin/feiras?sucesso=alterado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao alterar a feira');
    }
};

exports.alterarEdital = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { id } = req.params;
    const { titulo, descricao, status, data_inicio, data_fim, projeto_id } = req.body;
    try {
        await pool.query('UPDATE editais SET titulo = $1, descricao = $2, status = $3, data_inicio = $4, data_fim = $5, projeto_id = $6, modificado_em = NOW(), modificado_por = $7 WHERE id = $8', [titulo, descricao, status, data_inicio, data_fim, projeto_id, req.session.userEmail, id]);
        res.redirect('/admin/editais?sucesso=alterado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao alterar o edital');
    }
};

exports.alterarNoticia = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    const { id } = req.params;
    const { titulo, conteudo, link_externo } = req.body;
    try {
        await pool.query('UPDATE noticias SET titulo = $1, conteudo = $2, link_externo = $3, modificado_em = NOW(), modificado_por = $4 WHERE id = $5', [titulo, conteudo, link_externo, req.session.userEmail, id]);
        res.redirect('/admin/noticias?sucesso=alterado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao alterar a notícia');
    }
};

exports.alterarMembroEquipe = async (req, res) => {
    if (!req.session.autenticado) return res.redirect('/admin');
    
    const { id } = req.params;
    const { nome, foto_url, descricao, lattes_url, funcao, senha, email, permissao } = req.body;
    const fotoFinal = req.file ? '/uploads/' + req.file.filename : (foto_url || null);

    const hashedPassword = senha && senha.trim() !== '' ? await bcrypt.hash(senha, saltRounds) : null;

    try {
        const anterior = await pool.query('SELECT foto_url FROM equipe WHERE id = $1', [id]);
        const fotoAnterior = anterior.rows[0] ? anterior.rows[0].foto_url : null;

        await pool.query('UPDATE equipe SET nome = $1, foto_url = $2, descricao = $3, lattes_url = $4, funcao = $5, senha = COALESCE($6, senha), email = $7, permissao = $8, modificado_em = NOW(), modificado_por = $9 WHERE id = $10', [nome, fotoFinal, descricao, lattes_url, funcao, hashedPassword, email, permissao, req.session.userEmail, id]);

        if (fotoAnterior && fotoAnterior !== fotoFinal) {
            removerArquivoAntigo(fotoAnterior);
        }

        res.redirect('/admin/equipe?sucesso=alterado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao alterar o membro da equipe');
    }
};

exports.renderLogin = (req, res) => {
    if (req.session.autenticado) {
        return res.redirect('/admin/projetos'); 
    }  
    res.render('admin/login', { erro: null }); 
};
