// Middleware de upload de imagens do painel de administração.
// Salva os arquivos em /public/uploads e devolve o caminho público
// (ex.: /uploads/1737312345-928374652.jpg) para ser gravado nas
// mesmas colunas de texto que hoje guardam URLs externas
// (projetos.imagem_url e equipe.foto_url). Nenhuma tabela é alterada.

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const nomeUnico = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
        cb(null, nomeUnico);
    }
});

const tiposPermitidos = /jpeg|jpg|png|webp|gif/;

function fileFilter(req, file, cb) {
    const extValida = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
    const mimeValido = tiposPermitidos.test(file.mimetype);
    if (extValida && mimeValido) {
        return cb(null, true);
    }
    cb(new Error('Apenas imagens JPG, PNG, WEBP ou GIF são permitidas.'));
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Envolve upload.single(campo) e, em caso de erro (tipo de arquivo
// inválido, arquivo grande demais etc.), redireciona de volta para a
// página de origem com uma mensagem amigável em vez de derrubar a rota.
function criarUploadSeguro(campo, paginaVolta) {
    return function (req, res, next) {
        upload.single(campo)(req, res, function (err) {
            if (err) {
                console.error('Erro no upload de imagem:', err.message);
                return res.redirect(paginaVolta + '?erro_upload=1');
            }
            next();
        });
    };
}

// Remove um arquivo previamente enviado quando ele é substituído por
// outro ou quando o item que o usava é deletado. Só apaga arquivos
// que realmente vivem em /uploads (nunca uma URL externa) e nunca
// derruba a requisição se o arquivo já não existir mais.
function removerArquivoAntigo(caminhoRelativo) {
    if (!caminhoRelativo || typeof caminhoRelativo !== 'string') return;
    if (!caminhoRelativo.startsWith('/uploads/')) return;

    const nomeArquivo = path.basename(caminhoRelativo);
    const caminhoAbsoluto = path.join(uploadDir, nomeArquivo);

    fs.unlink(caminhoAbsoluto, function (err) {
        if (err && err.code !== 'ENOENT') {
            console.error('Não foi possível remover o arquivo antigo:', err.message);
        }
    });
}

module.exports = { upload, criarUploadSeguro, removerArquivoAntigo };
