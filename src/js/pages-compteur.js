class DonationCounter {
    constructor() {
        this.apiUrl = 'https://leetchi-mosquee-tarascon.ib-app.fr/amount';
        this.target = 500000;
        this.currentAmount = 0;
        this.isAnimating = false;
        
        this.elements = {
            amount: document.getElementById('amount'),
            progressFill: document.getElementById('progress-fill'),
            percentage: document.getElementById('percentage'),
            currentDisplay: document.getElementById('current-display'),
            lastUpdate: document.getElementById('last-update')
        };
        
        this.init();
        this.createFloatingParticles();
    }
    
    init() {
        this.fetchData();
        this.startPeriodicUpdate();
        this.addVisibilityListener();
    }
    
    async fetchData() {
        try {
            const response = await fetch(this.apiUrl);
            const data = await response.json();
            
            if (data.ok && typeof data.amount === 'number') {
                this.updateDisplay(data.amount, data.updatedAt);
            } else {
                console.warn('Invalid API response:', data);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
            // En cas d'erreur, on peut afficher une valeur par défaut ou garder la dernière valeur
        }
    }
    
    updateDisplay(newAmount, updatedAt) {
        const oldAmount = this.currentAmount;
        this.currentAmount = newAmount;
        
        // Animation du montant
        this.animateAmount(oldAmount, newAmount);
        
        // Mise à jour de la barre de progression
        this.updateProgressBar(newAmount);
        
        // Mise à jour du pourcentage
        this.updatePercentage(newAmount);
        
        // Mise à jour de l'heure
        this.updateLastUpdateTime(updatedAt);
        
        // Effet de célébration si augmentation significative
        if (newAmount > oldAmount + 100) {
            this.celebrate();
        }
    }
    
    animateAmount(from, to) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.elements.amount.classList.add('updating');
        
        const duration = 2000;
        const startTime = performance.now();
        const difference = to - from;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Fonction d'easing pour une animation plus naturelle
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentValue = from + (difference * easeOutCubic);
            
            this.elements.amount.textContent = this.formatNumber(currentValue);
            this.elements.currentDisplay.textContent = this.formatNumber(currentValue) + ' €';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.elements.amount.classList.remove('updating');
                this.isAnimating = false;
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    updateProgressBar(amount) {
        const percentage = Math.min((amount / this.target) * 100, 100);
        
        setTimeout(() => {
            this.elements.progressFill.style.width = percentage + '%';
        }, 500);
    }
    
    updatePercentage(amount) {
        const percentage = Math.min((amount / this.target) * 100, 100);
        setTimeout(() => {
            this.elements.percentage.textContent = percentage.toFixed(2) + '%';
        }, 1000);
    }
    
    updateLastUpdateTime(updatedAt) {
        if (updatedAt) {
            const date = new Date(updatedAt);
            const timeString = date.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            this.elements.lastUpdate.textContent = timeString;
        }
    }
    
    celebrate() {
        // Animation de célébration
        this.elements.percentage.classList.add('celebrating');
        
        // Créer des particules de célébration
        this.createConfetti();
        
        setTimeout(() => {
            this.elements.percentage.classList.remove('celebrating');
        }, 1000);
    }
    
    createConfetti() {
        const colors = ['#27ae60', '#3498db', '#e74c3c', '#f39c12', '#9b59b6'];
        
        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}vw;
                top: -10px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                animation: confetti-fall ${2 + Math.random() * 3}s linear forwards;
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }
    
    formatNumber(num) {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.round(num));
    }
    
    startPeriodicUpdate() {
        // Mise à jour toutes les minutes
        setInterval(() => {
            this.fetchData();
        }, 60000);
    }
    
    addVisibilityListener() {
        // Mise à jour quand l'onglet redevient visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.fetchData();
            }
        });
    }
    
    createFloatingParticles() {
        const particlesContainer = document.getElementById('particles');
        
        // Créer des particules en continu
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.addParticle(particlesContainer);
            }
        }, 800);
        
        // Créer quelques particules initiales
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.addParticle(particlesContainer);
            }, i * 200);
        }
    }
    
    addParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Taille aléatoire entre 2 et 6px
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Position horizontale aléatoire
        particle.style.left = Math.random() * 100 + '%';
        
        // Durée d'animation aléatoire entre 8 et 15 secondes
        const duration = Math.random() * 7 + 8;
        particle.style.animationDuration = duration + 's';
        
        // Délai aléatoire pour un effet plus naturel
        particle.style.animationDelay = Math.random() * 2 + 's';
        
        container.appendChild(particle);
        
        // Supprimer la particule après l'animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, (duration + 2) * 1000);
    }
}

// Styles CSS pour les confettis (ajoutés dynamiquement)
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new DonationCounter();
});

// Gestion des erreurs globales
window.addEventListener('error', (e) => {
    console.error('Erreur JavaScript:', e.error);
});

// Performance: préchargement des ressources critiques
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
        // Préparation des animations pour de meilleures performances
        document.body.style.willChange = 'transform';
    });
}