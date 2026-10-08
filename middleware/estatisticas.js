const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const geoip = require('geoip-lite');

const DIR_DADOS = path.join(__dirname, '..', 'data');
const RETENCAO_DIAS = Math.max(30, Math.min(Number(process.env.STATS_RETENTION_DAYS) || 180, 3650));
const PREFIXOS_IGNORADOS = ['/admin', '/uploads', '/favicon.ico', '/robots.txt'];
const EXTENSOES_IGNORADAS = /\.(css|js|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|map|json|xml|txt)$/i;
const ROTULOS_PAGINA = {
    '/': 'Início', '/projetos': 'Projetos', '/noticias': 'Notícias', '/producoes': 'Produções',
    '/artigos': 'Artigos', '/feiras': 'Feiras', '/editais': 'Editais', '/equipe': 'Equipe', '/links': 'Edições VOX'
};
let ultimaLimpeza = 0;

function garantirDiretorio() {
    if (!fs.existsSync(DIR_DADOS)) fs.mkdirSync(DIR_DADOS, { recursive: true, mode: 0o750 });
}
function dataAtual() { return new Date().toISOString().slice(0, 10); }
function caminhoDoDia(data) { return path.join(DIR_DADOS, `cliques-${data}.jsonl`); }
function obterGeo(req) {
    const ip = req.ip || req.socket?.remoteAddress || null;
    return ip ? geoip.lookup(ip) : null;
}
function idSessaoAnonimo(req) {
    const id = req.sessionID || req.session?.id;
    return id ? crypto.createHash('sha256').update(String(id)).digest('hex').slice(0, 24) : null;
}
function obterHostReferer(req) {
    try { return req.headers.referer ? new URL(req.headers.referer).hostname.slice(0, 180) : null; }
    catch (_) { return null; }
}
function anexarEvento(evento) {
    garantirDiretorio();
    fs.appendFile(caminhoDoDia(dataAtual()), `${JSON.stringify(evento)}\n`, { encoding: 'utf8', mode: 0o640 }, err => {
        if (err) console.error('Erro ao gravar estatística:', err.message);
    });
}
function limparArquivosAntigos() {
    const agora = Date.now();
    if (agora - ultimaLimpeza < 60 * 60 * 1000) return;
    ultimaLimpeza = agora;
    garantirDiretorio();
    const limite = Date.now() - RETENCAO_DIAS * 86400000;
    for (const nome of fs.readdirSync(DIR_DADOS)) {
        const match = nome.match(/^cliques-(\d{4}-\d{2}-\d{2})\.jsonl$/);
        if (!match) continue;
        const timestamp = new Date(`${match[1]}T00:00:00.000Z`).getTime();
        if (Number.isFinite(timestamp) && timestamp < limite) {
            try { fs.unlinkSync(path.join(DIR_DADOS, nome)); }
            catch (err) { console.error('Erro ao remover estatística antiga:', err.message); }
        }
    }
}
function registrarClique(req, { linkId, titulo }) {
    const geo = obterGeo(req);
    limparArquivosAntigos();
    anexarEvento({ tipo: 'link_click', linkId: Number(linkId), titulo: String(titulo || '').slice(0, 200),
        pais: geo?.country || null, regiao: geo?.region || null, cidade: geo?.city || null,
        origem: obterHostReferer(req), sessao: idSessaoAnonimo(req), dataHora: new Date().toISOString() });
}
function lerEventos(inicio, fim) {
    garantirDiretorio();
    const nomes = fs.readdirSync(DIR_DADOS).filter(nome => /^cliques-\d{4}-\d{2}-\d{2}\.jsonl$/.test(nome)).sort();
    const eventos = [];
    for (const nome of nomes) {
        const data = nome.slice(8, 18);
        if (data < inicio || data > fim) continue;
        let linhas;
        try { linhas = fs.readFileSync(path.join(DIR_DADOS, nome), 'utf8').split('\n'); }
        catch (err) { console.error('Erro ao ler arquivo de estatísticas:', err.message); continue; }
        for (const linha of linhas) {
            if (!linha) continue;
            try { const item = JSON.parse(linha); if (item.tipo === 'link_click' || item.tipo === 'page_view') eventos.push(item); }
            catch (_) { /* ignora linha incompleta sem interromper o relatório */ }
        }
    }
    return eventos;
}
function agrupar(eventos, chave, limite = 10, rotular = valor => valor) {
    const contagem = new Map();
    for (const evento of eventos) {
        const valor = evento[chave] || 'Desconhecido';
        const id = chave === 'linkId' ? `${valor}\u0000${evento.titulo || ''}` : String(valor);
        const atual = contagem.get(id) || { nome: rotular(valor, evento), total: 0 };
        atual.total += 1; contagem.set(id, atual);
    }
    return [...contagem.values()].sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome, 'pt-BR')).slice(0, limite);
}
function dataValida(valor) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor || '')) return false;
    const data = new Date(`${valor}T00:00:00.000Z`);
    return Number.isFinite(data.getTime()) && data.toISOString().slice(0, 10) === valor;
}
function intervaloPadrao() {
    const fim = new Date(); const inicio = new Date(fim); inicio.setUTCDate(inicio.getUTCDate() - 29);
    return { inicio: inicio.toISOString().slice(0, 10), fim: fim.toISOString().slice(0, 10) };
}
function normalizarIntervalo({ inicio, fim } = {}) {
    const padrao = intervaloPadrao();
    let dataInicio = dataValida(inicio) ? inicio : padrao.inicio;
    let dataFim = dataValida(fim) ? fim : padrao.fim;
    if (dataInicio > dataFim) [dataInicio, dataFim] = [dataFim, dataInicio];
    const dias = (Date.parse(`${dataFim}T00:00:00Z`) - Date.parse(`${dataInicio}T00:00:00Z`)) / 86400000;
    if (dias > 365) dataInicio = new Date(Date.parse(`${dataFim}T00:00:00Z`) - 365 * 86400000).toISOString().slice(0, 10);
    return { inicio: dataInicio, fim: dataFim };
}
function obterEstatisticas(opcoes = {}) {
    const { inicio: dataInicio, fim: dataFim } = normalizarIntervalo(opcoes);
    const eventos = lerEventos(dataInicio, dataFim);
    const cliques = eventos.filter(item => item.tipo === 'link_click');
    const visitas = eventos.filter(item => item.tipo === 'page_view');
    const dias = new Map();
    for (const evento of eventos) {
        const dia = String(evento.dataHora || '').slice(0, 10);
        if (!dataValida(dia)) continue;
        const item = dias.get(dia) || { dia, visualizacoes: 0, cliques: 0 };
        if (evento.tipo === 'page_view') item.visualizacoes += 1;
        if (evento.tipo === 'link_click') item.cliques += 1;
        dias.set(dia, item);
    }
    const visualizacoesPorDia = [];
    const cursor = new Date(`${dataInicio}T00:00:00.000Z`), limite = new Date(`${dataFim}T00:00:00.000Z`);
    while (cursor <= limite) {
        const dia = cursor.toISOString().slice(0, 10);
        visualizacoesPorDia.push(dias.get(dia) || { dia, visualizacoes: 0, cliques: 0 });
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    const sessoes = new Set(eventos.map(item => item.sessao).filter(Boolean));
    return {
        inicio: dataInicio, fim: dataFim, retencaoDias: RETENCAO_DIAS, totalVisualizacoes: visitas.length, sessoesEstimadas: sessoes.size,
        totalCliques: cliques.length, paginasComAcesso: new Set(visitas.map(item => item.pagina)).size,
        visualizacoesPorDia,
        cliquesPorDia: visualizacoesPorDia.map(item => ({ dia: item.dia, total: item.cliques })),
        paginasMaisVisitadas: agrupar(visitas, 'pagina', 10, (valor, evento) => evento.tituloPagina || valor),
        linksMaisClicados: agrupar(cliques, 'linkId', 10, (valor, evento) => evento.titulo || `Link ${valor}`),
        cliquesPorPais: agrupar(cliques, 'pais'), cliquesPorCidade: agrupar(cliques, 'cidade'),
        visitasPorPais: agrupar(visitas, 'pais'), visitasPorCidade: agrupar(visitas, 'cidade'),
        eventos
    };
}
function registrarAcesso(req, res, next) {
    const rota = String(req.originalUrl || `${req.baseUrl || ''}${req.path || '/'}`).split('?')[0];
    const caminho = rota.length > 1 ? rota.replace(/\/+$/, '') : '/';
    if (req.method !== 'GET' || PREFIXOS_IGNORADOS.some(prefixo => caminho === prefixo || caminho.startsWith(`${prefixo}/`)) ||
        caminho.startsWith('/links/click/') || EXTENSOES_IGNORADAS.test(caminho)) return next();
    const geo = obterGeo(req), sessao = idSessaoAnonimo(req);
    res.once('finish', () => {
        if (res.statusCode < 200 || res.statusCode >= 300 || !String(res.getHeader('content-type') || '').includes('text/html')) return;
        limparArquivosAntigos();
        anexarEvento({ tipo: 'page_view', pagina: caminho, tituloPagina: ROTULOS_PAGINA[caminho] || caminho,
            pais: geo?.country || null, regiao: geo?.region || null, cidade: geo?.city || null,
            origem: obterHostReferer(req), sessao, dataHora: new Date().toISOString() });
    });
    next();
}
function csvSeguro(valor) {
    let texto = String(valor ?? '');
    if (/^[\s]*[=+@-]/.test(texto)) texto = `'${texto}`;
    return `"${texto.replace(/"/g, '""')}"`;
}
function exportarCsv(opcoes = {}) {
    const { inicio, fim, eventos } = obterEstatisticas(opcoes);
    const linhas = [['tipo', 'data_hora_utc', 'pagina_ou_link', 'pais', 'regiao', 'cidade', 'origem']];
    for (const item of eventos) linhas.push([item.tipo, item.dataHora || '', item.tipo === 'page_view' ? item.tituloPagina : item.titulo,
        item.pais, item.regiao, item.cidade, item.origem]);
    return { inicio, fim, conteudo: '\uFEFF' + linhas.map(linha => linha.map(csvSeguro).join(',')).join('\r\n') };
}
module.exports = { registrarAcesso, registrarClique, obterEstatisticas, exportarCsv, limparArquivosAntigos };
limparArquivosAntigos();
