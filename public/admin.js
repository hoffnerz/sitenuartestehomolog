// NuAR — Painel de Administração
// Comportamento compartilhado entre todas as telas do admin:
// menu lateral em drawer no mobile e destaque do item de navegação ativo.
// Não interfere em nenhuma lógica de formulário específica de cada tela.

document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('adminSidebarOverlay');
    const openBtn = document.getElementById('adminSidebarOpenBtn');
    const closeBtn = document.getElementById('adminSidebarCloseBtn');

    function openSidebar() {
        if (sidebar) sidebar.classList.add('is-open');
        if (overlay) overlay.classList.add('is-open');
    }

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('is-open');
        if (overlay) overlay.classList.remove('is-open');
    }

    if (openBtn) openBtn.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Destaca o link do menu correspondente à página atual
    document.querySelectorAll('.admin-nav-link[data-nav-link]').forEach(function (link) {
        try {
            const linkPath = new URL(link.href).pathname;
            if (linkPath === window.location.pathname) {
                link.classList.add('is-active');
            }
        } catch (e) { /* ignora URLs inválidas */ }
    });

    // ---------- Modal de confirmação (substitui o confirm() nativo) ----------
    // Qualquer <form data-confirm="mensagem"> passa a abrir este modal em
    // vez do confirm() do navegador. Ao confirmar, o próprio form é enviado.
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'admin-modal-overlay';
    modalOverlay.innerHTML = [
        '<div class="admin-modal" role="alertdialog" aria-modal="true">',
        '  <div class="admin-modal__icon">',
        '    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>',
        '  </div>',
        '  <p class="admin-modal__text" id="adminModalText"></p>',
        '  <div class="admin-modal__actions">',
        '    <button type="button" class="admin-btn admin-btn--ghost" id="adminModalCancel">Cancelar</button>',
        '    <button type="button" class="admin-btn admin-btn--danger" id="adminModalConfirm">Deletar</button>',
        '  </div>',
        '</div>'
    ].join('');
    document.body.appendChild(modalOverlay);

    const modalText = modalOverlay.querySelector('#adminModalText');
    const modalCancel = modalOverlay.querySelector('#adminModalCancel');
    const modalConfirm = modalOverlay.querySelector('#adminModalConfirm');
    let formPendente = null;

    function fecharModal() {
        modalOverlay.classList.remove('is-open');
        formPendente = null;
    }

    modalCancel.addEventListener('click', fecharModal);
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) fecharModal();
    });
    modalConfirm.addEventListener('click', function () {
        if (formPendente) {
            formPendente.setAttribute('data-confirmado', '1');
            formPendente.submit();
        }
        fecharModal();
    });

    document.querySelectorAll('form[data-confirm]').forEach(function (form) {
        form.addEventListener('submit', function (e) {
            if (form.getAttribute('data-confirmado') === '1') return;
            e.preventDefault();
            modalText.textContent = form.getAttribute('data-confirm');
            formPendente = form;
            modalOverlay.classList.add('is-open');
        });
    });
});

// Busca/filtro simples no lado do cliente para as listas do painel.
// Não depende do backend: filtra os cards que já estão na página pelo
// texto que já vem do banco (título, descrição etc. em data-search).
window.setupListSearch = function (ids) {
    const input = document.getElementById(ids.input);
    const cards = document.querySelectorAll(ids.cardSelector);
    const noResults = document.getElementById(ids.noResults);
    if (!input) return;

    input.addEventListener('input', function () {
        const termo = input.value.trim().toLowerCase();
        let algumVisivel = false;
        cards.forEach(function (card) {
            const texto = (card.getAttribute('data-search') || '').toLowerCase();
            const combina = texto.indexOf(termo) !== -1;
            card.style.display = combina ? '' : 'none';
            if (combina) algumVisivel = true;
        });
        if (noResults) {
            noResults.classList.toggle('is-visible', !algumVisivel && cards.length > 0);
        }
    });
};

// Widget de upload de imagem (arrastar/soltar + preview + fallback por URL).
// Usado nas telas de Projetos e Equipe. Recebe os ids dos elementos
// envolvidos e liga toda a interação — arquivo tem prioridade sobre a URL.
window.setupImageUpload = function (ids) {
    const dropzone = document.getElementById(ids.dropzone);
    const fileInput = document.getElementById(ids.fileInput);
    const preview = document.getElementById(ids.preview);
    const previewWrap = document.getElementById(ids.previewWrap);
    const filenameEl = document.getElementById(ids.filename);
    const urlField = document.getElementById(ids.urlFieldWrap);
    const urlInput = document.getElementById(ids.urlInput);
    const toggleBtn = document.getElementById(ids.toggleUrlBtn);

    if (!dropzone || !fileInput) return;

    function showPreview(src) {
        if (!preview || !previewWrap) return;
        if (src) {
            preview.src = src;
            previewWrap.classList.remove('admin-upload__preview--empty');
            preview.style.display = '';
        }
    }

    function setFile(file) {
        if (!file) return;
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
        if (filenameEl) filenameEl.textContent = file.name;
        const reader = new FileReader();
        reader.onload = function (e) { showPreview(e.target.result); };
        reader.readAsDataURL(file);
    }

    dropzone.addEventListener('click', function () { fileInput.click(); });

    fileInput.addEventListener('change', function () {
        if (fileInput.files && fileInput.files[0]) setFile(fileInput.files[0]);
    });

    ['dragover', 'dragenter'].forEach(function (evt) {
        dropzone.addEventListener(evt, function (e) {
            e.preventDefault();
            dropzone.classList.add('is-dragover');
        });
    });
    ['dragleave', 'drop'].forEach(function (evt) {
        dropzone.addEventListener(evt, function (e) {
            e.preventDefault();
            dropzone.classList.remove('is-dragover');
        });
    });
    dropzone.addEventListener('drop', function (e) {
        if (e.dataTransfer.files && e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
    });

    if (toggleBtn && urlField) {
        toggleBtn.addEventListener('click', function () {
            urlField.classList.toggle('is-open');
        });
    }

    // Expõe uma função para o preencherForm* de cada tela usar,
    // resetando o widget e mostrando a imagem já cadastrada no item.
    return {
        reset: function (currentUrl) {
            fileInput.value = '';
            if (filenameEl) filenameEl.textContent = '';
            if (urlInput) urlInput.value = currentUrl || '';
            if (currentUrl) {
                showPreview(currentUrl);
            } else if (preview && previewWrap) {
                preview.style.display = 'none';
                previewWrap.classList.add('admin-upload__preview--empty');
            }
        }
    };
};
