// public/js/ui/beautyBar.js

class BeautyBar {
    constructor() {
        this.beautyScore = 0;
        this.container = null;
        this.valueText = null;

        this.init();
    }

    init() {
        if (document.getElementById('roman-beauty-bar')) return;

        // Container
        this.container = document.createElement('div');
        this.container.id = 'roman-beauty-bar';
        this.container.className = 'flex items-center bg-gray-900 border-2 border-pink-500 rounded p-1 shadow-lg cursor-pointer roman-ui mx-2';
        this.container.style.minWidth = '120px';
        this.container.title = 'Güzellik Puanı (Dekorasyonlar arttırır)';
        
        // Icon
        const iconSpan = document.createElement('span');
        iconSpan.className = 'text-xl mr-2 select-none beauty-icon';
        iconSpan.innerHTML = '✨'; // Sparkles icon
        this.iconSpan = iconSpan;
        
        // Value container
        const valContainer = document.createElement('div');
        valContainer.className = 'flex-grow text-center px-2 relative';
        
        // Value Text
        this.valueText = document.createElement('span');
        this.valueText.className = 'text-sm font-bold text-pink-300 text-shadow-md select-none tracking-wider';
        this.valueText.textContent = `Güzellik: ${this.beautyScore}`;

        valContainer.appendChild(this.valueText);
        
        this.container.appendChild(iconSpan);
        this.container.appendChild(valContainer);
        
        // Append to top bar
        const topBar = document.getElementById('roman-top-bar');
        if (topBar) {
            topBar.appendChild(this.container);
        } else {
            // Fallback
            this.container.classList.add('fixed', 'top-16', 'right-48');
            document.body.appendChild(this.container);
            
            // Re-check periodically
            const checkInterval = setInterval(() => {
                const tb = document.getElementById('roman-top-bar');
                if (tb) {
                    this.container.classList.remove('fixed', 'top-16', 'right-48');
                    tb.appendChild(this.container);
                    clearInterval(checkInterval);
                }
            }, 500);
        }

        // Expose to window.RomanUI
        window.RomanUI = window.RomanUI || {};
        window.RomanUI.BeautyBar = this;
    }

    setScore(value) {
        const oldScore = this.beautyScore;
        this.beautyScore = Math.max(0, value);
        
        this.valueText.textContent = `Güzellik: ${this.beautyScore}`;
        
        // Animate if score increased
        if (this.beautyScore > oldScore && window.gsap) {
            gsap.fromTo(this.container, 
                { scale: 1.1, boxShadow: '0 0 15px #ec4899' },
                { scale: 1, boxShadow: 'none', duration: 0.5, ease: "power2.out" }
            );
            
            // Animate icon
            gsap.fromTo(this.iconSpan,
                { rotation: -20, scale: 1.5 },
                { rotation: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
            );
        }
    }
    
    addScore(value) {
        this.setScore(this.beautyScore + value);
    }
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new BeautyBar());
} else {
    new BeautyBar();
}

export default BeautyBar;