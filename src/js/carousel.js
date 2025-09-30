

// ========================= CAROUSEL START =========================
document.addEventListener('DOMContentLoaded', function() {

    // Fonction pour initialiser un carousel indépendant
    function initCarousel({
        trackId,
        prevBtnId,
        nextBtnId,
        dotsId,
        containerId,
        lightboxGroup
    }) {
        const carousel = {
            track: document.getElementById(trackId),
            prevBtn: document.getElementById(prevBtnId),
            nextBtn: document.getElementById(nextBtnId),
            dotsContainer: document.getElementById(dotsId),
            container: containerId ? document.getElementById(containerId) : null,
            slides: [],
            currentIndex: 0,
            slidesPerView: 3,
            totalSlides: 0,
            lightboxGroup: lightboxGroup,

            init() {
                if (!this.track) return;
                this.slides = Array.from(this.track.querySelectorAll('.carousel-slide'));
                this.totalSlides = this.slides.length;
                this.updateSlidesPerView();
                this.createDots();
                this.bindEvents();
                this.updateCarousel();
                window.addEventListener('resize', () => {
                    this.updateSlidesPerView();
                    this.updateCarousel();
                });
            },


            updateSlidesPerView() {
                const width = window.innerWidth;
                if (width <= 768) {
                    this.slidesPerView = 1;
                } else if (width <= 1024) {
                    this.slidesPerView = 2;
                } else {
                    this.slidesPerView = 3;
                }
                // Correction : recalcule le nombre de dots et ajuste l’index si besoin
                const maxIndex = Math.max(0, this.totalSlides - this.slidesPerView);
                if (this.currentIndex > maxIndex) {
                    this.currentIndex = maxIndex;
                }
                this.createDots();
            },

            createDots() {
                if (!this.dotsContainer) return;
                this.dotsContainer.innerHTML = '';
                const maxIndex = Math.max(0, this.totalSlides - this.slidesPerView);
                const totalDots = maxIndex + 1;
                for (let i = 0; i < totalDots; i++) {
                    const dot = document.createElement('button');
                    dot.className = 'carousel-dot';
                    dot.setAttribute('aria-label', `Aller à la slide ${i + 1}`);
                    dot.addEventListener('click', () => {
                        this.goToSlide(i);
                    });
                    this.dotsContainer.appendChild(dot);
                }
                // Correction : met à jour l’état actif après création
                this.updateDots();
            },

            bindEvents() {
                if (this.prevBtn) {
                    this.prevBtn.addEventListener('click', () => this.prevSlide());
                }
                if (this.nextBtn) {
                    this.nextBtn.addEventListener('click', () => this.nextSlide());
                }
                // Click sur slide : n'ouvre que le lightbox du bon groupe
                this.slides.forEach((slide, index) => {
                    slide.addEventListener('click', () => {
                        if (typeof lightbox !== 'undefined' && lightbox.openGroup) {
                            lightbox.openGroup(this.lightboxGroup, index);
                        }
                    });
                });
            },

            prevSlide() {
                this.currentIndex = this.currentIndex <= 0 
                    ? this.totalSlides - this.slidesPerView 
                    : this.currentIndex - 1;
                this.updateCarousel();
            },

            nextSlide() {
                this.currentIndex = this.currentIndex >= this.totalSlides - this.slidesPerView 
                    ? 0 
                    : this.currentIndex + 1;
                this.updateCarousel();
            },

            goToSlide(index) {
                const maxIndex = Math.max(0, this.totalSlides - this.slidesPerView);
                this.currentIndex = Math.max(0, Math.min(index, maxIndex));
                this.updateCarousel();
            },

            updateCarousel() {
                if (!this.track) return;
                const maxIndex = Math.max(0, this.totalSlides - this.slidesPerView);
                if (this.currentIndex > maxIndex) {
                    this.currentIndex = maxIndex;
                }
                const slideWidth = 100 / this.slidesPerView;
                const translateX = -(this.currentIndex * slideWidth);
                this.track.style.transform = `translateX(${translateX}%)`;
                this.slides.forEach(slide => {
                    slide.style.flexBasis = `${slideWidth}%`;
                });
                this.updateDots();
            },

            updateDots() {
                const dots = this.dotsContainer?.querySelectorAll('.carousel-dot');
                if (!dots) return;
                const maxIndex = Math.max(0, this.totalSlides - this.slidesPerView);
                const currentDotIndex = Math.min(this.currentIndex, maxIndex);
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentDotIndex);
                });
            }
        };
        carousel.init();
        return carousel;
    }

    // Initialisation de chaque carousel indépendant
    const carousels = [
        {
            trackId: 'carousel-track-plans',
            prevBtnId: 'carousel-prev-plans',
            nextBtnId: 'carousel-next-plans',
            dotsId: 'carousel-dots-plans',
            containerId: 'carousel-container-plans',
            lightboxGroup: 'plans'
        },
        {
            trackId: 'carousel-track-galerie',
            prevBtnId: 'carousel-prev-galerie',
            nextBtnId: 'carousel-next-galerie',
            dotsId: 'carousel-dots-galerie',
            containerId: 'carousel-container-galerie',
            lightboxGroup: 'galerie'
        }
    ];

    const carouselInstances = carousels.map(initCarousel);


    // Lightbox multi-groupe : chaque carousel n’ouvre que ses images
    const lightbox = {
        element: document.getElementById('lightbox'),
        image: document.getElementById('lightbox-image'),
        caption: document.getElementById('lightbox-caption'),
        closeBtn: document.getElementById('lightbox-close'),
        prevBtn: document.getElementById('lightbox-prev'),
        nextBtn: document.getElementById('lightbox-next'),
        overlay: null,
        currentIndex: 0,
        images: [],
        group: null,

        init() {
            if (!this.element) return;
            this.overlay = this.element.querySelector('.lightbox-overlay');
            this.bindEvents();
        },

        bindEvents() {
            if (this.closeBtn) {
                this.closeBtn.addEventListener('click', () => this.close());
            }
            if (this.overlay) {
                this.overlay.addEventListener('click', () => this.close());
            }
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => this.prev());
            }
            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => this.next());
            }
            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (!this.element.classList.contains('active')) return;
                switch(e.key) {
                    case 'Escape':
                        this.close();
                        break;
                    case 'ArrowLeft':
                        this.prev();
                        break;
                    case 'ArrowRight':
                        this.next();
                        break;
                }
            });
        },

        // Ouvre le lightbox pour un groupe d’images (plans ou galerie)
        openGroup(group, index) {
            this.group = group;
            // Sélectionne uniquement les images du bon carousel
            let selector = '';
            if (group === 'plans') {
                selector = '#carousel-track-plans .carousel-image';
            } else if (group === 'galerie') {
                selector = '#carousel-track-galerie .carousel-image';
            }
            this.images = Array.from(document.querySelectorAll(selector)).map(img => ({
                src: img.src,
                alt: img.alt,
                caption: img.parentElement.querySelector('.slide-caption')?.textContent || img.alt
            }));
            this.currentIndex = index;
            this.updateContent();
            this.element.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

        close() {
            this.element.classList.remove('active');
            document.body.style.overflow = '';
        },

        prev() {
            this.currentIndex = this.currentIndex <= 0 
                ? this.images.length - 1 
                : this.currentIndex - 1;
            this.updateContent();
        },

        next() {
            this.currentIndex = this.currentIndex >= this.images.length - 1 
                ? 0 
                : this.currentIndex + 1;
            this.updateContent();
        },

        updateContent() {
            if (!this.images[this.currentIndex]) return;
            const currentImage = this.images[this.currentIndex];
            if (this.image) {
                this.image.src = currentImage.src;
                this.image.alt = currentImage.alt;
            }
            if (this.caption) {
                this.caption.textContent = currentImage.caption;
            }
        }
    };


    // Initialiser le lightbox (inchangé)
    lightbox.init();

    // Auto-play pour chaque carousel (optionnel)
    let autoplayIntervals = [];
    function startAutoplay(carouselInstance) {
        return setInterval(() => {
            if (!lightbox.element.classList.contains('active')) {
                carouselInstance.nextSlide();
            }
        }, 5000);
    }
    function stopAutoplay(intervalId) {
        clearInterval(intervalId);
    }
    // Démarrer l'autoplay pour chaque carousel
    carouselInstances.forEach((carouselInstance, idx) => {
        const intervalId = startAutoplay(carouselInstance);
        autoplayIntervals.push(intervalId);
        // Pause autoplay sur hover
        if (carouselInstance.container) {
            carouselInstance.container.addEventListener('mouseenter', () => stopAutoplay(intervalId));
            carouselInstance.container.addEventListener('mouseleave', () => {
                autoplayIntervals[idx] = startAutoplay(carouselInstance);
            });
        }
    });
});
// ========================= CAROUSEL END =========================