let tooltipElement = null;

export function initTooltip() {
    if (!tooltipElement) {
        tooltipElement = document.createElement('div');
        tooltipElement.id = 'roman-tooltip';
        tooltipElement.className = 'roman-ui fixed pointer-events-none z-50 bg-gray-900/90 backdrop-blur border border-yellow-500 rounded-lg p-3 text-white shadow-xl opacity-0 transition-opacity duration-200 transform -translate-x-1/2 -translate-y-full mt-[-10px]';
        
        tooltipElement.innerHTML = `
            <div class="text-sm font-bold text-yellow-500 mb-1" id="tooltip-title">Bina Adı</div>
            <div class="text-xs text-gray-300 mb-1">Seviye: <span id="tooltip-level" class="text-white">1</span></div>
            <div class="text-xs text-gray-400" id="tooltip-production">Üretim: <span class="text-yellow-200">+0</span></div>
        `;
        
        document.body.appendChild(tooltipElement);
    }
}

export function showTooltip(data, x, y) {
    if (!tooltipElement) initTooltip();
    
    const titleEl = document.getElementById('tooltip-title');
    const levelEl = document.getElementById('tooltip-level');
    const prodEl = document.getElementById('tooltip-production');
    
    if (titleEl) titleEl.textContent = data.name || 'Bilinmeyen Bina';
    if (levelEl) levelEl.textContent = data.level || 1;
    
    if (prodEl) {
        if (data.production && data.production.amount > 0) {
            prodEl.innerHTML = `Üretim: <span class="text-yellow-200">+${data.production.amount} ${data.production.type}</span>`;
            prodEl.style.display = 'block';
        } else {
            prodEl.style.display = 'none';
        }
    }
    
    tooltipElement.style.left = `${x}px`;
    tooltipElement.style.top = `${y}px`;
    tooltipElement.classList.remove('opacity-0');
    tooltipElement.classList.add('opacity-100');
}

export function moveTooltip(x, y) {
    if (tooltipElement && tooltipElement.classList.contains('opacity-100')) {
        tooltipElement.style.left = `${x}px`;
        tooltipElement.style.top = `${y}px`;
    }
}

export function hideTooltip() {
    if (tooltipElement) {
        tooltipElement.classList.remove('opacity-100');
        tooltipElement.classList.add('opacity-0');
    }
}

// Global available for Agent 4
window.RomanUI = window.RomanUI || {};
window.RomanUI.Tooltip = {
    init: initTooltip,
    show: showTooltip,
    move: moveTooltip,
    hide: hideTooltip
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTooltip);
} else {
    initTooltip();
}
