// Metadados complementares que não existem no schema atual do banco.
// Ficam fora de public/ para não expor o arquivo diretamente.
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'conteudo-metadata.json');

function ler() {
    try {
        return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    } catch (err) {
        if (err.code !== 'ENOENT') throw err;
        return { producoes: {}, feiras: {} };
    }
}

function gravar(dados) {
    fs.mkdirSync(dataDir, { recursive: true });
    const temporario = dataFile + '.tmp';
    fs.writeFileSync(temporario, JSON.stringify(dados, null, 2), 'utf8');
    fs.renameSync(temporario, dataFile);
}

exports.obterTiposProducoes = (ids) => {
    const meta = ler().producoes || {};
    return Object.fromEntries(ids.map(id => [String(id), meta[String(id)] || 'Animacoes']));
};

exports.salvarTipoProducao = (id, tipo) => {
    const dados = ler();
    dados.producoes = dados.producoes || {};
    dados.producoes[String(id)] = tipo;
    gravar(dados);
};

exports.obterImagensFeira = (ids) => {
    const meta = ler().feiras || {};
    return Object.fromEntries(ids.map(id => [String(id), Array.isArray(meta[String(id)]) ? meta[String(id)] : []]));
};

exports.adicionarImagensFeira = (id, imagens) => {
    const dados = ler();
    dados.feiras = dados.feiras || {};
    const chave = String(id);
    dados.feiras[chave] = [...(Array.isArray(dados.feiras[chave]) ? dados.feiras[chave] : []), ...imagens];
    gravar(dados);
    return dados.feiras[chave];
};

const homepagePadrao = {
    hero: {
        etiqueta: 'IFMS Campo Grande',
        titulo: 'Núcleo de\nAnimação e\nRoteiro',
        descricao: 'O NuAR do IFMS é um espaço vibrante dedicado ao desenvolvimento de projetos inovadores nas áreas de animação e escrita criativa, capacitando estudantes e promovendo a cultura e a tecnologia na comunidade.',
        botao1Texto: 'Conheça Nossos Projetos', botao1Url: '/projetos',
        botao2Texto: 'Edições VOX', botao2Url: '/links',
        imagens: ['/Imagens/1.jpg', '/Imagens/2.jpg']
    },
    timelineTitulo: 'Linha do Tempo',
    timelineSubtitulo: 'Nossa Trajetória',
    timeline: [
        { ano: '2017', texto: 'Primeiros estudos sobre as técnicas de Animação e Roteiro a partir das poesias dos escritores regionais.' },
        { ano: '2018', texto: 'Definição dos temas, envolvimento dos estudantes, discussões em grupo e a definição do nome/slogan do projeto.' },
        { ano: '2019', texto: 'Estruturação e Produção: Estruturação do núcleo; Produção de roteiros, storyboards, animações 2D/3D com softwares livres; Desenho e modelagem dos cenários, ministração de oficinas. Eventos e Visitas: Participação na FECINTEC 2019; Visita Técnica para Bodoquena-MS e São Paulo; Visita à Exposição do Leonardo da Vinci no MIS. 1º Lugar FETEC 2019.' },
        { ano: '2020', texto: 'Crescimento: O NuAR segmenta-se em 4 grupos (Jaguars, Zoinho, Melbourne e o Ctrl+Femme). Desenvolvimento de produções em animação 2D, 3D e roteiros. Eventos: Participação na FECINTEC 2020. 1º Lugar Linguística/Artes FETEC 2020; 4º Lugar Geral MOSTRATEC 2020.' }
    ],
    institucionalTitulo: 'Informações Institucionais',
    institucionalSubtitulo: 'Institucional',
    institucional: [
        { titulo: 'Portal INTEGRA IFMS — NuAR.LAB', texto: 'O NuAR.LAB é o laboratório de pesquisa e desenvolvimento do Núcleo de Animação e Roteiro, um ambiente dedicado à experimentação e criação de novas tecnologias e abordagens no campo da animação e narrativa digital.', url: 'https://integra.ifms.edu.br/portfolio/laboratorios/nuar-lab--campus-campo-grande-71', botao: 'Visite o NuAR.LAB' },
        { titulo: 'Regulamento Oficial do NuAR', texto: 'Acesse o regulamento oficial do NuAR para conhecer as diretrizes, normas e procedimentos que regem as atividades do núcleo, garantindo transparência e organização.', url: 'https://www.ifms.edu.br/campi/campus-campo-grande/informacoes/documentos-1', botao: 'Ver Regulamento' }
    ]
};

exports.obterHomepage = () => {
    const dados = ler();
    return { ...homepagePadrao, ...(dados.homepage || {}),
        hero: { ...homepagePadrao.hero, ...((dados.homepage || {}).hero || {}) },
        timeline: Array.isArray((dados.homepage || {}).timeline) ? dados.homepage.timeline : homepagePadrao.timeline,
        institucional: Array.isArray((dados.homepage || {}).institucional) ? dados.homepage.institucional : homepagePadrao.institucional
    };
};

exports.salvarHomepage = (homepage) => {
    const dados = ler();
    dados.homepage = homepage;
    gravar(dados);
};
