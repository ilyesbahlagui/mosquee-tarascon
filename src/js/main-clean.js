/* 
 * Main JS - Point d'entrée principal du site Mosquée de Tarascon
 * Initialise les modules et gère les fonctionnalités globales essentielles
 */

(function() {
    'use strict';
    
    // === CONFIGURATION ===
    
    const CONFIG = {
        scrollOffset: 80,
        debounceDelay: 250
    };
    
    // === FONCTIONS UTILITAIRES ===
    
    /**
     * Fonction de debounce pour optimiser les performances
     * @param {Function} func - Fonction à exécuter
     * @param {number} wait - Délai d'attente en ms
     * @returns {Function} - Fonction avec debounce
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Annonce un message aux lecteurs d'écran
     * @param {string} message - Message à annoncer
     */
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
    }
    
    // === GESTION DU SCROLL ===
    
    /**
     * Gestion fluide du scroll vers une section
     * @param {string} targetId - ID de la section cible
     */
    function smoothScrollTo(targetId) {
        const target = document.querySelector(targetId);
        if (!target) return;
        
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = target.offsetTop - headerHeight - CONFIG.scrollOffset;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
    
    /**
     * Met à jour les liens actifs selon la position de scroll
     */
    function updateActiveLinks() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSection = '';
        const scrollPosition = window.pageYOffset + 100;
        
        // Trouve la section actuelle
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        // Met à jour les liens de navigation
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    
    // === GESTION DES ÉVÉNEMENTS ===
    
    /**
     * Configuration des écouteurs d'événements globaux
     */
    function setupEventListeners() {
        // Scroll avec debounce pour les performances
        window.addEventListener('scroll', debounce(updateActiveLinks, CONFIG.debounceDelay));
        
        // Redimensionnement de fenêtre
        window.addEventListener('resize', debounce(handleResize, CONFIG.debounceDelay));
        
        // Navigation via les liens
        document.addEventListener('click', handleNavigation);
    }
    
    /**
     * Gestion des clics de navigation
     * @param {Event} e - Événement de clic
     */
    function handleNavigation(e) {
        const link = e.target.closest('a[href^=\"#\"]');
        if (!link) return;
        
        e.preventDefault();
        const targetId = link.getAttribute('href');
        smoothScrollTo(targetId);
        
        // Fermer le menu mobile si ouvert
        if (window.MenuModule?.closeMenu) {
            window.MenuModule.closeMenu();
        }
    }
    
    /**
     * Gestion du redimensionnement
     */
    function handleResize() {
        // Mise à jour de la détection mobile
        const isMobile = window.innerWidth < 768;
        document.documentElement.classList.toggle('mobile', isMobile);
        document.documentElement.classList.toggle('desktop', !isMobile);
    }
    
    // === INITIALISATION ===
    
    /**
     * Initialise l'application
     */
    function init() {
        // Configuration initiale
        handleResize();
        updateActiveLinks();
        
        // Configuration des événements
        setupEventListeners();
        
        // Export global pour les autres modules
        window.App = {
            smoothScrollTo,
            announceToScreenReader,
            CONFIG
        };
        
        // Classes CSS pour détection des capacités
        document.documentElement.classList.add('js-enabled');
    }
    
    // === POINT D'ENTRÉE ===
    
    /**
     * Démarre l'application quand le DOM est prêt
     */
    function start() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }
    
    // Démarrage automatique
    start();
    
})();
