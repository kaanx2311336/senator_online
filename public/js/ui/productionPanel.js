export function initProductionPanel() {
    let panel = document.getElementById('production-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'production-panel';
        panel.className = 'roman-ui production-panel fixed top-[70px] left-4 md:left-1/2 md:-translate-x-1/2 w-11/12 md:w-96 marble-bg rounded-xl p-4 text-gray-900 shadow-2xl z-40 border-4 border-yellow-600 transition-all duration-300 transform -translate-y-[120%] opacity-0 pointer-events-none';
        
        panel.innerHTML = `
            <div class="flex justify-between items-center mb-4 border-b-2 border-red-900/20 pb-2">
                <h2 class="text-2xl font-bold text-red-900 cinzel-font tracking-wide">Üretim Özeti</h2>
                <button id="close-production-panel" class="text-red-800 hover:text-red-600 focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div class="space-y-3 max-h-64 overflow-y-auto mb-4 pr-2" id="production-list">
                <!-- Üretim listesi buraya eklenecek -->
            </div>
            
            <div class="bg-red-900/10 p-3 rounded-lg border border-red-900/20 mt-4">
                <h3 class="text-sm font-bold text-red-900 uppercase tracking-wider mb-2 text-center">Dakikalık Toplam Üretim</h3>
                <div class="flex justify-around items-center text-sm font-bold">
                    <div class="flex items-center gap-1"><span class="text-lg">🌲</span> <span class="text-green-700">+12</span></div>
                    <div class="flex items-center gap-1"><span class="text-lg">🌾</span> <span class="text-green-700">+25</span></div>
                    <div class="flex items-center gap-1"><span class="text-lg">🪙</span> <span class="text-green-700">+8</span></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Mock data for display
        const mockData = [
            { icon: '🌲', name: 'Oduncu Kampı 1', amount: '+5' },
            { icon: '🌲', name: 'Oduncu Kampı 2', amount: '+7' },
            { icon: '🌾', name: 'Buğday Tarlası 1', amount: '+10' },
            { icon: '🌾', name: 'Buğday Tarlası 2', amount: '+15' },
            { icon: '🪙', name: 'Altın Madeni', amount: '+8' }
        ];
        
        updateProductionList(mockData);

        const closeBtn = document.getElementById('close-production-panel');
        if (closeBtn) {
            closeBtn.addEventListener('click', hideProductionPanel);
        }
    }
}

export function updateProductionList(data) {
    const listContainer = document.getElementById('production-list');
    if (listContainer) {
        listContainer.innerHTML = '';
        if (data && data.length > 0) {
            data.forEach(item => {
                const el = document.createElement('div');
                el.className = 'flex justify-between items-center p-2 hover:bg-white/50 rounded transition-colors border-b border-gray-200/50 last:border-0';
                el.innerHTML = `
                    <div class="flex items-center gap-3">
                        <span class="text-xl">${item.icon}</span>
                        <span class="font-medium text-gray-800">${item.name}</span>
                    </div>
                    <span class="font-bold text-green-600">${item.amount}</span>
                `;
                listContainer.appendChild(el);
            });
        } else {
            listContainer.innerHTML = '<div class="text-center text-gray-500 italic py-4">Üretim yapan bina yok.</div>';
        }
    }
}

export function toggleProductionPanel() {
    const panel = document.getElementById('production-panel');
    if (!panel) {
        initProductionPanel();
    }
    
    const thePanel = document.getElementById('production-panel');
    if (thePanel.classList.contains('pointer-events-none')) {
        showProductionPanel();
    } else {
        hideProductionPanel();
    }
}

export function showProductionPanel() {
    let panel = document.getElementById('production-panel');
    if (!panel) {
        initProductionPanel();
        panel = document.getElementById('production-panel');
    }

    panel.classList.remove('-translate-y-[120%]', 'opacity-0', 'pointer-events-none');
    panel.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
}

export function hideProductionPanel() {
    const panel = document.getElementById('production-panel');
    if (panel) {
        panel.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
        panel.classList.add('-translate-y-[120%]', 'opacity-0', 'pointer-events-none');
    }
}

export function showFloatingText(x, y, text) {
    const floatEl = document.createElement('div');
    floatEl.className = 'floating-text absolute font-bold text-xl pointer-events-none z-50 drop-shadow-md';
    floatEl.style.left = `${x}px`;
    floatEl.style.top = `${y}px`;
    floatEl.textContent = text;
    
    // Check text content for coloring
    if (text.includes('-')) {
        floatEl.classList.add('text-red-500');
    } else {
        floatEl.classList.add('text-green-400');
    }
    
    document.body.appendChild(floatEl);
    
    // Trigger animation via CSS
    requestAnimationFrame(() => {
        floatEl.classList.add('animate-float-up');
    });
    
    // Remove after animation completes (matches CSS duration)
    setTimeout(() => {
        floatEl.remove();
    }, 2000);
}

// Global namespace integration
window.RomanUI = window.RomanUI || {};
window.RomanUI.ProductionPanel = {
    init: initProductionPanel,
    show: showProductionPanel,
    hide: hideProductionPanel,
    toggle: toggleProductionPanel,
    update: updateProductionList,
    showFloatingText: showFloatingText
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductionPanel);
} else {
    initProductionPanel();
}
