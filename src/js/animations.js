/* 
 * Scroll Animations JS - Animations au défilement
 * Gestion des animations lors du scroll de la page
 */

(function() {
    'use strict';
    
    // Configuration
    const config = {
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };
    
    // Observer pour les animations
    let scrollObserver;
    
    // Initialiser les animations au scroll
    function initScrollAnimations() {
        // Vérifier le support de IntersectionObserver
        if (!('IntersectionObserver' in window)) {
            // Fallback pour les navigateurs plus anciens
            const elements = document.querySelectorAll('.scroll-animate');
            elements.forEach(el => el.classList.add('in-view'));
            return;
        }
        
        // Créer l'observer
        scrollObserver = new IntersectionObserver(handleIntersection, config);
        
        // Observer tous les éléments avec la classe scroll-animate
        const animatedElements = document.querySelectorAll('.scroll-animate');
        animatedElements.forEach(el => {
            scrollObserver.observe(el);
            
            // Ajouter un délai d'animation pour un effet en cascade
            const delay = Array.from(el.parentNode.children).indexOf(el) * 100;
            el.style.animationDelay = `${delay}ms`;
        });
    }
    
    // Gérer l'intersection des éléments
    function handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // L'élément entre dans la zone visible
                entry.target.classList.add('in-view');
                
                // Optionnel : arrêter d'observer une fois l'animation déclenchée
                // scrollObserver.unobserve(entry.target);
            } else {
                // Optionnel : relancer l'animation si l'élément sort de la vue
                // entry.target.classList.remove('in-view');
            }
        });
    }
    
    // Fonction pour ajouter des animations personnalisées
    function addCustomAnimations() {
        // Animation du compteur de financement
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            const progressObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const progress = entry.target.getAttribute('data-progress');
                        entry.target.style.width = `${progress}%`;
                        progressObserver.unobserve(entry.target);
                    }
                });
            });
            
            progressObserver.observe(progressFill);
        }
        
        // Animation des statistiques
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateNumber(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(stat);
        });
    }
    
    // Animer les nombres (compteur)
    function animateNumber(element) {
        const finalValue = element.textContent;
        const isNumeric = /^\d+/.test(finalValue);
        
        if (!isNumeric) return;
        
        const numValue = parseInt(finalValue.match(/\d+/)[0]);
        const suffix = finalValue.replace(/\d+/, '');
        const duration = 2000; // 2 secondes
        const startTime = performance.now();
        
        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            const currentValue = Math.floor(easeProgress * numValue);
            element.textContent = currentValue + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = finalValue; // Valeur finale exacte
            }
        }
        
        element.textContent = '0' + suffix;
        requestAnimationFrame(updateNumber);
    }
    
    // Effet parallax léger pour le hero
    function initParallaxEffect() {
        const heroImage = document.querySelector('.hero-image img');
        if (!heroImage) return;
        
        let ticking = false;
        
        function updateParallax() {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.3;
            
            heroImage.style.transform = `translateY(${parallax}px)`;
            ticking = false;
        }
        
        function requestParallaxUpdate() {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
    }
    
    // Gestion du header au scroll
    function initHeaderScroll() {
        const header = document.getElementById('header');
        if (!header) return;
        
        let lastScrollY = window.scrollY;
        let ticking = false;
        
        function updateHeader() {
            const scrollY = window.scrollY;
            
            if (scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Masquer/afficher le header selon la direction du scroll
            if (scrollY > lastScrollY && scrollY > 200) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollY = scrollY;
            ticking = false;
        }
        
        function requestHeaderUpdate() {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestHeaderUpdate, { passive: true });
    }
    
    // Smooth scroll pour les liens d'ancre
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const headerHeight = document.getElementById('header')?.offsetHeight || 0;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // Fonction de nettoyage
    function cleanup() {
        if (scrollObserver) {
            scrollObserver.disconnect();
        }
    }
    
    // Initialisation
    function init() {
        initScrollAnimations();
        addCustomAnimations();
        initParallaxEffect();
        initHeaderScroll();
        initSmoothScroll();
        
    }
    
    // Initialiser quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Nettoyage avant le déchargement de la page
    window.addEventListener('beforeunload', cleanup);
    
    // Exposer l'API publique
    window.ScrollAnimations = {
        init,
        cleanup,
        addScrollAnimation: (element) => {
            if (scrollObserver && element) {
                scrollObserver.observe(element);
            }
        }
    };
    
})();
