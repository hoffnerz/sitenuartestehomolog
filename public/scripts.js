document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => {
                btn.classList.remove('active-tab');
                btn.classList.remove('bg-[#3B2C5B]', 'text-white');
                btn.classList.add('bg-gray-200', 'text-[#3B2C5B]');
            });

            button.classList.add('active-tab');
            button.classList.remove('bg-gray-200', 'text-[#3B2C5B]');
            button.classList.add('bg-[#3B2C5B]', 'text-white');

            tabPanes.forEach(pane => {
                pane.style.display = 'none';
                pane.classList.remove('active-pane');
            });

            const targetTab = button.dataset.tab;
            const activePane = document.getElementById(targetTab);
            if (activePane) {
                activePane.style.display = 'block';
                setTimeout(() => {
                    activePane.classList.add('active-pane');
                }, 10);
            }
        });
    });
    if (tabButtons.length > 0) {
        tabButtons[0].click();
    }

    function setupCarousel(carouselSelector) {
        const carouselContainer = document.querySelector(carouselSelector);
        if (!carouselContainer) return;

        const slides = carouselContainer.querySelectorAll('.carousel-slide');
        const prevButton = carouselContainer.querySelector('.carousel-button.prev');
        const nextButton = carouselContainer.querySelector('.carousel-button.next');
        const indicatorsContainer = carouselContainer.querySelector('.carousel-indicators');
        let currentSlide = 0;
        let autoSlideInterval;
        
        if (indicatorsContainer) {
            indicatorsContainer.innerHTML = '';
            slides.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.classList.add('indicator-dot');
                if (index === 0) dot.classList.add('active');
                dot.dataset.slideTo = index;
                dot.addEventListener('click', () => {
                    stopAutoSlide();
                    showSlide(index);
                    startAutoSlide();
                });
                indicatorsContainer.appendChild(dot);
            });
        }

        const indicatorDots = indicatorsContainer ? indicatorsContainer.querySelectorAll('.indicator-dot') : [];

        function showSlide(index) {
            slides.forEach((slide) => slide.classList.remove('active'));
            slides[index].classList.add('active');

            indicatorDots.forEach((dot) => dot.classList.remove('active'));
            if (indicatorDots[index]) indicatorDots[index].classList.add('active');
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        }

        function startAutoSlide() {
            autoSlideInterval = setInterval(nextSlide, 5000);
        }

        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }

        if (prevButton) prevButton.addEventListener('click', () => { stopAutoSlide(); prevSlide(); startAutoSlide(); });
        if (nextButton) nextButton.addEventListener('click', () => { stopAutoSlide(); nextSlide(); startAutoSlide(); });

        showSlide(currentSlide);
        startAutoSlide();
    }

    setupCarousel('#inicio .carousel-container');
    setupCarousel('#equipe .carousel-container');

    const menuToggleBtn = document.getElementById("menuToggleBtn");
    const headerMenuBtn = document.getElementById("headerMenuBtn");
    const sideMenuOverlay = document.getElementById("sideMenuOverlay");
    const closeMenuBtn = document.querySelector(".close-menu-btn");
    const navLinksSide = document.querySelectorAll(".nav-link-side");
    const mainHeader = document.getElementById("mainHeader");
    let lastScrollY = 0;

    function openSideMenu() {
        sideMenuOverlay.classList.add('open');
    }

    function closeSideMenu() {
        sideMenuOverlay.classList.remove('open');
    }

    window.onscroll = function() {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            menuToggleBtn.classList.add('show');
        } else {
            menuToggleBtn.classList.remove('show');
        }

        if (window.scrollY > lastScrollY && window.scrollY > mainHeader.offsetHeight) {
            mainHeader.classList.add('hidden-header');
        } else if (window.scrollY < lastScrollY) {
            mainHeader.classList.remove('hidden-header');
        }
        lastScrollY = window.scrollY;
    };
    
    menuToggleBtn.addEventListener("click", openSideMenu);
    headerMenuBtn.addEventListener("click", openSideMenu);
    closeMenuBtn.addEventListener("click", closeSideMenu);
    navLinksSide.forEach(link => {
        link.addEventListener("click", closeSideMenu);
    });
    sideMenuOverlay.addEventListener("click", function(event) {
        if (event.target === sideMenuOverlay) {
            closeSideMenu();
        }
    });

    // Lógica para Scroll Reveal (Animação ao rolar)
    const scrollElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                // Opcional: remover a classe quando o elemento sai da tela
                // entry.target.classList.remove('is-visible');
            }
        });
    }, {
        threshold: 0.1
    });
    scrollElements.forEach(element => {
        observer.observe(element);
    });

    const observerMenu = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute("id");
            const link = document.querySelector('.side-menu a[href="#' + id + '"]');
            if (link) {
                if (entry.isIntersecting) {
                    link.classList.add("font-bold", "underline");
                } else {
                    link.classList.remove("font-bold", "underline");
                }
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll("section[id]").forEach((section) => {
        observerMenu.observe(section);
    });
});