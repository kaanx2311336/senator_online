let notificationContainer = null;

export function initNotifications() {
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'roman-notifications';
        notificationContainer.className = 'fixed top-20 right-4 z-50 flex flex-col items-end pointer-events-none';
        document.body.appendChild(notificationContainer);
    }
}

/**
 * Yeni bir bildirim gösterir
 * @param {string} message - Bildirim mesajı
 */
export function showNotification(message) {
    if (!notificationContainer) initNotifications();

    const notification = document.createElement('div');
    notification.className = 'roman-ui mb-2 bg-gray-900/90 backdrop-blur border-l-4 border-yellow-500 rounded-r shadow-lg p-3 text-white text-sm opacity-0 transform translate-x-10 pointer-events-auto';
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    notification.innerHTML = `
        <div class="flex items-center">
            <span class="mr-2 text-yellow-500" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
            </span>
            <span id="notif-msg-${Date.now()}"></span>
        </div>
    `;
    const msgSpan = notification.querySelector('span:last-child');
    msgSpan.textContent = message;

    notificationContainer.appendChild(notification);

    // GSAP ile animasyon
    if (window.gsap) {
        // Giriş animasyonu
        gsap.to(notification, {
            opacity: 1,
            x: 0,
            duration: 0.4,
            ease: "back.out(1.7)"
        });

        // 3 saniye sonra çıkış animasyonu
        gsap.to(notification, {
            opacity: 0,
            x: 20,
            duration: 0.3,
            delay: 3,
            onComplete: () => {
                notification.remove();
            }
        });
    } else {
        // Fallback CSS
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
        notification.style.transition = 'all 0.3s ease-out';
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(20px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Global olarak erişilebilir yapalım
window.RomanUI = window.RomanUI || {};
window.RomanUI.Notifications = {
    init: initNotifications,
    show: showNotification
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotifications);
} else {
    initNotifications();
}
