const fs = require('fs');
const path = require('path');
const geoip = require('geoip-lite');

const DIR_DADOS = path.join(__dirname, '..', 'data');
const RETENCAO_DIAS = Number(process.env.STATS_RETENTION_DAYS || 180);
const PREFIXOS_IGNORADOS = ['/admin', '/uploads', '/favicon.ico', '/robots.txt'];
const EXTENSOES_IGNORADAS = /\.(css|js|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|map)$/i;
let ultimaLimpeza = 0;

function garantirDiretorio() {
    if (!fs.existsSync(DIR_DADOS)) {
        fs.mkdirSync(DIR_DADOS, { recursive: true, mode: 0o750 });
    }
}

function dataAtual() {
    return new Date().toISOString().slice(0, 10);
}

function caminhoDoDia(data) {
    return path.join(DIR_DADOS, `cliques-${data}.jsonl`);
}

function obterIp(req) {
    const encaminhado = req.headers['x-forwarded-for'];
    if (encaminhado) return encaminhado.split(',')[0].trim();
    return req.socket?.remoteAddress || null;
}

function obterOrigem(req) {
    const ip = obterIp(req);
    return ip ? geoip.lookup(ip) : null;
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
    const limite = Date.now() - RETENCAO_DIAS * 24 * 60 * 60 * 1000;
    for (const nome of fs.readdirSync(DIR_DADOS)) {
        const correspondencia = nome.match(/^cliques-(\d{4}-\d{2}-\d{2})\.jsonl$/);
        if (!correspondencia) continue;
        const dataArquivo = new Date(`${correspondencia[1]}T00:00:00.000Z`).getTime();
        if (Number.isFinite(dataArquivo) && dataArquivo < limite) {
            try {
                fs.unlinkSync(path.join(DIR_DADOS, nome));
            } catch (err) {
                console.error('Erro ao remover estatística antiga:', err.message);
            }
        }
    }
}

function registrarClique(req, { linkId, titulo }) {
    const geo = obterOrigem(req);
    limparArquivosAntigos();
    anexarEvento({
        tipo: 'link_click',
        linkId: Number(linkId),
        titulo: String(titulo || '').slice(0, 200),
        pais: geo?.country || null,
        regiao: geo?.region || null,
        cidade: geo?.city || null,
        referrer: String(req.headers.referer || '').slice(0, 500) || null,
        userAgent: String(req.headers['user-agent'] || '').slice(0, 300) || null,
        dataHora: new Date().toISOString()
    });
}

function lerEventos(inicio, fim) {
    garantirDiretorio();
    const arquivos = fs.readdirSync(DIR_DADOS)
        .filter(nome => /^cliques-\d{4}-\d{2}-\d{2}\.jsonl$/.test(nome))
        .sort();
    const eventos = [];
    for (const nome of arquivos) {
        const data = nome.slice(8, 18);
        if (data < inicio || data > fim) continue;
        const linhas = fs.readFileSync(path.join(DIR_DADOS, nome), 'utf8').split('\n');
        for (const linha of linhas) {
            if (!linha) continue;
            try {
                const evento = JSON.parse(linha);
                if (evento.tipo === 'link_click') eventos.push(evento);
            } catch (_) {
                // Ignora somente registros incompletos, sem interromper o painel.
            }
        }
    }
    return eventos;
}

function agrupar(eventos, chave, limite = 10) {
    const contagem = {};
    for (const evento of eventos) {
        const valor = evento[chave] || 'Desconhecido';
        contagem[valor] = (contagem[valor] || 0) + 1;
    }
    return Object.entries(contagem)
        .map(([nome, total]) => ({ nome, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, limite);
}

function intervaloPadrao() {
    const fim = new Date();
    const inicio = new Date(fim);
    inicio.setDate(inicio.getDate() - 29);
    return { inicio: inicio.toISOString().slice(0, 10), fim: fim.toISOString().slice(0, 10) };
}

function obterEstatisticas({ inicio, fim } = {}) {
    const padrao = intervaloPadrao();
    const dataInicio = /^\d{4}-\d{2}-\d{2}$/.test(inicio || '') ? inicio : padrao.inicio;
    const dataFim = /^\d{4}-\d{2}-\d{2}$/.test(fim || '') ? fim : padrao.fim;
    const eventos = lerEventos(dataInicio, dataFim);
    const porDia = {};
    for (const evento of eventos) {
        const dia = String(evento.dataHora || '').slice(0, 10);
        porDia[dia] = (porDia[dia] || 0) + 1;
    }
    const cliquesPorDia = [];
    const cursor = new Date(`${dataInicio}T00:00:00.000Z`);
    const limite = new Date(`${dataFim}T00:00:00.000Z`);
    while (cursor <= limite) {
        const dia = cursor.toISOString().slice(0, 10);
        cliquesPorDia.push({ dia, total: porDia[dia] || 0 });
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return {
        inicio: dataInicio,
        fim: dataFim,
        totalCliques: eventos.length,
        cliquesPorDia,
        linksMaisClicados: agrupar(eventos, 'titulo'),
        cliquesPorPais: agrupar(eventos, 'pais'),
        cliquesPorCidade: agrupar(eventos, 'cidade')
    };
}

module.exports = { registrarClique, obterEstatisticas };

// A limpeza também ocorre quando não há cliques, sem manter um timer permanente.
limparArquivosAntigos();
