import * as THREE from 'three';

const gsap = window.gsap || { to: () => {}, from: () => {}, killTweensOf: () => {} };

export const isUpgradeable = true;

/**
 * Tapınak objesi seçildiğinde çağrılır.
 * @param {THREE.Group} mesh - Seçilen 3D obje
 * @param {HTMLElement} detailPanel - Detay panelinin DOM elementi
 */
export function onSelect(mesh, detailPanel) {
    try {
        if (!mesh) return;

        // UI Panelini Güncelle
        if (detailPanel) {
            const level = mesh.userData.level || 1;
            detailPanel.innerHTML = `
                <div class="p-4 bg-gray-800 text-white rounded-lg border border-yellow-600 shadow-lg">
                    <h3 class="text-xl font-bold mb-2 text-yellow-400">Tapınak</h3>
                    <p class="text-sm text-gray-300 mb-1">Tip: İnanç</p>
                    <p class="text-sm text-gray-300 mb-1">Seviye: ${level}</p>
                    <p class="text-sm text-gray-300 mb-4">İnanç Puanı: ${mesh.userData.faith || (level * 25)}</p>
                    <div class="flex space-x-2">
                        <button id="pray-btn" class="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded transition duration-200">
                            Dua Et
                        </button>
                        <button id="upgrade-btn" class="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded transition duration-200">
                            Yükselt
                        </button>
                    </div>
                </div>
            `;
            detailPanel.style.display = 'block';

            // "Dua Et" butonu için event listener
            const prayBtn = document.getElementById('pray-btn');
            if (prayBtn) {
                prayBtn.addEventListener('click', () => {
                    handlePrayClick(mesh);
                });
            }
        }
        
        // Emissive efekti ekle (Hover/Select parlaması)
        mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                if (!child.userData.originalEmissives) {
                    child.userData.originalEmissives = [];
                }
                materials.forEach((mat, index) => {
                    if (mat.emissive !== undefined) {
                        if (!child.userData.originalEmissives[index]) {
                            child.userData.originalEmissives[index] = mat.emissive.clone();
                        }
                        
                        gsap.to(mat.emissive, {
                            r: 0.2, 
                            g: 0.2, 
                            b: 0.2,
                            duration: 0.3
                        });
                    }
                });
            }
        });
        
    } catch (error) {
        console.error("Tapınak seçilirken hata oluştu:", error);
    }
}

/**
 * Dua Et butonuna tıklandığında çalışır
 */
async function handlePrayClick(mesh) {
    try {
        // animasyonlar modulünü dinamik import et
        const animModule = await import('../../js/interaction/animations.js');
        
        if (animModule && animModule.prayAnimation) {
            animModule.prayAnimation(mesh);
        } else {
            console.warn("prayAnimation bulunamadı!");
        }
        
    } catch (error) {
        console.error("Dua etme sırasında hata:", error);
    }
}

/**
 * Tapınak objesi seçimden çıktığında çağrılır.
 * @param {THREE.Group} mesh - Seçimi kaldırılan 3D obje
 * @param {HTMLElement} detailPanel - Detay panelinin DOM elementi
 */
export function onDeselect(mesh, detailPanel) {
    try {
        if (!mesh) return;
        
        // UI Panelini Temizle
        if (detailPanel) {
            detailPanel.style.display = 'none';
            detailPanel.innerHTML = '';
        }

        // Emissive efektini geri al
        mesh.traverse((child) => {
            if (child.isMesh && child.material && child.userData.originalEmissives) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach((mat, index) => {
                    const orig = child.userData.originalEmissives[index];
                    if (mat.emissive !== undefined && orig) {
                        gsap.to(mat.emissive, {
                            r: orig.r,
                            g: orig.g,
                            b: orig.b,
                            duration: 0.3
                        });
                    }
                });
            }
        });
        
    } catch (error) {
        console.error("Tapınak seçimi kaldırılırken hata oluştu:", error);
    }
}

/**
 * Tapınak objesi yükseltildiğinde çağrılır.
 * @param {THREE.Group} object - Mevcut 3D obje
 * @param {number} newLevel - Yeni seviye
 * @returns {Promise<THREE.Group>} - Yeni seviye 3D objesi
 */
export function onUpgrade(object, newLevel) {
    return import('./model.js').then(module => {
        return module.createTemple(newLevel);
    });
}
