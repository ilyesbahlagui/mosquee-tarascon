

// ========================= CAROUSEL START =========================
document.addEventListener('DOMContentLoaded', function() {
    const carousel = {
        track: document.getElementById('carousel-track'),
        prevBtn: document.getElementById('carousel-prev'),
        nextBtn: document.getElementById('carousel-next'),
        dotsContainer: document.getElementById('carousel-dots'),
        slides: [],
        currentIndex: 0,
        slidesPerView: 3,
        totalSlides: 0,

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
                dot.addEventListener('click', () => this.goToSlide(i));
                this.dotsContainer.appendChild(dot);
            }
        },

        bindEvents() {
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => this.prevSlide());
            }
            
            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => this.nextSlide());
            }

            // Add click event to slides for lightbox
            this.slides.forEach((slide, index) => {
                slide.addEventListener('click', () => {
                    lightbox.open(index);
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
            this.currentIndex = Math.max(0, Math.min(index, this.totalSlides - this.slidesPerView));
            this.updateCarousel();
        },

        updateCarousel() {
            if (!this.track) return;
            
            const slideWidth = 100 / this.slidesPerView;
            const translateX = -(this.currentIndex * slideWidth);
            
            this.track.style.transform = `translateX(${translateX}%)`;
            
            // Update slides flex-basis
            this.slides.forEach(slide => {
                slide.style.flexBasis = `${slideWidth}%`;
            });

            this.updateDots();
        },

        updateDots() {
            const dots = this.dotsContainer?.querySelectorAll('.carousel-dot');
            if (!dots) return;
            
            const maxIndex = Math.max(0, this.totalSlides - this.slidesPerView);
            const totalDots = maxIndex + 1;
            const currentDotIndex = Math.min(this.currentIndex, maxIndex);
            
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentDotIndex);
            });
        }
    };

    // Lightbox functionality
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

        init() {
            if (!this.element) return;
            
            this.overlay = this.element.querySelector('.lightbox-overlay');
            this.images = Array.from(document.querySelectorAll('.carousel-image')).map(img => ({
                src: img.src,
                alt: img.alt,
                caption: img.parentElement.querySelector('.slide-caption')?.textContent || img.alt
            }));
            
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

        open(index) {
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

    // Initialize carousel and lightbox
    carousel.init();
    lightbox.init();

    // Auto-play carousel (optional)
    let autoplayInterval;
    
    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            if (!lightbox.element.classList.contains('active')) {
                carousel.nextSlide();
            }
        }, 5000);
    }
    
    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    // Start autoplay
    startAutoplay();

    // Pause autoplay on hover
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopAutoplay);
        carouselContainer.addEventListener('mouseleave', startAutoplay);
    }
});
// ========================= CAROUSEL END =========================