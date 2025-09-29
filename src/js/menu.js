/* 
 * Menu JS - Gestion de la navigation mobile et desktop
 * Fonctionnalités : Menu burger, navigation fluide, liens actifs
 */

(function() {
    'use strict';
    
    // Sélection des éléments DOM
    const menuToggle = document.getElementById('navbar-toggle');
    const menuNav = document.getElementById('navbar-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.querySelector('.header');
    
    // Créer l'overlay pour le menu mobile
    const overlay = document.createElement('div');
    overlay.className = 'navbar-overlay';
    document.body.appendChild(overlay);
    
    // Basculer l'état du menu mobile
    function toggleMenu() {
        const isOpen = menuNav.classList.contains('active');
        
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }
    
    // Ouvrir le menu
    function openMenu() {
        menuToggle.classList.add('active');
        menuNav.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Accessibilité
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.setAttribute('aria-label', 'Fermer le menu');
    }
    
    // Fermer le menu
    function closeMenu() {
        menuToggle.classList.remove('active');
        menuNav.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Accessibilité
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Ouvrir le menu');
    }
    
    // Navigation fluide vers les sections
    function smoothScrollTo(targetId) {
        const target = document.querySelector(targetId);
        if (target) {
            const headerHeight = header.offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
    
    // Mettre à jour le lien actif
    function updateActiveLink() {
        const scrollPosition = window.scrollY + header.offsetHeight + 50;
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                const section = document.querySelector(href);
                if (section) {
                    const sectionTop = section.offsetTop;
                    const sectionBottom = sectionTop + section.offsetHeight;
                    
                    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                        navLinks.forEach(l => l.classList.remove('active'));
                        link.classList.add('active');
                    }
                }
            }
        });
    }
    
    // Effet de scroll sur le header
    function handleHeaderScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    // Configuration des écouteurs d'événements
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }
    
    // Fermer le menu si on clique sur l'overlay
    overlay.addEventListener('click', closeMenu);
    
    // Navigation vers les sections
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                smoothScrollTo(href);
                closeMenu(); // Fermer le menu sur mobile
            }
        });
    });
    
    // Fermer le menu avec Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuNav.classList.contains('active')) {
            closeMenu();
        }
    });
    
    // Gestion du scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        handleHeaderScroll();
        
        // Débounce pour la mise à jour du lien actif
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateActiveLink, 10);
    });
    
    // Gestion du redimensionnement
    window.addEventListener('resize', () => {
        // Fermer le menu mobile si on passe en desktop
        if (window.innerWidth >= 768) {
            closeMenu();
        }
    });
    
    // Initialisation
    handleHeaderScroll();
    updateActiveLink();
    
    // Export pour les tests (si nécessaire)
    window.MenuModule = {
        toggleMenu,
        openMenu,
        closeMenu,
        smoothScrollTo,
        updateActiveLink
    };
    
})();