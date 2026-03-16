export function initArmyPanel() {
    let panel = document.getElementById('army-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'army-panel';
        panel.className = 'roman-ui army-panel fixed top-24 right-4 w-72 bg-gray-900/90 backdrop-blur rounded-xl p-4 text-white shadow-2xl z-40 border-2 border-red-800 transition-transform transform translate-x-full duration-300';
        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-label', 'Ordu Paneli');

        panel.innerHTML = `
            <div class="flex justify-between items-center mb-4 border-b border-red-800 pb-2">
                <h2 class="text-xl font-bold text-red-500 tracking-wider">ROMA ORDUSU</h2>
                <button id="toggle-army-btn" class="text-gray-400 hover:text-white focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transform transition-transform" id="army-toggle-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
            
            <div id="army-content" class="space-y-4">
                <!-- Asker Sayıları -->
                <div class="space-y-2">
                    <div class="flex justify-between items-center bg-gray-800 p-2 rounded">
                        <span class="text-sm text-gray-300">🗡️ Lejyoner</span>
                        <span id="count-legionnaire" class="font-bold text-yellow-500">0</span>
                    </div>
                    <div class="flex justify-between items-center bg-gray-800 p-2 rounded">
                        <span class="text-sm text-gray-300">🏹 Okçu</span>
                        <span id="count-archer" class="font-bold text-yellow-500">0</span>
                    </div>
                    <div class="flex justify-between items-center bg-gray-800 p-2 rounded">
                        <span class="text-sm text-gray-300">🐎 Süvari</span>
                        <span id="count-cavalry" class="font-bold text-yellow-500">0</span>
                    </div>
                </div>

                <!-- Savunma Gücü Barı -->
                <div class="mt-4">
                    <div class="flex justify-between text-xs mb-1">
                        <span class="text-gray-400">Toplam Savunma Gücü</span>
                        <span id="defense-power-text" class="text-red-400 font-bold">0</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-2.5">
                        <div id="defense-power-bar" class="bg-red-600 h-2.5 rounded-full" style="width: 0%"></div>
                    </div>
                </div>

                <!-- Mod Geçişi -->
                <div class="flex items-center justify-between bg-gray-800 p-2 rounded mt-4">
                    <span class="text-sm text-gray-300" id="army-mode-text">🛡️ Savunma Modu</span>
                    <button id="toggle-mode-btn" class="bg-gray-700 hover:bg-gray-600 text-white rounded px-3 py-1 text-xs font-bold transition-colors">
                        Değiştir
                    </button>
                </div>

                <!-- Eğitim Butonları -->
                <div class="mt-4 border-t border-gray-700 pt-3">
                    <h3 class="text-xs text-gray-400 uppercase tracking-widest mb-2">Eğitim (Maliyet: 50 Buğday, 10 Altın)</h3>
                    <div class="grid grid-cols-3 gap-2">
                        <button class="train-btn bg-red-800 hover:bg-red-700 text-white text-xs py-2 rounded focus:ring-2 focus:ring-red-400" data-type="legionnaire" aria-label="Lejyoner Eğit">Lejyoner</button>
                        <button class="train-btn bg-red-800 hover:bg-red-700 text-white text-xs py-2 rounded focus:ring-2 focus:ring-red-400" data-type="archer" aria-label="Okçu Eğit">Okçu</button>
                        <button class="train-btn bg-red-800 hover:bg-red-700 text-white text-xs py-2 rounded focus:ring-2 focus:ring-red-400" data-type="cavalry" aria-label="Süvari Eğit">Süvari</button>
                    </div>
                </div>
            </div>
            
            <!-- Toggle Tab when panel is hidden -->
            <button id="army-panel-tab" class="absolute top-1/2 -left-8 transform -translate-y-1/2 bg-red-800 hover:bg-red-700 text-white p-2 rounded-l-md shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors" aria-label="Ordu Panelini Aç">
                 ⚔️
            </button>
        `;

        document.body.appendChild(panel);

        // State
        const state = {
            isOpen: false,
            mode: 'defense', // 'defense' or 'attack'
            troops: {
                legionnaire: 0,
                archer: 0,
                cavalry: 0
            },
            powerPerTroop: {
                legionnaire: 10,
                archer: 8,
                cavalry: 15
            },
            maxPower: 1000 // Gorsel bar icin
        };

        // DOM Elements
        const toggleBtn = document.getElementById('toggle-army-btn');
        const tabBtn = document.getElementById('army-panel-tab');
        const toggleIcon = document.getElementById('army-toggle-icon');
        const modeBtn = document.getElementById('toggle-mode-btn');
        const modeText = document.getElementById('army-mode-text');
        const trainBtns = document.querySelectorAll('.train-btn');
        
        const updateUI = () => {
            document.getElementById('count-legionnaire').textContent = state.troops.legionnaire;
            document.getElementById('count-archer').textContent = state.troops.archer;
            document.getElementById('count-cavalry').textContent = state.troops.cavalry;

            const totalPower = (state.troops.legionnaire * state.powerPerTroop.legionnaire) +
                               (state.troops.archer * state.powerPerTroop.archer) +
                               (state.troops.cavalry * state.powerPerTroop.cavalry);
            
            document.getElementById('defense-power-text').textContent = totalPower;
            
            let powerPercent = (totalPower / state.maxPower) * 100;
            if (powerPercent > 100) powerPercent = 100;
            document.getElementById('defense-power-bar').style.width = `${powerPercent}%`;

            if (state.mode === 'defense') {
                modeText.textContent = '🛡️ Savunma Modu';
                modeText.classList.remove('text-red-500');
                modeText.classList.add('text-gray-300');
                document.getElementById('defense-power-bar').classList.remove('bg-orange-600');
                document.getElementById('defense-power-bar').classList.add('bg-red-600');
            } else {
                modeText.textContent = '⚔️ Saldırı Modu';
                modeText.classList.remove('text-gray-300');
                modeText.classList.add('text-red-500');
                document.getElementById('defense-power-bar').classList.remove('bg-red-600');
                document.getElementById('defense-power-bar').classList.add('bg-orange-600');
            }
        };

        const togglePanel = () => {
            state.isOpen = !state.isOpen;
            if (state.isOpen) {
                panel.classList.remove('translate-x-full');
                toggleIcon.classList.add('rotate-180');
                tabBtn.classList.add('hidden');
            } else {
                panel.classList.add('translate-x-full');
                toggleIcon.classList.remove('rotate-180');
                tabBtn.classList.remove('hidden');
            }
        };

        toggleBtn.addEventListener('click', togglePanel);
        tabBtn.addEventListener('click', togglePanel);

        modeBtn.addEventListener('click', () => {
            state.mode = state.mode === 'defense' ? 'attack' : 'defense';
            updateUI();
            if (window.RomanUI && window.RomanUI.Notifications) {
                window.RomanUI.Notifications.show(`Ordu modu değiştirildi: ${state.mode === 'defense' ? 'Savunma' : 'Saldırı'}`);
            }
        });

        trainBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.getAttribute('data-type');
                
                // Maliyet kontrolü varsayımı (ResourceManager ile entegrasyon yapılabilir)
                // Şimdilik sadece sayıyı artırıyoruz.
                let canTrain = true;
                if (window.RomanUI && window.RomanUI.ResourceManager) {
                    const currentWheat = window.RomanUI.ResourceManager.getResource('wheat');
                    const currentGold = window.RomanUI.ResourceManager.getResource('gold');
                    
                    if (currentWheat >= 50 && currentGold >= 10) {
                        window.RomanUI.ResourceManager.updateResource('wheat', -50);
                        window.RomanUI.ResourceManager.updateResource('gold', -10);
                    } else {
                        canTrain = false;
                        if (window.RomanUI.Notifications) {
                            window.RomanUI.Notifications.show('Yetersiz kaynak! (50 Buğday, 10 Altın gerekli)', 'error');
                        }
                    }
                }

                if (canTrain) {
                    state.troops[type]++;
                    updateUI();
                    if (window.RomanUI && window.RomanUI.Notifications) {
                        let typeName = type === 'legionnaire' ? 'Lejyoner' : type === 'archer' ? 'Okçu' : 'Süvari';
                        window.RomanUI.Notifications.show(`1 birim ${typeName} eğitildi.`);
                    }
                }
            });
        });

        // Expose API
        window.RomanUI = window.RomanUI || {};
        window.RomanUI.ArmyPanel = {
            open: () => { if (!state.isOpen) togglePanel(); },
            close: () => { if (state.isOpen) togglePanel(); },
            getTroops: () => ({ ...state.troops }),
            getMode: () => state.mode,
            addTroops: (type, amount) => {
                if (state.troops[type] !== undefined) {
                    state.troops[type] += amount;
                    updateUI();
                }
            }
        };

        // İlk açılış animasyonu için
        setTimeout(() => {
            togglePanel(); // Open by default or leave closed depending on preference. Closed by default is better.
            togglePanel(); // Toggle twice to ensure state is correct (closed but ready)
        }, 100);

    }
}
