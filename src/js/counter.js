
/* 
 * Counter JS - Animation du compteur de financement avec API
 * Récupère les données réelles depuis l'API
 */

(function() {
    'use strict';
    
    // Configuration du compteur
    const ANIMATION_DURATION = 2000; // 2 secondes
    const API_URL = 'https://leetchi-mosquee-tarascon.ib-app.fr/amount';
    const UPDATE_INTERVAL = 60000; // 1 minute
    
    // Variables du compteur
    let counterElement = null;
    let progressBar = null;
    let currentAmount = 0;
    let targetAmount = 500000; // Objectif 5 000 000 €
    let animationStarted = false;
    
    // Récupérer les données depuis l'API
    async function fetchCounterData() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            
            if (data.ok && data.amount) {
                return Math.round(data.amount);
            }
            throw new Error('Données invalides');
        } catch (error) {
            console.warn('Erreur API:', error.message);
            // Fallback sur 0 si l'API ne répond pas
            return currentAmount || 0;
        }
    }
    
    // Initialiser le compteur
    async function initCounter() {
        counterElement = document.querySelector('.counter-current');
        progressBar = document.querySelector('.progress-fill');
        
        if (!counterElement) return;
        
        // Récupérer et afficher immédiatement la valeur de l'API
        currentAmount = await fetchCounterData();
        
        // Afficher directement sans animation
        displayCurrentValue();
        updateProgressBar();
        
        // Démarrer les mises à jour automatiques
        startAutoUpdate();
    }
    
    // Afficher la valeur actuelle
    function displayCurrentValue() {
        const counterDisplay = document.querySelector('.counter-current');
        if (counterDisplay) {
            counterDisplay.textContent = formatNumber(currentAmount);
        }
    }
    
    // Configuration de l'observer pour déclencher l'animation au scroll
    function setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !animationStarted) {
                        startCounterAnimation();
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.5 // Déclencher quand 50% de l'élément est visible
            });
            
            observer.observe(counterElement);
        } else {
            // Fallback pour navigateurs plus anciens
            startCounterAnimation();
        }
    }
    
    // Démarrer l'animation du compteur
    function startCounterAnimation() {
        if (animationStarted) return;
        animationStarted = true;
        
        // Animer le compteur
        animateCounter(0, currentAmount, ANIMATION_DURATION);
        
        // Animer la barre de progression
        animateProgressBar();
        
        // Ajouter les effets visuels
        addCounterEffects();
    }
    
    // Démarrer les mises à jour automatiques
    function startAutoUpdate() {
        // Mise à jour toutes les minutes 
        setInterval(updateFromAPI, UPDATE_INTERVAL);
    }
    
    // Mettre à jour depuis l'API
    async function updateFromAPI() {
        const newAmount = await fetchCounterData();
        
        if (newAmount !== currentAmount) {
            const oldAmount = currentAmount;
            currentAmount = newAmount;
            
            // Afficher directement la nouvelle valeur
            displayCurrentValue();
            
            // Mettre à jour la barre de progression
            updateProgressBar();
            
            console.log(`Compteur mis à jour: ${oldAmount} → ${newAmount} €`);
        }
    }
    
    // Animation du compteur numérique
    function animateCounter(start, end, duration) {
        const counterDisplay = document.querySelector('.counter-current');
        if (!counterDisplay) return;
        
        const startTimestamp = performance.now();
        const totalChange = end - start;
        
        function updateCounter(currentTimestamp) {
            const elapsed = currentTimestamp - startTimestamp;
            const progress = Math.min(elapsed / duration, 1);
            
            // Utiliser une fonction d'easing pour un effet plus naturel
            const easedProgress = easeOutCubic(progress);
            const currentValue = Math.round(start + (totalChange * easedProgress));
            
            // Formater le nombre avec des espaces pour les milliers
            counterDisplay.textContent = formatNumber(currentValue);
            
            // Ajouter un effet de pulsation pendant l'animation
            if (progress < 1) {
                counterDisplay.classList.add('counter-animate');
                requestAnimationFrame(updateCounter);
            } else {
                counterDisplay.classList.remove('counter-animate');
                // Animation terminée, déclencher l'effet final
                finalCounterEffect();
            }
        }
        
        requestAnimationFrame(updateCounter);
    }
    
    // Animation de la barre de progression
    function animateProgressBar() {
        if (!progressBar) return;
        
        const percentage = parseFloat(((currentAmount / targetAmount) * 100).toFixed(2));
        
        // Démarrer à 0% puis animer vers le pourcentage cible
        progressBar.style.width = '0%';
        
        setTimeout(() => {
            progressBar.style.width = `${percentage}%`;
        }, 100);
        
        // Mettre à jour le texte de pourcentage
        updatePercentageText(percentage);
    }
    
    // Mettre à jour la barre de progression (sans animation initiale)
    function updateProgressBar() {
        if (!progressBar) return;
        
        const percentage = parseFloat(((currentAmount / targetAmount) * 100).toFixed(2));
        progressBar.style.width = `${percentage}%`;
        
        // Mettre à jour le texte de pourcentage
        updatePercentageText(percentage);
    }
    
    // Mettre à jour le texte de pourcentage
    function updatePercentageText(percentage) {
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = `${percentage}% de l'objectif atteint`;
        }
    }
    
    // Ajouter des effets visuels pendant l'animation
    function addCounterEffects() {
        const fundingProgress = document.querySelector('.funding-progress');
        if (!fundingProgress) return;
        
        // Ajouter une classe pour les effets CSS
        fundingProgress.classList.add('animating');
        
        // Retirer la classe après l'animation
        setTimeout(() => {
            fundingProgress.classList.remove('animating');
        }, ANIMATION_DURATION + 500);
    }
    
    // Effet final quand l'animation est terminée
    function finalCounterEffect() {
        const counterDisplay = document.querySelector('.counter-current');
        if (!counterDisplay) return;
        
        // Effet de brillance
        counterDisplay.style.transform = 'scale(1.05)';
        counterDisplay.style.transition = 'transform 0.3s ease-out';
        
        setTimeout(() => {
            counterDisplay.style.transform = 'scale(1)';
        }, 300);
        
        // Ajouter une classe pour d'éventuels effets CSS
        counterDisplay.classList.add('animation-complete');
    }
    
    // Fonction d'easing pour une animation plus naturelle
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    // Formater les nombres avec des espaces pour les milliers
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    
    // Mettre à jour le compteur (fonction utilitaire)
    function updateCounter(newCurrent, newTarget) {
        if (newCurrent !== undefined) {
            currentAmount = newCurrent;
            counterElement.dataset.current = newCurrent;
        }
        
        if (newTarget !== undefined) {
            targetAmount = newTarget;
            counterElement.dataset.target = newTarget;
            
            // Mettre à jour l'affichage du target
            const targetDisplay = document.querySelector('.counter-target');
            if (targetDisplay) {
                targetDisplay.textContent = formatNumber(newTarget);
            }
        }
        
        // Recalculer et mettre à jour la barre de progression
        const percentage = Math.round((currentAmount / targetAmount) * 100);
        const progressText = document.querySelector('.progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${percentage}% de l'objectif atteint`;
        }
        
        // Redémarrer l'animation si nécessaire
        if (animationStarted) {
            animationStarted = false;
            startCounterAnimation();
        }
    }
    
    // Fonction pour animer vers une nouvelle valeur
    function animateToNewValue(newValue) {
        const counterDisplay = document.querySelector('.counter-current');
        if (!counterDisplay) return;
        
        const currentDisplayValue = parseInt(counterDisplay.textContent.replace(/\s/g, '')) || 0;
        animateCounter(currentDisplayValue, newValue, 1000);
    }
    
    // Gestion des erreurs
    function handleCounterError(error) {
        console.warn('Erreur dans le compteur:', error);
        
        // Affichage de fallback en cas d'erreur
        const counterDisplay = document.querySelector('.counter-current');
        if (counterDisplay && currentAmount) {
            counterDisplay.textContent = formatNumber(currentAmount);
        }
    }
    
    // Event listeners pour les mises à jour manuelles (développement)
    function setupDevelopmentTools() {
        // Seulement en développement
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.updateCounterValue = updateCounter;
            window.animateToNewValue = animateToNewValue;
        }
    }
    
    // Initialisation
    document.addEventListener('DOMContentLoaded', () => {
        try {
            initCounter();
            setupDevelopmentTools();
        } catch (error) {
            handleCounterError(error);
        }
    });
    
    // Export pour les tests et l'utilisation externe
    window.CounterModule = {
        updateCounter,
        animateToNewValue,
        startCounterAnimation,
        formatNumber,
        fetchCounterData,
        updateFromAPI,
        getCurrentAmount: () => currentAmount,
        getTargetAmount: () => targetAmount
    };
    
})();