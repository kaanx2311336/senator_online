import * as THREE from 'three';
import { selectBuilding, deselectBuilding } from './selection.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

/**
 * Temel tıklama algılama
 * @param {MouseEvent} event 
 * @param {THREE.Camera} camera 
 * @param {THREE.Scene} scene 
 * @param {Function} callback 
 */
export function onClick(event, camera, scene, callback) {
    // Mouse pozisyon hesaplama (normalized device coordinates: -1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Raycaster güncelleme
    raycaster.setFromCamera(mouse, camera);

    // Kesişen nesneleri bul
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        // En yakındaki nesneyi al
        for (let i = 0; i < intersects.length; i++) {
            let clickedObject = intersects[i].object;
            
            // Sadece userData.objectType olan nesneleri algıla (parent'lara bak)
            let found = null;
            let current = clickedObject;
            while (current && current !== scene) {
                if (current.userData && current.userData.objectType) {
                    found = current;
                    break;
                }
                current = current.parent;
            }
            
            if (found) {
                selectBuilding(found);
                if (callback) callback(found);
                return; // İlk bulduğunda çık
            }
        }
    }
    
    // Boş alana tıklanmışsa deselect işlemi yap
    deselectBuilding();
}
