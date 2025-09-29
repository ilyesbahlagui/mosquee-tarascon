/* 
 * Carousel JS - Gestionnaire de galerie moderne et responsive
 * Fonctionnalités : Navigation tactile, clavier, responsive, indicateurs
 */

(function() {
    'use strict';
    
    // === VARIABLES ET CONFIGURATION ===
    
    // Sélection des éléments DOM
    const carousel = document.getElementById('gallery-carousel');
    const track = document.getElementById('carousel-track');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const indicatorsContainer = document.getElementById('carousel-indicators');
    
    // Variables d'état du carousel
    let currentSlide = 0;
    let slidesPerView = 3;
    let totalSlides = 0;
    let maxSlideIndex = 0;
    
    // Variables pour la navigation tactile
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    // === FONCTIONS D'INITIALISATION ===
    
    /**
     * Initialise le carousel et tous ses composants
     */
    function initCarousel() {
        if (!carousel || !track) return;
        
        // Compter les slides disponibles
        const slides = track.querySelectorAll('.gallery-item');
        totalSlides = slides.length;
        
        // Configuration initiale
        updateSlidesPerView();
        createIndicators();
        setupEventListeners();
        updateCarousel();
    }
    
    /**
     * Met à jour le nombre de slides visibles selon la taille d'écran
     */
    function updateSlidesPerView() {
        const width = window.innerWidth;
        
        if (width <= 768) {
            slidesPerView = 1;
        } else if (width <= 1024) {
            slidesPerView = 2;
        } else {
            slidesPerView = 3;
        }
        
        maxSlideIndex = Math.max(0, totalSlides - slidesPerView);
        currentSlide = Math.min(currentSlide, maxSlideIndex);
    }
    
    /**
     * Force le layout mobile pour une seule image visible
     */
    function forceMobileLayout() {
        const items = track?.querySelectorAll('.gallery-item');
        items?.forEach((item, index) => {
            // Première image : visible et centrée
            if (index === 0) {
                item.style.flex = '0 0 100%';
                item.style.maxWidth = '100%';
                item.style.width = '100%';
                item.style.minWidth = '100%';
                item.style.display = 'block';
                item.style.opacity = '1';
            } else {
                // Autres images : masquées complètement
                item.style.display = 'none';
                item.style.opacity = '0';
            }
        });
        
        if (track) {
            track.style.gap = '0px';
            track.style.transform = 'translateX(0px)';
            track.style.justifyContent = 'center';
        }
        
        // Forcer le slide actuel à 0 sur mobile
        currentSlide = 0;
        updateIndicators();
    }
    
    /**
     * Réinitialise le layout desktop
     */
    function resetDesktopLayout() {
        const items = track?.querySelectorAll('.gallery-item');
        items?.forEach(item => {
            item.style.flex = '';
            item.style.maxWidth = '';
            item.style.width = '';
            item.style.minWidth = '';
            item.style.display = '';
            item.style.opacity = '';
        });
        
        if (track) {
            track.style.gap = '';
            track.style.justifyContent = '';
        }
    }
    
    // === FONCTIONS DE NAVIGATION ===
    
    /**
     * Met à jour la position du carousel et l'affichage
     */
    function updateCarousel() {
        if (!track) return;
        
        // Calcul de la position
        const slideWidth = 100 / slidesPerView;
        const translateX = -(currentSlide * slideWidth);
        
        track.style.transform = `translateX(${translateX}%)`;
        
        updateNavigationButtons();
        updateIndicators();
    }
    
    /**
     * Navigation vers le slide suivant
     */
    function nextSlide() {
        if (currentSlide < maxSlideIndex) {
            currentSlide++;
            updateCarousel();
        }
    }
    
    /**
     * Navigation vers le slide précédent
     */
    function prevSlide() {
        if (currentSlide > 0) {
            currentSlide--;
            updateCarousel();
        }
    }
    
    /**
     * Navigation vers un slide spécifique
     * @param {number} index - Index du slide cible
     */
    function goToSlide(index) {
        if (index >= 0 && index <= maxSlideIndex) {
            currentSlide = index;
            updateCarousel();
        }
    }
    
    // === FONCTIONS D'INTERFACE ===
    
    /**
     * Met à jour l'état des boutons de navigation
     */
    function updateNavigationButtons() {
        if (prevBtn) {
            prevBtn.disabled = currentSlide === 0;
            prevBtn.style.opacity = currentSlide === 0 ? '0.5' : '1';
        }
        
        if (nextBtn) {
            nextBtn.disabled = currentSlide >= maxSlideIndex;
            nextBtn.style.opacity = currentSlide >= maxSlideIndex ? '0.5' : '1';
        }
    }
    
    /**
     * Crée les indicateurs de position
     */
    function createIndicators() {
        if (!indicatorsContainer) return;
        
        indicatorsContainer.innerHTML = '';
        
        const indicatorCount = Math.max(1, maxSlideIndex + 1);
        
        for (let i = 0; i < indicatorCount; i++) {
            const indicator = document.createElement('button');
            indicator.className = 'carousel-indicator';
            indicator.setAttribute('aria-label', `Aller au slide ${i + 1}`);
            indicator.addEventListener('click', () => goToSlide(i));
            indicatorsContainer.appendChild(indicator);
        }
        
        updateIndicators();
    }
    
    /**
     * Met à jour l'état visuel des indicateurs
     */
    function updateIndicators() {
        if (!indicatorsContainer) return;
        
        const indicators = indicatorsContainer.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
    }
    
    // === GESTION DES ÉVÉNEMENTS ===
    
    /**
     * Configure tous les event listeners
     */
    function setupEventListeners() {
        // Boutons de navigation
        prevBtn?.addEventListener('click', prevSlide);
        nextBtn?.addEventListener('click', nextSlide);
        
        // Navigation tactile
        setupTouchEvents();
        
        // Navigation clavier
        setupKeyboardEvents();
        
        // Responsive
        setupResponsiveEvents();
    }
    
    /**
     * Configure la navigation tactile
     */
    function setupTouchEvents() {
        if (!track) return;
        
        track.addEventListener('touchstart', handleTouchStart, { passive: true });
        track.addEventListener('touchmove', handleTouchMove, { passive: true });
        track.addEventListener('touchend', handleTouchEnd, { passive: true });
        
        // Support souris pour desktop
        track.addEventListener('mousedown', handleMouseDown);
        track.addEventListener('mousemove', handleMouseMove);
        track.addEventListener('mouseup', handleMouseUp);
        track.addEventListener('mouseleave', handleMouseUp);
    }
    
    /**
     * Gère le début du touch/clic
     */
    function handleTouchStart(e) {
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        isDragging = true;
        track.style.transition = 'none';
    }
    
    function handleMouseDown(e) {
        e.preventDefault();
        handleTouchStart(e);
    }
    
    /**
     * Gère le mouvement du touch/souris
     */
    function handleTouchMove(e) {
        if (!isDragging) return;
        
        currentX = e.touches ? e.touches[0].clientX : e.clientX;
        const diff = startX - currentX;
        
        // Prévisualisation du mouvement
        const slideWidth = track.offsetWidth / slidesPerView;
        const currentTranslate = -(currentSlide * slideWidth);
        const newTranslate = currentTranslate - diff;
        
        track.style.transform = `translateX(${newTranslate}px)`;
    }
    
    function handleMouseMove(e) {
        e.preventDefault();
        handleTouchMove(e);
    }
    
    /**
     * Gère la fin du touch/clic
     */
    function handleTouchEnd() {
        if (!isDragging) return;
        
        isDragging = false;
        track.style.transition = '';
        
        const diff = startX - currentX;
        const threshold = 50;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0 && currentSlide < maxSlideIndex) {
                nextSlide();
            } else if (diff < 0 && currentSlide > 0) {
                prevSlide();
            } else {
                updateCarousel();
            }
        } else {
            updateCarousel();
        }
    }
    
    function handleMouseUp() {
        handleTouchEnd();
    }
    
    /**
     * Configure la navigation clavier
     */
    function setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (!carousel.matches(':hover') && !document.activeElement.closest('#gallery-carousel')) {
                return;
            }
            
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    prevSlide();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    goToSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    goToSlide(maxSlideIndex);
                    break;
            }
        });
    }
    
    /**
     * Configure les événements responsive
     */
    function setupResponsiveEvents() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const oldSlidesPerView = slidesPerView;
                updateSlidesPerView();
                
                if (oldSlidesPerView !== slidesPerView) {
                    createIndicators();
                    updateCarousel();
                }
            }, 250);
        });
    }
    
    // === INITIALISATION ===
    
    /**
     * Point d'entrée principal
     */
    function init() {
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initCarousel);
        } else {
            initCarousel();
        }
    }
    
    // Lancement de l'initialisation
    init();
    
})();
