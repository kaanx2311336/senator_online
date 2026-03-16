// public/js/ui/happinessBar.js

class HappinessBar {
    constructor() {
        this.happiness = 50; // Initial happiness
        this.container = null;
        this.barFill = null;
        this.valueText = null;

        this.init();
    }

    init() {
        if (document.getElementById('roman-happiness-bar')) return;

        // Container
        this.container = document.createElement('div');
        this.container.id = 'roman-happiness-bar';
        this.container.className = 'flex items-center bg-gray-900 border-2 border-yellow-500 rounded p-1 shadow-lg cursor-pointer roman-ui mx-2';
        this.container.style.width = '200px'; // Slightly smaller to fit top bar nicely
        
        // Icon
        const iconSpan = document.createElement('span');
        iconSpan.className = 'text-xl mr-2 select-none';
        iconSpan.textContent = '😊'; // Default icon
        this.iconSpan = iconSpan;
        
        // Bar Background
        const barBg = document.createElement('div');
        barBg.className = 'flex-grow h-4 bg-gray-700 rounded overflow-hidden relative border border-gray-600';

        // Bar Fill
        this.barFill = document.createElement('div');
        this.barFill.className = 'h-full w-full transition-all duration-300 ease-in-out happiness-gradient';
        this.barFill.style.width = `${this.happiness}%`;
        
        // Value Text
        this.valueText = document.createElement('span');
        this.valueText.className = 'absolute inset-0 flex items-center justify-center text-xs font-bold text-white text-shadow-md select-none';
        this.valueText.textContent = `Memnuniyet: ${this.happiness}%`;

        barBg.appendChild(this.barFill);
        barBg.appendChild(this.valueText);
        
        this.container.appendChild(iconSpan);
        this.container.appendChild(barBg);
        
        // Append to top bar
        const topBar = document.getElementById('roman-top-bar');
        if (topBar) {
            topBar.appendChild(this.container);
        } else {
            // Fallback if top bar is not ready (though it should be since it imports this)
            // We can retry or just append to body with some fixed position as fallback
            this.container.classList.add('fixed', 'top-16', 'right-4');
            document.body.appendChild(this.container);
            
            // Re-check periodically
            const checkInterval = setInterval(() => {
                const tb = document.getElementById('roman-top-bar');
                if (tb) {
                    this.container.classList.remove('fixed', 'top-16', 'right-4');
                    tb.appendChild(this.container);
                    clearInterval(checkInterval);
                }
            }, 500);
        }

        // Click handler to open Festival Panel (if exists)
        this.container.addEventListener('click', () => {
            if (window.RomanUI && window.RomanUI.FestivalPanel) {
                window.RomanUI.FestivalPanel.toggle();
            }
        });

        // Expose to window.RomanUI
        window.RomanUI = window.RomanUI || {};
        window.RomanUI.HappinessBar = this;
        
        this.updateVisuals();
    }

    setHappiness(value) {
        this.happiness = Math.max(0, Math.min(100, value));
        
        if (window.gsap) {
            gsap.to(this.barFill, {
                width: `${this.happiness}%`,
                duration: 0.5,
                ease: "power2.out",
                onUpdate: () => {
                    this.updateVisuals();
                }
            });
        } else {
            this.barFill.style.width = `${this.happiness}%`;
            this.updateVisuals();
        }
    }

    updateVisuals() {
        if (!this.valueText || !this.barFill) return;
        
        const currentWidth = parseFloat(this.barFill.style.width) || this.happiness;
        this.valueText.textContent = `Memnuniyet: ${Math.round(currentWidth)}%`;

        // Update color and icon based on happiness level
        if (currentWidth < 30) {
            this.barFill.style.backgroundColor = '#ef4444'; // Red
            this.iconSpan.textContent = '😠';
        } else if (currentWidth < 70) {
            this.barFill.style.backgroundColor = '#eab308'; // Yellow
            this.iconSpan.textContent = '😐';
        } else {
            this.barFill.style.backgroundColor = '#22c55e'; // Green
            this.iconSpan.textContent = '😊';
        }
    }
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new HappinessBar());
} else {
    new HappinessBar();
}

export default HappinessBar;