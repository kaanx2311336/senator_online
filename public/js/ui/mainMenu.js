export function initMainMenu() {
    const mainMenu = document.getElementById('roman-main-menu');
    const settingsPanel = document.getElementById('roman-settings-panel');
    const aboutPanel = document.getElementById('roman-about-panel');
    
    const btnStartGame = document.getElementById('btn-start-game');
    const btnSettings = document.getElementById('btn-settings');
    const btnAbout = document.getElementById('btn-about');
    
    const btnCloseAbout = document.getElementById('btn-close-about');

    if (!mainMenu || !btnStartGame || !btnSettings || !btnAbout) {
        console.error('MainMenu elements not found');
        return;
    }

    // Initialize global namespace if it doesn't exist
    window.RomanUI = window.RomanUI || {};

    const MainMenuAPI = {
        show: () => {
            mainMenu.classList.remove('pointer-events-none');
            gsap.to(mainMenu, { opacity: 1, duration: 0.5 });
        },
        hide: () => {
            gsap.to(mainMenu, { 
                opacity: 0, 
                duration: 0.5, 
                onComplete: () => {
                    mainMenu.classList.add('pointer-events-none');
                }
            });
        }
    };

    // Attach to global namespace
    window.RomanUI.MainMenu = MainMenuAPI;

    // Start Game
    btnStartGame.addEventListener('click', () => {
        MainMenuAPI.hide();
        if (window.RomanUI.Notifications) {
            window.RomanUI.Notifications.show('Oyun Başladı. Roma\'yı İnşa Et!', 'success');
        }
    });

    // Show Settings
    btnSettings.addEventListener('click', () => {
        if (window.RomanUI.SettingsPanel) {
            window.RomanUI.SettingsPanel.show();
        } else {
            // Fallback if settingsPanel script is not loaded yet
            settingsPanel.classList.remove('pointer-events-none');
            gsap.to(settingsPanel, { opacity: 1, duration: 0.3 });
        }
    });

    // Show About
    btnAbout.addEventListener('click', () => {
        if (aboutPanel) {
            aboutPanel.classList.remove('pointer-events-none');
            gsap.to(aboutPanel, { opacity: 1, duration: 0.3 });
        }
    });

    // Close About
    if (btnCloseAbout) {
        btnCloseAbout.addEventListener('click', () => {
            gsap.to(aboutPanel, { 
                opacity: 0, 
                duration: 0.3, 
                onComplete: () => {
                    aboutPanel.classList.add('pointer-events-none');
                }
            });
        });
    }

    // Start slightly transparent and fade in
    gsap.fromTo(mainMenu, { opacity: 0 }, { opacity: 1, duration: 1 });
}

// Auto-initialize when loaded
document.addEventListener('DOMContentLoaded', initMainMenu);
