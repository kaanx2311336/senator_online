export function initSettingsPanel() {
    const settingsPanel = document.getElementById('roman-settings-panel');
    const btnCloseSettings = document.getElementById('btn-close-settings');
    const soundToggle = document.getElementById('setting-sound-toggle');
    const volumeSlider = document.getElementById('setting-volume');
    const volumeValue = document.getElementById('volume-value');
    const graphicsSelect = document.getElementById('setting-graphics');
    const languageSelect = document.getElementById('setting-language');

    if (!settingsPanel || !btnCloseSettings) {
        console.error('Settings Panel elements not found');
        return;
    }

    // Initialize global namespace if it doesn't exist
    window.RomanUI = window.RomanUI || {};

    let settings = {
        sound: true,
        volume: 100,
        graphics: 'high',
        language: 'tr'
    };

    // Load from localStorage if available
    try {
        const savedSettings = localStorage.getItem('romanSettings');
        if (savedSettings) {
            settings = { ...settings, ...JSON.parse(savedSettings) };
        }
    } catch (e) {
        console.warn('Could not read settings from localStorage', e);
    }

    function saveSettings() {
        try {
            localStorage.setItem('romanSettings', JSON.stringify(settings));
        } catch (e) {
            console.warn('Could not save settings to localStorage', e);
        }
    }

    function updateUI() {
        // Sound toggle
        if (settings.sound) {
            soundToggle.textContent = 'Açık';
            soundToggle.classList.remove('bg-red-700', 'hover:bg-red-800');
            soundToggle.classList.add('bg-green-700', 'hover:bg-green-800');
        } else {
            soundToggle.textContent = 'Kapalı';
            soundToggle.classList.remove('bg-green-700', 'hover:bg-green-800');
            soundToggle.classList.add('bg-red-700', 'hover:bg-red-800');
        }

        // Volume
        volumeSlider.value = settings.volume;
        volumeValue.textContent = `${settings.volume}%`;
        volumeSlider.disabled = !settings.sound;

        // Graphics
        graphicsSelect.value = settings.graphics;

        // Language
        languageSelect.value = settings.language;
    }

    const SettingsPanelAPI = {
        show: () => {
            settingsPanel.classList.remove('pointer-events-none');
            gsap.to(settingsPanel, { opacity: 1, duration: 0.3 });
        },
        hide: () => {
            gsap.to(settingsPanel, { 
                opacity: 0, 
                duration: 0.3, 
                onComplete: () => {
                    settingsPanel.classList.add('pointer-events-none');
                }
            });
        },
        getSettings: () => ({ ...settings })
    };

    // Attach to global namespace
    window.RomanUI.SettingsPanel = SettingsPanelAPI;

    // Event Listeners
    btnCloseSettings.addEventListener('click', SettingsPanelAPI.hide);

    soundToggle.addEventListener('click', () => {
        settings.sound = !settings.sound;
        updateUI();
        saveSettings();
    });

    volumeSlider.addEventListener('input', (e) => {
        settings.volume = parseInt(e.target.value, 10);
        volumeValue.textContent = `${settings.volume}%`;
    });

    volumeSlider.addEventListener('change', () => {
        saveSettings();
    });

    graphicsSelect.addEventListener('change', (e) => {
        settings.graphics = e.target.value;
        saveSettings();
        if (window.RomanUI.Notifications) {
            window.RomanUI.Notifications.show('Grafik ayarları güncellendi.', 'info');
        }
    });

    languageSelect.addEventListener('change', (e) => {
        settings.language = e.target.value;
        saveSettings();
        if (window.RomanUI.Notifications) {
            window.RomanUI.Notifications.show(settings.language === 'tr' ? 'Dil Türkçe olarak ayarlandı.' : 'Language set to English.', 'info');
        }
    });

    // Initialize UI
    updateUI();
}

// Auto-initialize when loaded
document.addEventListener('DOMContentLoaded', initSettingsPanel);
