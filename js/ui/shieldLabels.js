import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

/**
 * Yeni kalkan etiketi oluşturur ve sahneye ekler.
 * @param {number|string} level - Binanın seviyesi.
 * @param {THREE.Vector3} position - Etiketin yerleştirileceği pozisyon.
 * @returns {CSS2DObject} Oluşturulan kalkan etiketi objesi.
 */
export function createShieldLabel(id, level, position) {
    const shieldDiv = document.createElement('div');
    shieldDiv.id = id;
    shieldDiv.className = 'shield-label shadow-md';
    shieldDiv.textContent = level;

    // CSS2DObject oluştur
    const labelObject = new CSS2DObject(shieldDiv);
    labelObject.position.copy(position);

    return labelObject;
}

/**
 * Mevcut bir kalkan etiketinin seviyesini günceller.
 * @param {string|number} id - Etiketin DOM elementi ID'si veya objenin kendi belirteci.
 * @param {number|string} newLevel - Yeni seviye değeri.
 */
export function updateShieldLabel(id, newLevel) {
    // Burada id, doğrudan DOM elementinin id'si olarak varsayılır. 
    // Daha sağlam bir yapı için sahnedeki CSS2DObject'ler üzerinden id aranabilir.
    const element = document.getElementById(id);
    if (element) {
        element.textContent = newLevel;
    } else {
        console.warn(`Shield label with id ${id} not found.`);
    }
}
