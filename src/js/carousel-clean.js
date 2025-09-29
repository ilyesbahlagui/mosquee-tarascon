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
        
        // Optimisation mobile
        if (window.innerWidth <= 768) {
            forceMobileLayout();
        }
    }
    
    /**
     * Met à jour le nombre de slides visibles selon la taille d'écran
     */
    function updateSlidesPerView() {
        const width = window.innerWidth;
        
        if (width <= 480) {
            slidesPerView = 1;
        } else if (width <= 768) {
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
     * Crée les indicateurs de navigation
     */
    function createIndicators() {
        if (!indicatorsContainer) return;
        
        indicatorsContainer.innerHTML = '';
        
        for (let i = 0; i <= maxSlideIndex; i++) {
            const indicator = document.createElement('button');
            indicator.className = 'carousel-indicator';
            indicator.setAttribute('aria-label', `Aller au slide ${i + 1}`);
            indicator.addEventListener('click', () => goToSlide(i));
            
            if (i === currentSlide) {
                indicator.classList.add('active');
            }
            
            indicatorsContainer.appendChild(indicator);
        }
    }
    
    // === FONCTIONS DE NAVIGATION ===
    
    /**
     * Va au slide précédent
     */
    function prevSlide() {
        if (currentSlide > 0) {
            currentSlide--;
            updateCarousel();
        }
    }
    
    /**
     * Va au slide suivant
     */
    function nextSlide() {
        if (currentSlide < maxSlideIndex) {
            currentSlide++;
            updateCarousel();
        }
    }
    
    /**
     * Va à un slide spécifique
     * @param {number} index - Index du slide
     */
    function goToSlide(index) {
        if (index >= 0 && index <= maxSlideIndex) {
            currentSlide = index;
            updateCarousel();
        }
    }
    
    /**
     * Met à jour l'affichage du carousel
     */
    function updateCarousel() {
        if (!track) return;
        
        const slideWidth = 100 / slidesPerView;
        const translateX = -currentSlide * slideWidth;
        
        track.style.transform = `translateX(${translateX}%)`;
        
        // Mise à jour des indicateurs
        updateIndicators();
        
        // Mise à jour des boutons de navigation
        updateNavigationButtons();
    }
    
    /**
     * Met à jour l'état des indicateurs
     */
    function updateIndicators() {
        const indicators = indicatorsContainer?.querySelectorAll('.carousel-indicator');
        indicators?.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
    }
    
    /**
     * Met à jour l'état des boutons de navigation
     */
    function updateNavigationButtons() {
        if (prevBtn) {
            prevBtn.disabled = currentSlide === 0;
            prevBtn.style.opacity = currentSlide === 0 ? '0.5' : '1';
        }
        
        if (nextBtn) {
            nextBtn.disabled = currentSlide === maxSlideIndex;
            nextBtn.style.opacity = currentSlide === maxSlideIndex ? '0.5' : '1';
        }
    }
    
    // === GESTION DES ÉVÉNEMENTS ===
    
    /**
     * Configure tous les écouteurs d'événements
     */
    function setupEventListeners() {
        // Boutons de navigation
        prevBtn?.addEventListener('click', prevSlide);
        nextBtn?.addEventListener('click', nextSlide);
        
        // Navigation clavier
        document.addEventListener('keydown', handleKeydown);
        
        // Navigation tactile
        track?.addEventListener('touchstart', handleTouchStart, { passive: true });
        track?.addEventListener('touchmove', handleTouchMove, { passive: true });
        track?.addEventListener('touchend', handleTouchEnd, { passive: true });
        
        // Redimensionnement de fenêtre
        window.addEventListener('resize', handleResize);
    }
    
    /**
     * Gestion des touches clavier
     * @param {KeyboardEvent} e - Événement clavier
     */
    function handleKeydown(e) {
        if (e.target.closest('#gallery-carousel')) {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    prevSlide();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextSlide();
                    break;
            }
        }
    }
    
    /**
     * Début du toucher
     * @param {TouchEvent} e - Événement tactile
     */
    function handleTouchStart(e) {
        startX = e.touches[0].clientX;
        isDragging = true;
    }
    
    /**
     * Mouvement du toucher
     * @param {TouchEvent} e - Événement tactile
     */
    function handleTouchMove(e) {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
    }
    
    /**
     * Fin du toucher
     */
    function handleTouchEnd() {
        if (!isDragging) return;
        
        const diffX = startX - currentX;
        const threshold = 50;
        
        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        
        isDragging = false;
    }
    
    /**
     * Gestion du redimensionnement avec debounce
     */
    let resizeTimeout;
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const oldSlidesPerView = slidesPerView;
            updateSlidesPerView();
            
            if (oldSlidesPerView !== slidesPerView) {
                createIndicators();
                currentSlide = 0;
            }
            
            updateCarousel();
            
            // Optimisation mobile/desktop
            if (window.innerWidth <= 768) {
                forceMobileLayout();
            } else {
                resetDesktopLayout();
            }
        }, 250);
    }
    
    // === OPTIMISATIONS RESPONSIVE ===
    
    /**
     * Force le layout mobile pour une image par vue
     */
    function forceMobileLayout() {
        const items = track?.querySelectorAll('.gallery-item');
        items?.forEach(item => {
            item.style.flex = '0 0 100%';
            item.style.maxWidth = '100%';
            item.style.width = '100%';
            item.style.minWidth = '100%';
        });
        if (track) track.style.gap = '0px';
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
        });
        if (track) track.style.gap = '';
    }
    
    // === INITIALISATION ===
    
    /**
     * Point d'entrée principal - initialise le carousel quand le DOM est prêt
     */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initCarousel);
        } else {
            initCarousel();
        }
    }
    
    // Démarrage automatique
    init();
    
    // Export pour les tests (optionnel)
    window.CarouselModule = {
        goToSlide,
        nextSlide,
        prevSlide,
        updateCarousel
    };
    
})();
