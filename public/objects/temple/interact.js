import * as THREE from 'three';

// Sadece GSAP'ın kullanılabilir olduğunu varsayıyoruz. 
// Proje genelinde CDN veya Vite üzerinden erişilecektir.
const gsap = window.gsap || { to: () => {}, from: () => {} };

export const isUpgradeable = true;

/**
 * Tapınak objesi seçildiğinde çağrılır.
 * @param {THREE.Group} object - Seçilen 3D obje
 */
export function onSelect(object) {
    try {
        if (!object) return;
        
        // Emissive efekti ekle
        object.traverse((child) => {
            if (child.isMesh && child.material) {
                // Materyali klonlamak (eğer tüm instance'lar etkilenmesin istenirse)
                // Ancak performans gereği genelde originalColoruserData'da tutulur
                if (!child.userData.originalEmissive) {
                    child.userData.originalEmissive = child.material.emissive ? child.material.emissive.clone() : new THREE.Color(0x000000);
                }
                
                // Emissive animasyonu
                gsap.to(child.material.emissive, {
                    r: 0.2, 
                    g: 0.2, 
                    b: 0.2,
                    duration: 0.3
                });
            }
        });
        
        // Obje seçildiğinde hafif bir sıçrama efekti
        if (!object.userData.originalY) {
            object.userData.originalY = object.position.y;
        }
        
        gsap.to(object.position, {
            y: object.userData.originalY + 0.5,
            duration: 0.3,
            yoyo: true,
            repeat: 1,
            ease: "power2.out"
        });
        
    } catch (error) {
        console.error("Tapınak seçilirken hata oluştu:", error);
    }
}

/**
 * Tapınak objesi seçimden çıktığında çağrılır.
 * @param {THREE.Group} object - Seçimi kaldırılan 3D obje
 */
export function onDeselect(object) {
    try {
        if (!object) return;
        
        // Emissive efektini geri al
        object.traverse((child) => {
            if (child.isMesh && child.material && child.userData.originalEmissive) {
                gsap.to(child.material.emissive, {
                    r: child.userData.originalEmissive.r,
                    g: child.userData.originalEmissive.g,
                    b: child.userData.originalEmissive.b,
                    duration: 0.3
                });
            }
        });
        
        // Pozisyonu eski haline getir
        if (object.userData.originalY !== undefined) {
            gsap.to(object.position, {
                y: object.userData.originalY,
                duration: 0.3,
                ease: "power2.in"
            });
        }
        
    } catch (error) {
        console.error("Tapınak seçimi kaldırılırken hata oluştu:", error);
    }
}

/**
 * Tapınak objesi yükseltildiğinde çağrılır.
 * @param {THREE.Group} object - Yükseltilen 3D obje
 * @param {number} newLevel - Yeni seviye
 */
export function onUpgrade(object, newLevel) {
    try {
        if (!object) return;
        
        // Başarılı yükseltme partikül/rotasyon efekti (temsili)
        gsap.to(object.rotation, {
            y: object.rotation.y + Math.PI * 2,
            duration: 1.5,
            ease: "elastic.out(1, 0.3)"
        });
        
        console.log(`Tapınak seviye ${newLevel}'e yükseltildi.`);
        
    } catch (error) {
        console.error("Tapınak yükseltilirken hata oluştu:", error);
    }
}
