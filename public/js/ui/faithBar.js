// js/ui/faithBar.js

let currentFaith = 0;
const MAX_FAITH = 100;

export function initFaithBar() {
    // Wait for top bar to be available
    const checkTopBar = setInterval(() => {
        const topBar = document.getElementById('roman-top-bar');
        if (topBar) {
            clearInterval(checkTopBar);
            
            // Create faith bar container
            const faithContainer = document.createElement('div');
            faithContainer.id = 'faith-bar-container';
            faithContainer.className = 'flex items-center relative mx-2 faith-ui';
            
            // Icon
            const iconSpan = document.createElement('span');
            iconSpan.className = 'resource-icon text-2xl z-10';
            iconSpan.textContent = '🔮'; // Crystal ball or similar for faith
            
            // Bar background
            const barBg = document.createElement('div');
            barBg.className = 'w-32 h-6 bg-gray-900 rounded-full border border-purple-500 overflow-hidden ml-2 relative shadow-inner';
            
            // Bar fill
            const barFill = document.createElement('div');
            barFill.id = 'faith-bar-fill';
            barFill.className = 'h-full bg-gradient-to-r from-purple-700 to-yellow-500 transition-all duration-300';
            barFill.style.width = '0%';
            
            // Text overlay
            const textOverlay = document.createElement('span');
            textOverlay.id = 'faith-bar-text';
            textOverlay.className = 'absolute inset-0 flex justify-center items-center text-xs font-bold text-white text-shadow-md';
            textOverlay.textContent = `0 / ${MAX_FAITH}`;
            
            barBg.appendChild(barFill);
            barBg.appendChild(textOverlay);
            
            faithContainer.appendChild(iconSpan);
            faithContainer.appendChild(barBg);
            
            topBar.appendChild(faithContainer);
        }
    }, 100);
}

export function updateFaith(amount) {
    currentFaith = Math.max(0, Math.min(MAX_FAITH, currentFaith + amount));
    
    const barFill = document.getElementById('faith-bar-fill');
    const textOverlay = document.getElementById('faith-bar-text');
    
    if (barFill && textOverlay) {
        // Animate fill width
        if (window.gsap) {
            gsap.to(barFill, { width: `${(currentFaith / MAX_FAITH) * 100}%`, duration: 0.5, ease: "power2.out" });
        } else {
            barFill.style.width = `${(currentFaith / MAX_FAITH) * 100}%`;
        }
        
        textOverlay.textContent = `${Math.floor(currentFaith)} / ${MAX_FAITH}`;
        
        // Flash effect if full
        if (currentFaith >= MAX_FAITH && window.gsap) {
            gsap.to('#faith-bar-container', {
                boxShadow: "0 0 15px #a855f7", // purple glow
                yoyo: true,
                repeat: 3,
                duration: 0.3,
                onComplete: () => {
                    gsap.set('#faith-bar-container', { clearProps: "boxShadow" });
                }
            });
        }
    }
}

export function getFaith() {
    return currentFaith;
}

export function setFaith(amount) {
    const diff = amount - currentFaith;
    updateFaith(diff);
}

// Ensure it's globally available
window.RomanUI = window.RomanUI || {};
window.RomanUI.FaithBar = {
    init: initFaithBar,
    update: updateFaith,
    get: getFaith,
    set: setFaith
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaithBar);
} else {
    initFaithBar();
}
