/* 
 * Gallery JS - Gestionnaire de lightbox pour la galerie
 * Fonctionnalités : Ouverture d'images en grand, navigation dans le lightbox
 */

(function() {
    'use strict';
    
    // === VARIABLES ===
    
    // Sélection des éléments DOM
    const gallery = document.getElementById('gallery-carousel');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxClose = document.querySelector('.lightbox-close');
    
    // Variables d'état
    let currentImageIndex = 0;
    let galleryImages = [];
    
    // === INITIALISATION ===
    
    /**
     * Initialise la galerie et configure le lightbox
     */
    function initGallery() {
        if (!gallery) return;
        
        // Récupérer toutes les images du carousel
        galleryImages = Array.from(gallery.querySelectorAll('.gallery-item img'));
        
        // Configuration des images
        setupImages();
        
        // Exposer la fonction globalement pour compatibilité
        window.galleryLightbox = { open: openLightbox };
    }
    
    /**
     * Configure chaque image de la galerie
     */
    function setupImages() {
        galleryImages.forEach((img, index) => {
            // Accessibilité
            const container = img.parentElement;
            container.setAttribute('role', 'button');
            container.setAttribute('tabindex', '0');
            container.setAttribute('aria-label', `Ouvrir l'image ${index + 1} en grand`);
            
            // Gestion des erreurs de chargement
            img.addEventListener('error', () => handleImageError(img, index));
            
            // Configuration du lazy loading
            setupLazyLoading(img);
        });
    }
    
    /**
     * Gestion des erreurs d'image
     * @param {HTMLImageElement} img - Élément image
     * @param {number} index - Index de l'image
     */
    function handleImageError(img, index) {
        img.style.backgroundColor = '#f0f0f0';
        img.alt = 'Image non disponible';
    }
    
    /**
     * Configuration du lazy loading pour une image
     * @param {HTMLImageElement} img - Élément image
     */
    function setupLazyLoading(img) {
        // Affichage immédiat pour les images du carousel
        img.style.opacity = '1';
        img.classList.add('loaded');
        
        // Intersection Observer pour l'optimisation
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const lazyImage = entry.target;
                        lazyImage.classList.add('loaded');
                        lazyImage.style.opacity = '1';
                        imageObserver.unobserve(lazyImage);
                    }
                });
            });
            
            imageObserver.observe(img);
        }
    }
    
    // === FONCTIONS LIGHTBOX ===
    
    /**
     * Ouvre le lightbox avec l'image spécifiée
     * @param {number} index - Index de l'image à afficher
     */
    function openLightbox(index) {
        if (!lightbox || !lightboxImage) return;
        if (index < 0 || index >= galleryImages.length) return;
        
        currentImageIndex = index;
        const img = galleryImages[index];
        
        // Configuration de l'image du lightbox
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt || `Image ${index + 1}`;
        
        // Affichage du lightbox
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Focus pour l'accessibilité
        lightbox.focus();
        
        // Configuration des événements
        setupLightboxEvents();
    }
    
    /**
     * Ferme le lightbox
     */
    function closeLightbox() {
        if (!lightbox) return;
        
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
        
        // Nettoyage des événements
        cleanupLightboxEvents();
    }
    
    /**
     * Va à l'image suivante dans le lightbox
     */
    function nextLightboxImage() {
        if (currentImageIndex < galleryImages.length - 1) {
            openLightbox(currentImageIndex + 1);
        }
    }
    
    /**
     * Va à l'image précédente dans le lightbox
     */
    function prevLightboxImage() {
        if (currentImageIndex > 0) {
            openLightbox(currentImageIndex - 1);
        }
    }
    
    // === GESTION DES ÉVÉNEMENTS ===
    
    /**
     * Configure les événements du lightbox
     */
    function setupLightboxEvents() {
        // Bouton de fermeture
        lightboxClose?.addEventListener('click', closeLightbox);
        
        // Clic sur l'arrière-plan
        lightbox?.addEventListener('click', handleLightboxClick);
        
        // Navigation clavier
        document.addEventListener('keydown', handleLightboxKeydown);
    }
    
    /**
     * Nettoie les événements du lightbox
     */
    function cleanupLightboxEvents() {
        lightboxClose?.removeEventListener('click', closeLightbox);
        lightbox?.removeEventListener('click', handleLightboxClick);
        document.removeEventListener('keydown', handleLightboxKeydown);
    }
    
    /**
     * Gestion des clics sur le lightbox
     * @param {MouseEvent} e - Événement de clic
     */
    function handleLightboxClick(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    }
    
    /**
     * Gestion des touches clavier dans le lightbox
     * @param {KeyboardEvent} e - Événement clavier
     */
    function handleLightboxKeydown(e) {
        if (lightbox.style.display !== 'flex') return;
        
        switch(e.key) {
            case 'Escape':
                e.preventDefault();
                closeLightbox();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                prevLightboxImage();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextLightboxImage();
                break;
        }
    }
    
    /**
     * Gestion du redimensionnement de fenêtre
     */
    function handleResize() {
        // Logique de redimensionnement si nécessaire
    }
    
    // === POINT D'ENTRÉE ===
    
    /**
     * Initialise la galerie quand le DOM est prêt
     */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initGallery);
        } else {
            initGallery();
        }
        
        // Écouteur de redimensionnement
        window.addEventListener('resize', handleResize);
    }
    
    // Démarrage automatique
    init();
    
    // Export pour compatibilité
    window.GalleryModule = {
        openLightbox,
        closeLightbox
    };
    
})();
