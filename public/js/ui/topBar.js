// js/ui/topBar.js

const resourceMeta = {
    wood: { label: 'Odun', icon: '🌲', rate: '+5/dk' },
    wheat: { label: 'Buğday', icon: '🌾', rate: '+10/dk' },
    population: { label: 'Nüfus', icon: '🧑', rate: '+1/dk' },
    gold: { label: 'Altın', icon: '🪙', rate: '+2/dk' }
};

function initTopBar() {
    // Top bar initialization should load state from resourceManager but to avoid circular import 
    // when resourceManager first loads, we will dynamically fetch it here.
    import('./resourceManager.js').then(({ getResources }) => {
        const currentResources = getResources();
        const topBar = document.createElement('div');
        topBar.id = 'roman-top-bar';
        topBar.className = 'fixed top-0 left-0 w-full bg-red-800 border-b-2 border-yellow-500 gold-border p-2 md:p-3 flex flex-wrap md:flex-nowrap justify-around items-center z-50 roman-ui shadow-lg text-white font-medium tracking-wide';
        
        for (const [key, meta] of Object.entries(resourceMeta)) {
            const item = document.createElement('div');
            item.className = 'flex flex-col md:flex-row items-center relative mx-1 md:mx-2 min-w-[70px] md:min-w-auto';
            
            const topRow = document.createElement('div');
            topRow.className = 'flex items-center';
            
            const iconSpan = document.createElement('span');
            iconSpan.className = 'resource-icon text-xl md:text-2xl z-10';
            iconSpan.textContent = meta.icon;
            
            const valueSpan = document.createElement('span');
            valueSpan.id = `resource-${key}`;
            valueSpan.className = 'resource-value ml-1 md:ml-2 z-10 relative overflow-hidden inline-block';
            
            const innerTextSpan = document.createElement('span');
            innerTextSpan.className = 'inline-block';
            innerTextSpan.textContent = `${meta.label}: ${currentResources[key]}`;
            valueSpan.appendChild(innerTextSpan);
            
            topRow.appendChild(iconSpan);
            topRow.appendChild(valueSpan);

            item.appendChild(topRow);
            
            // Add event listener to open production panel
            item.addEventListener('click', () => {
                if (window.RomanUI && window.RomanUI.ProductionPanel) {
                    window.RomanUI.ProductionPanel.toggle();
                }
            });
            item.style.cursor = 'pointer';
            item.title = 'Üretim Özetini Gör';
            item.classList.add('hover:bg-red-900', 'rounded', 'transition-colors', 'p-1');
            
            // Production rate element
            const rateSpan = document.createElement('span');
            rateSpan.id = `resource-rate-${key}`;
            rateSpan.className = 'text-[10px] md:text-xs text-green-400 font-bold ml-0 md:ml-2 mt-1 md:mt-0 drop-shadow-md';
            rateSpan.textContent = meta.rate;
            item.appendChild(rateSpan);
            
            topBar.appendChild(item);
        }
        
        document.body.appendChild(topBar);
    });
}
export function updateResource(type, value, diff = 0) {
    if (resourceMeta[type] !== undefined) {
        const valueContainer = document.getElementById(`resource-${type}`);
        if (valueContainer) {
            const oldSpan = valueContainer.querySelector('span');
            const newSpan = document.createElement('span');
            newSpan.className = 'inline-block absolute left-0';
            newSpan.textContent = `${resourceMeta[type].label}: ${value}`;

            // Ensure valueContainer is relatively positioned for absolute children
            if (getComputedStyle(valueContainer).position === 'static') {
                valueContainer.style.position = 'relative';
            }
            
            // GSAP animation
            if (window.gsap) {
                const isIncrease = diff > 0;
                
                // Position new element
                gsap.set(newSpan, { y: isIncrease ? 20 : -20, opacity: 0 });
                valueContainer.appendChild(newSpan);
                
                // Animate old element out
                gsap.to(oldSpan, { y: isIncrease ? -20 : 20, opacity: 0, duration: 0.3, onComplete: () => {
                    oldSpan.remove();
                }});
                
                // Animate new element in
                gsap.to(newSpan, { y: 0, opacity: 1, duration: 0.3, onComplete: () => {
                    newSpan.style.position = 'relative';
                }});
            } else {
                oldSpan.textContent = `${resourceMeta[type].label}: ${value}`;
            }
        }
    } else {
        console.warn(`Resource type "${type}" not found.`);
    }
}

export function flashResource(type) {
    if (resourceMeta[type] !== undefined) {
        const valueSpan = document.getElementById(`resource-${type}`);
        if (valueSpan) {
            if (window.gsap) {
                // Flash red with GSAP
                gsap.to(valueSpan, {
                    color: '#ef4444', // Tailwind red-500
                    textShadow: '0 0 8px #ef4444',
                    duration: 0.1,
                    yoyo: true,
                    repeat: 3,
                    onComplete: () => {
                        // Revert to original styling defined in CSS
                        gsap.set(valueSpan, { clearProps: 'all' });
                    }
                });
            } else {
                // Fallback class if GSAP is not available
                valueSpan.classList.add('flash-red');
                setTimeout(() => {
                    valueSpan.classList.remove('flash-red');
                }, 400);
            }
        }
    }
}

// Automatically initialize when the module is loaded (if DOM is ready)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTopBar);
} else {
    initTopBar();
}
// Inject Loading Screen
import './loadingScreen.js';

// Inject Faith Bar
import './faithBar.js';

// Inject Buff Panel
import './buffPanel.js';

// Inject Happiness Bar
import './happinessBar.js';

// Inject Festival Panel
import './festivalPanel.js';

// Inject Production Panel
import './productionPanel.js';

// Inject Beauty Bar
import './beautyBar.js';

// Inject Decoration Menu
import './decorationMenu.js';
