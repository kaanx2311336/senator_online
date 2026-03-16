import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { setCameraAndControls } from './selection.js';

/**
 * OrbitControls kurulumu
 * @param {THREE.Camera} camera
 * @param {HTMLElement} domElement
 * @returns {OrbitControls}
 */
export function setupControls(camera, domElement) {
    try {
        const controls = new OrbitControls(camera, domElement);
        
        // Setup references for selection logic
        setCameraAndControls(camera, controls);
    
    // enableRotate = false (döndürme KESİNLİKLE KAPALI)
    controls.enableRotate = false;
    
    // enablePan = true (sağa-sola kaydırma AÇIK)
    controls.enablePan = true;
    
    // enableZoom = true (zoom AÇIK)
    controls.enableZoom = true;
    
    // minDistance = 20, maxDistance = 120 (zoom limitleri)
    controls.minDistance = 20;
    controls.maxDistance = 120;
    
        // maxPolarAngle = Math.PI/3 (çok dik bakma engeli)
        controls.maxPolarAngle = Math.PI / 3;
        
        // OrbitControls already supports touch events for panning/zooming.
        controls.touches = {
            ONE: THREE.TOUCH.PAN,
            TWO: THREE.TOUCH.DOLLY_PAN
        };

        // WebGL context lost event listener
        if (domElement) {
            domElement.addEventListener('webglcontextlost', (event) => {
                event.preventDefault();
                console.error("WebGL context lost. Uygulama düzgün çalışmayabilir.");
                // Burada kullanıcıya UI bildirimi gösterilebilir.
                const overlay = document.createElement('div');
                overlay.style.position = 'absolute';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                overlay.style.color = 'white';
                overlay.style.display = 'flex';
                overlay.style.alignItems = 'center';
                overlay.style.justifyContent = 'center';
                overlay.style.zIndex = '9999';
                overlay.innerHTML = '<h2>Kritik Hata: Grafik Belleği Kayboldu. Lütfen sayfayı yenileyin.</h2>';
                document.body.appendChild(overlay);
            }, false);
        }
        
        return controls;
    } catch (error) {
        console.error("setupControls error:", error);
        return null;
    }
}
