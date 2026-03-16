// js/ui/buffPanel.js

const BUFF_TYPES = {
    production: { id: 'production', label: 'Üretim Artışı', value: '+%20', icon: '📈', color: 'text-green-400', desc: 'Üretim %20 artar' },
    defense: { id: 'defense', label: 'Savunma Bonusu', value: '+%15', icon: '🛡️', color: 'text-blue-400', desc: 'Savunma %15 artar' },
    trade: { id: 'trade', label: 'Ticaret İndirimi', value: '-%10', icon: '⚖️', color: 'text-yellow-400', desc: 'Maliyetler %10 düşer' }
};

let activeBuffs = {};
let panelContainer = null;

export function initBuffPanel() {
    if (!panelContainer) {
        panelContainer = document.createElement('div');
        panelContainer.id = 'roman-buff-panel';
        panelContainer.className = 'fixed top-16 right-4 flex flex-col items-end gap-2 z-40 p-2';
        document.body.appendChild(panelContainer);
    }
}

export function addBuff(type, durationSeconds) {
    if (!panelContainer) initBuffPanel();
    
    const buffData = BUFF_TYPES[type];
    if (!buffData) {
        console.warn('Unknown buff type:', type);
        return;
    }
    
    // Remove if exists
    if (activeBuffs[type]) {
        clearInterval(activeBuffs[type].interval);
        if (activeBuffs[type].element) {
            activeBuffs[type].element.remove();
        }
    }
    
    // Create buff element
    const buffEl = document.createElement('div');
    buffEl.className = 'flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg p-2 shadow-lg cursor-help transition-transform hover:scale-105 buff-item';
    buffEl.title = buffData.desc; // Native tooltip fallback
    
    const iconSpan = document.createElement('span');
    iconSpan.className = 'text-xl drop-shadow-md';
    iconSpan.textContent = buffData.icon;
    
    const textDiv = document.createElement('div');
    textDiv.className = 'flex flex-col text-right';
    
    const labelSpan = document.createElement('span');
    labelSpan.className = `text-xs font-bold ${buffData.color}`;
    labelSpan.textContent = `${buffData.label} ${buffData.value}`;
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'text-xs text-gray-300 font-mono tracking-wider';
    timeSpan.textContent = formatTime(durationSeconds);
    
    textDiv.appendChild(labelSpan);
    textDiv.appendChild(timeSpan);
    
    buffEl.appendChild(textDiv);
    buffEl.appendChild(iconSpan);
    
    panelContainer.appendChild(buffEl);
    
    // Animation in
    if (window.gsap) {
        gsap.fromTo(buffEl, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4, ease: "back.out(1.7)" });
    }
    
    // Custom tooltip logic if RomanUI.Tooltip exists
    buffEl.addEventListener('mouseenter', (e) => {
        if (window.RomanUI && window.RomanUI.Tooltip) {
            window.RomanUI.Tooltip.show({
                name: buffData.label,
                level: buffData.value,
                production: { amount: durationSeconds, type: 'saniye kaldı' } // reusing production formatting for simplicity
            }, e.clientX, e.clientY);
        }
    });
    
    buffEl.addEventListener('mousemove', (e) => {
        if (window.RomanUI && window.RomanUI.Tooltip) {
            window.RomanUI.Tooltip.move(e.clientX + 10, e.clientY + 10);
        }
    });
    
    buffEl.addEventListener('mouseleave', () => {
        if (window.RomanUI && window.RomanUI.Tooltip) {
            window.RomanUI.Tooltip.hide();
        }
    });

    let timeLeft = durationSeconds;
    const interval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            removeBuff(type);
        } else {
            timeSpan.textContent = formatTime(timeLeft);
            // Update tooltip if open
            if (buffEl.matches(':hover') && window.RomanUI && window.RomanUI.Tooltip) {
                // Update tooltip content
            }
        }
    }, 1000);
    
    activeBuffs[type] = {
        interval,
        element: buffEl
    };
}

export function removeBuff(type) {
    if (activeBuffs[type]) {
        clearInterval(activeBuffs[type].interval);
        
        const el = activeBuffs[type].element;
        if (el) {
            if (window.gsap) {
                gsap.to(el, { opacity: 0, x: 20, duration: 0.3, onComplete: () => el.remove() });
            } else {
                el.remove();
            }
        }
        
        delete activeBuffs[type];
    }
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

window.RomanUI = window.RomanUI || {};
window.RomanUI.BuffPanel = {
    init: initBuffPanel,
    addBuff,
    removeBuff
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBuffPanel);
} else {
    initBuffPanel();
}
