document.addEventListener('DOMContentLoaded', () => {

    const headerMenuBtn   = document.getElementById('headerMenuBtn');
    const sideMenuOverlay = document.getElementById('sideMenuOverlay');
    const closeMenuBtn    = document.querySelector('.close-menu-btn');
    const navLinksSide    = document.querySelectorAll('.nav-link-side');
    const mainHeader      = document.getElementById('mainHeader');

    function openSideMenu() {
        sideMenuOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        if (headerMenuBtn) headerMenuBtn.setAttribute('aria-expanded', 'true');
    }

    function closeSideMenu() {
        sideMenuOverlay.classList.remove('open');
        document.body.style.overflow = '';
        if (headerMenuBtn) headerMenuBtn.setAttribute('aria-expanded', 'false');
    }

    if (headerMenuBtn)   headerMenuBtn.addEventListener('click', openSideMenu);
    if (closeMenuBtn)    closeMenuBtn.addEventListener('click', closeSideMenu);
    if (sideMenuOverlay) {
        sideMenuOverlay.addEventListener('click', (e) => {
            if (e.target === sideMenuOverlay) closeSideMenu();
        });
    }
    navLinksSide.forEach(link => link.addEventListener('click', closeSideMenu));

    // Fechar menu com tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sideMenuOverlay && sideMenuOverlay.classList.contains('open')) {
            closeSideMenu();
        }
    });

    const menuToggleBtn = document.getElementById('menuToggleBtn');
    let lastScrollY = 0;
    let ticking = false;

    function handleScroll() {
        const currentScrollY = window.scrollY;

        // Botão flutuante (voltar ao topo / abrir menu)
        if (menuToggleBtn) {
            if (currentScrollY > 300) {
                menuToggleBtn.classList.add('show');
            } else {
                menuToggleBtn.classList.remove('show');
            }
        }

        // Ocultar header ao rolar para baixo
        if (mainHeader) {
            if (currentScrollY > lastScrollY && currentScrollY > mainHeader.offsetHeight) {
                mainHeader.classList.add('hidden-header');
            } else if (currentScrollY < lastScrollY) {
                mainHeader.classList.remove('hidden-header');
            }
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }, { passive: true });

    // Botão flutuante: rola ao topo ao clicar
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function setupHeroCarousel(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const slides         = container.querySelectorAll('.carousel-slide');
        const prevBtn        = container.querySelector('.carousel-button.prev');
        const nextBtn        = container.querySelector('.carousel-button.next');
        const indicatorsWrap = container.querySelector('.carousel-indicators');

        if (!slides.length) return;

        let current = 0;
        let autoInterval;

        // Recriar indicadores dinamicamente
        if (indicatorsWrap) {
            indicatorsWrap.innerHTML = '';
            slides.forEach((_, i) => {
                const dot = document.createElement('span');
                dot.className = 'indicator-dot' + (i === 0 ? ' active' : '');
                dot.dataset.slideTo = i;
                dot.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); });
                indicatorsWrap.appendChild(dot);
            });
        }

        function goTo(index) {
            slides[current].classList.remove('active');
            const dots = indicatorsWrap ? indicatorsWrap.querySelectorAll('.indicator-dot') : [];
            if (dots[current]) dots[current].classList.remove('active');

            current = (index + slides.length) % slides.length;
            slides[current].classList.add('active');
            if (dots[current]) dots[current].classList.add('active');
        }

        function startAuto() { autoInterval = setInterval(() => goTo(current + 1), 5000); }
        function stopAuto()  { clearInterval(autoInterval); }

        if (prevBtn) prevBtn.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });

        goTo(0);
        startAuto();
    }

    setupHeroCarousel('#inicio .hero-carousel-container');

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        scrollObserver.observe(el);
    });

    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes   = document.querySelectorAll('.tab-pane');

    if (tabButtons.length > 0) {
        function activateTab(button) {
            tabButtons.forEach(btn => {
                btn.classList.remove('active-tab');
                btn.setAttribute('aria-selected', 'false');
            });
            tabPanes.forEach(pane => {
                pane.style.display = 'none';
                pane.classList.remove('active-pane');
            });

            button.classList.add('active-tab');
            button.setAttribute('aria-selected', 'true');

            const targetId = button.dataset.tab;
            const target   = document.getElementById(targetId);
            if (target) {
                target.style.display = 'block';
                requestAnimationFrame(() => target.classList.add('active-pane'));
            }
        }

        tabButtons.forEach(btn => btn.addEventListener('click', () => activateTab(btn)));
        activateTab(tabButtons[0]);
    }

    // =========================================================
    // 6. ACESSIBILIDADE: MENU GLOBAL NO HEADER
    // =========================================================
    const accessibilityToggleBtn = document.getElementById('accessibilityToggleBtn');
    const accessibilityPanel = document.getElementById('accessibilityPanel');
    const accessibilityToggleBtnMobile = document.getElementById('accessibilityToggleBtnMobile');
    const accessibilityPanelMobile = document.getElementById('accessibilityPanelMobile');

    // Toggle do menu de acessibilidade (Desktop)
    if (accessibilityToggleBtn && accessibilityPanel) {
        accessibilityToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            accessibilityPanel.classList.toggle('hidden');
            accessibilityToggleBtn.setAttribute('aria-expanded', !accessibilityPanel.classList.contains('hidden'));
        });

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (!accessibilityToggleBtn.contains(e.target) && !accessibilityPanel.contains(e.target)) {
                accessibilityPanel.classList.add('hidden');
                accessibilityToggleBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Botões de acessibilidade (Desktop)
    const btnsAccessibilityHeader = document.querySelectorAll('.btn-accessibility-header');
    const btnContrastHeader = document.querySelector('.btn-contrast-header');

    let fontSizeMultiplier = parseFloat(localStorage.getItem('fontSizeMultiplier') || '1');
    document.documentElement.style.fontSize = (16 * fontSizeMultiplier) + 'px';

    btnsAccessibilityHeader.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            if (action === 'increase') fontSizeMultiplier = Math.min(1.5, fontSizeMultiplier + 0.1);
            else if (action === 'decrease') fontSizeMultiplier = Math.max(0.8, fontSizeMultiplier - 0.1);
            else fontSizeMultiplier = 1;
            document.documentElement.style.fontSize = (16 * fontSizeMultiplier) + 'px';
            localStorage.setItem('fontSizeMultiplier', fontSizeMultiplier);
        });
    });

    if (btnContrastHeader) {
        btnContrastHeader.addEventListener('click', function() {
            document.body.classList.toggle('high-contrast');
            localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
        });
    }

    // Botões de acessibilidade (Mobile)
    const btnsAccessibilityMobile = document.querySelectorAll('.btn-accessibility-mobile');
    const btnContrastMobile = document.querySelector('.btn-contrast-mobile');

    btnsAccessibilityMobile.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            if (action === 'increase') fontSizeMultiplier = Math.min(1.5, fontSizeMultiplier + 0.1);
            else if (action === 'decrease') fontSizeMultiplier = Math.max(0.8, fontSizeMultiplier - 0.1);
            else fontSizeMultiplier = 1;
            document.documentElement.style.fontSize = (16 * fontSizeMultiplier) + 'px';
            localStorage.setItem('fontSizeMultiplier', fontSizeMultiplier);
        });
    });

    if (btnContrastMobile) {
        btnContrastMobile.addEventListener('click', function() {
            document.body.classList.toggle('high-contrast');
            localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
        });
    }

    // Restaurar estado salvo
    if (localStorage.getItem('highContrast') === 'true') {
        document.body.classList.add('high-contrast');
    }

});
