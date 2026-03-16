// js/ui/loadingScreen.js

function initLoadingScreen() {
    let loadingScreen = document.getElementById('roman-loading-screen');
    if (!loadingScreen) {
        loadingScreen = document.createElement('div');
        loadingScreen.id = 'roman-loading-screen';
        loadingScreen.className = 'fixed inset-0 bg-gray-900 z-[9999] flex flex-col items-center justify-center text-white roman-ui transition-opacity duration-1000';
        
        loadingScreen.innerHTML = `
            <div class="mb-8 text-6xl font-bold text-yellow-500 tracking-widest" style="text-shadow: 0 0 20px #ca8a04;">
                SPQR
            </div>
            <div class="relative w-24 h-24">
                <!-- Simple CSS representation of a spinning Roman column/wheel -->
                <div class="absolute inset-0 border-t-4 border-b-4 border-yellow-500 rounded-full animate-spin"></div>
                <div class="absolute inset-2 border-l-4 border-r-4 border-white opacity-50 rounded-full animate-spin" style="animation-direction: reverse; animation-duration: 2s;"></div>
            </div>
            <div class="mt-8 text-xl text-gray-300 animate-pulse">
                Roma İnşa Ediliyor...
            </div>
        `;
        
        document.body.appendChild(loadingScreen);
    }
}

export function hideLoadingScreen() {
    const loadingScreen = document.getElementById('roman-loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            if (loadingScreen.parentNode) {
                loadingScreen.parentNode.removeChild(loadingScreen);
            }
        }, 1000); // Wait for transition to finish
    }
}

// Global available
window.RomanUI = window.RomanUI || {};
window.RomanUI.hideLoading = hideLoadingScreen;

// Automatically initialize when the module is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoadingScreen);
} else {
    initLoadingScreen();
}

// We hide the loading screen after a delay or when window loads
window.addEventListener('load', () => {
    // Add a slight delay to ensure 3D scene gets a frame or two to render
    setTimeout(hideLoadingScreen, 1500);
});

