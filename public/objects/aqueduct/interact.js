import * as THREE from 'three';

/**
 * Handles selection of an Aqueduct.
 * @param {THREE.Object3D} object - The aqueduct group.
 */
export function onSelect(object) {
    // Add visual selection effect (e.g., emissive glow)
    object.traverse((child) => {
        if (child.isMesh) {
            if (child.userData.originalEmissive === undefined) {
                child.userData.originalEmissive = child.material.emissive.getHex();
            }
            // Add a slight blueish glow
            child.material.emissive.setHex(child.userData.originalEmissive + 0x223344);
        }
    });

    if (window.RomanUI && window.RomanUI.detailPanel) {
        window.RomanUI.detailPanel.show(object);
    }
}

/**
 * Handles deselection of an Aqueduct.
 * @param {THREE.Object3D} object - The aqueduct group.
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
