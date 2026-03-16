export function initDetailPanel() {
    // Create panel container if it doesn't exist
    let panel = document.getElementById('detail-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'detail-panel';
        panel.className = 'roman-ui detail-panel fixed bottom-0 left-0 w-full md:w-1/2 md:left-1/4 bg-gray-900/90 backdrop-blur rounded-t-2xl p-6 text-white shadow-2xl z-50';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.setAttribute('aria-labelledby', 'building-name');
        
        // Panel internal structure
        panel.innerHTML = `
            <button id="close-panel-btn" aria-label="Paneli Kapat" class="absolute top-4 right-4 text-gray-400 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-yellow-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div class="flex flex-col items-center">
                <h2 id="building-name" class="text-3xl font-bold mb-2 text-yellow-500 text-center tracking-wide">Bina Adı</h2>
                <p id="building-level" class="text-lg text-gray-300 mb-6 font-medium">Seviye: <span id="building-level-val" class="text-white">1</span></p>
                
                <div class="bg-gray-800/80 p-5 rounded-xl w-full max-w-sm mb-8 border border-gray-700 shadow-inner">
                    <h3 class="text-sm uppercase text-gray-400 font-bold mb-4 text-center tracking-widest">Yükseltme Maliyeti</h3>
                    <div class="flex justify-around items-center">
                        <div class="flex flex-col items-center">
                            <span class="text-xs text-gray-400 mb-1 uppercase tracking-wide">Odun</span>
                            <span id="cost-wood" class="text-lg font-bold text-yellow-200">0</span>
                        </div>
                        <div class="flex flex-col items-center">
                            <span class="text-xs text-gray-400 mb-1 uppercase tracking-wide">Buğday</span>
                            <span id="cost-wheat" class="text-lg font-bold text-yellow-200">0</span>
                        </div>
                        <div class="flex flex-col items-center">
                            <span class="text-xs text-gray-400 mb-1 uppercase tracking-wide">Altın</span>
                            <span id="cost-gold" class="text-lg font-bold text-yellow-200">0</span>
                        </div>
                    </div>
                </div>
                
                <button id="upgrade-btn" aria-label="Binayı Yükselt" class="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-extrabold py-3 px-12 rounded-full shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300 text-lg tracking-wider">
                    Yükselt
                </button>
            </div>
        `;
        
        document.body.appendChild(panel);

        // Bind close button event
        const closeBtn = document.getElementById('close-panel-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', hidePanel);
        }
    }
}

/**
 * Gösterilecek bina verisi objesi:
 * {
 *   name: "Bina Adı",
 *   level: 1,
 *   upgradeCost: {
 *      wood: 100,
 *      wheat: 50,
 *      gold: 10
 *   }
 * }
 */
export function showPanel(buildingData) {
    let panel = document.getElementById('detail-panel');
    if (!panel) {
        initDetailPanel();
        panel = document.getElementById('detail-panel');
    }

    // Verileri Doldur
    if (buildingData) {
        const nameEl = document.getElementById('building-name');
        const levelEl = document.getElementById('building-level-val');
        const woodEl = document.getElementById('cost-wood');
        const wheatEl = document.getElementById('cost-wheat');
        const goldEl = document.getElementById('cost-gold');

        if (nameEl) nameEl.textContent = buildingData.name || "Bilinmeyen Bina";
        if (levelEl) levelEl.textContent = buildingData.level || 1;
        
        if (buildingData.upgradeCost) {
            if (woodEl) woodEl.textContent = buildingData.upgradeCost.wood || 0;
            if (wheatEl) wheatEl.textContent = buildingData.upgradeCost.wheat || 0;
            if (goldEl) goldEl.textContent = buildingData.upgradeCost.gold || 0;
        } else {
            if (woodEl) woodEl.textContent = 0;
            if (wheatEl) wheatEl.textContent = 0;
            if (goldEl) goldEl.textContent = 0;
        }
    }

    // Animasyonla göster
    // timeout ensures that display block applied if it was hidden and transition catches it
    setTimeout(() => {
        panel.classList.add('open');
    }, 10);
}

export function hidePanel() {
    const panel = document.getElementById('detail-panel');
    if (panel) {
        panel.classList.remove('open');
    }
}
