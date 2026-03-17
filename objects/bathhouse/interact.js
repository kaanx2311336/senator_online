import * as THREE from 'three';

/**
 * Handles selection of a Bathhouse building.
 * @param {THREE.Object3D} object - The building group.
 */
export function onSelect(object) {
    // Add visual selection effect (e.g., emissive glow)
    object.traverse((child) => {
        if (child.isMesh) {
            if (child.userData.originalEmissive === undefined) {
                child.userData.originalEmissive = child.material.emissive.getHex();
            }
            // Add a slight blueish/whitish glow
            child.material.emissive.setHex(child.userData.originalEmissive + 0x222233);
        }
    });

    if (window.RomanUI && window.RomanUI.detailPanel) {
        window.RomanUI.detailPanel.show(object);
    }
}

/**
 * Handles deselection of a Bathhouse building.
 * @param {THREE.Object3D} object - The building group.
 */
export function onDeselect(object) {
    // Remove visual selection effect
    object.traverse((child) => {
        if (child.isMesh && child.userData.originalEmissive !== undefined) {
            child.material.emissive.setHex(child.userData.originalEmissive);
        }
    });

    if (window.RomanUI && window.RomanUI.detailPanel) {
        window.RomanUI.detailPanel.hide();
    }
}

/**
 * Handles upgrade logic for a Bathhouse building.
 * @param {THREE.Object3D} object - The building group.
 * @param {Object} newConfig - The new level config data.
 */
export function onUpgrade(object, newConfig) {
    if (window.RomanUI && window.RomanUI.Notifications) {
        window.RomanUI.Notifications.show(`Hamam upgraded to level ${newConfig.level}!`);
    }
    
    // Play upgrade animation (scale bounce)
    if (window.gsap) {
        const originalScale = object.scale.clone();
        window.gsap.to(object.scale, {
            x: originalScale.x * 1.2,
            y: originalScale.y * 1.2,
            z: originalScale.z * 1.2,
            duration: 0.3,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut",
            onComplete: () => {
                object.scale.copy(originalScale);
            }
        });
    }
}
