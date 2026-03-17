// public/js/ui/decorationMenu.js

export function initDecorationMenu() {
    let menu = document.getElementById('decoration-menu');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'decoration-menu';
        menu.className = 'fixed right-4 bottom-24 bg-white/90 p-3 rounded-xl border-2 border-yellow-500 shadow-2xl flex flex-col gap-3 z-40 transition-transform duration-300 transform translate-x-[150%] opacity-0 pointer-events-none roman-ui decoration-menu';
        
        menu.innerHTML = `
            <div class="flex justify-between items-center border-b border-gray-300 pb-2 mb-1">
                <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wider cinzel-font">Dekorasyonlar</h3>
                <button id="close-decoration-btn" class="text-gray-500 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div class="flex flex-col gap-2">
                <!-- Çeşme (Fountain) -->
                <button id="build-fountain-btn" class="flex items-center gap-3 p-2 rounded-lg hover:bg-yellow-50 transition-colors border border-transparent hover:border-yellow-300 group focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    <div class="w-10 h-10 bg-blue-100 rounded-md border border-blue-300 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                        ⛲
                    </div>
                    <div class="flex flex-col text-left">
                        <span class="text-xs font-bold text-gray-800">Roma Çeşmesi</span>
                        <span class="text-[10px] text-gray-500">+10 Güzellik Puanı</span>
                    </div>
                </button>
                
                <!-- Heykel (Statue) -->
                <button id="build-statue-btn" class="flex items-center gap-3 p-2 rounded-lg hover:bg-yellow-50 transition-colors border border-transparent hover:border-yellow-300 group focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    <div class="w-10 h-10 bg-gray-200 rounded-md border border-gray-400 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                        🗽
                    </div>
                    <div class="flex flex-col text-left">
                        <span class="text-xs font-bold text-gray-800">Mermer Heykel</span>
                        <span class="text-[10px] text-gray-500">+25 Güzellik Puanı</span>
                    </div>
                </button>
            </div>
        `;
        
        document.body.appendChild(menu);

        // Events
        const closeBtn = document.getElementById('close-decoration-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', hideDecorationMenu);
        }

        const btnFountain = document.getElementById('build-fountain-btn');
        if (btnFountain) {
            btnFountain.addEventListener('click', () => {
                selectDecoration('fountain');
            });
        }

        const btnStatue = document.getElementById('build-statue-btn');
        if (btnStatue) {
            btnStatue.addEventListener('click', () => {
                selectDecoration('statue');
            });
        }
    }

    // Toggle Button (Floating Action Button)
    let toggleBtn = document.getElementById('decoration-toggle-btn');
    if (!toggleBtn) {
        toggleBtn = document.createElement('button');
        toggleBtn.id = 'decoration-toggle-btn';
        toggleBtn.className = 'fixed right-4 bottom-8 w-14 h-14 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 border-2 border-yellow-200 text-white text-2xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex justify-center items-center z-40 focus:outline-none focus:ring-4 focus:ring-yellow-300';
        toggleBtn.innerHTML = '🪴';
        toggleBtn.title = 'Dekorasyon Menüsü';
        
        document.body.appendChild(toggleBtn);
        
        toggleBtn.addEventListener('click', toggleDecorationMenu);
    }
}

function selectDecoration(type) {
    if (window.RomanUI && window.RomanUI.Notifications) {
        const name = type === 'fountain' ? 'Çeşme' : 'Heykel';
        window.RomanUI.Notifications.show(`${name} yerleştirme moduna geçildi.`);
    }
    
    // Switch to placement mode for this decoration.
    // This sets a global flag or invokes interaction mode in main/objectEngine logic.
    window.placementModeActive = true;
    window.placementType = type;
    
    // Visual cue for placement mode
    document.body.style.cursor = 'crosshair';
    
    hideDecorationMenu();
}

export function toggleDecorationMenu() {
    const menu = document.getElementById('decoration-menu');
    if (!menu) {
        initDecorationMenu();
    }
    
    const theMenu = document.getElementById('decoration-menu');
    if (theMenu.classList.contains('pointer-events-none')) {
        showDecorationMenu();
    } else {
        hideDecorationMenu();
    }
}

export function showDecorationMenu() {
    let menu = document.getElementById('decoration-menu');
    if (!menu) {
        initDecorationMenu();
        menu = document.getElementById('decoration-menu');
    }

    menu.classList.remove('translate-x-[150%]', 'opacity-0', 'pointer-events-none');
    menu.classList.add('translate-x-0', 'opacity-100', 'pointer-events-auto');
}

export function hideDecorationMenu() {
    const menu = document.getElementById('decoration-menu');
    if (menu) {
        menu.classList.remove('translate-x-0', 'opacity-100', 'pointer-events-auto');
        menu.classList.add('translate-x-[150%]', 'opacity-0', 'pointer-events-none');
    }
}

// Ensure it's globally available
window.RomanUI = window.RomanUI || {};
window.RomanUI.DecorationMenu = {
    init: initDecorationMenu,
    show: showDecorationMenu,
    hide: hideDecorationMenu,
    toggle: toggleDecorationMenu
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDecorationMenu);
} else {
    initDecorationMenu();
}