import * as THREE from 'three';
import gsap from 'gsap';
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
let hoveredObject = null;
let isThrottled = false;

export function onMouseMove(event, camera, scene) {
    try {
        if (isThrottled) return;
        isThrottled = true;
        requestAnimationFrame(() => {
            isThrottled = false;
        });

        // Mouse pozisyon hesaplama
        let clientX = event.clientX;
        let clientY = event.clientY;
        
        if (event.touches && event.touches.length > 0) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else if (clientX === undefined || clientY === undefined) {
            return;
        }

        mouse.x = (clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    let found = null;
    if (intersects.length > 0) {
        for (let i = 0; i < intersects.length; i++) {
            let current = intersects[i].object;
            while (current && current !== scene) {
                if (current.userData && current.userData.objectType) {
                    found = current;
                    break;
                }
                current = current.parent;
            }
            if (found) break;
        }
    }

    if (found) {
        if (hoveredObject !== found) {
            // Revert old hovered
            if (hoveredObject) clearHover(hoveredObject);
            
            // Apply new hover
            hoveredObject = found;
            applyHover(hoveredObject);
        }
    } else {
        if (hoveredObject) {
            clearHover(hoveredObject);
            hoveredObject = null;
        }
    }
    } catch (error) {
        console.error("onMouseMove error:", error);
    }
}

function applyHover(object) {
    document.body.style.cursor = 'pointer';
    object.traverse((child) => {
        if (child.isMesh && child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            
            if (!child.userData.originalEmissives) {
                child.userData.originalEmissives = [];
                materials.forEach((mat, index) => {
                    if (mat.emissive !== undefined) {
                        child.userData.originalEmissives[index] = mat.emissive.clone();
                    }
                });
            }
            
            materials.forEach((mat, index) => {
                if (mat.emissive !== undefined && child.userData.originalEmissives[index]) {
                    const original = child.userData.originalEmissives[index];
                    const targetEmissive = original.clone().add(new THREE.Color(0x444444));
                    
                    gsap.killTweensOf(mat.emissive);
                    gsap.to(mat.emissive, {
                        r: targetEmissive.r,
                        g: targetEmissive.g,
                        b: targetEmissive.b,
                        duration: 0.2,
                        ease: "power1.out"
                    });
                }
            });
        }
    });
}

function clearHover(object) {
    document.body.style.cursor = 'default';
    object.traverse((child) => {
        if (child.isMesh && child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((mat, index) => {
                if (mat.emissive !== undefined && child.userData.originalEmissives && child.userData.originalEmissives[index]) {
                    const original = child.userData.originalEmissives[index];
                    
                    gsap.killTweensOf(mat.emissive);
                    gsap.to(mat.emissive, {
                        r: original.r,
                        g: original.g,
                        b: original.b,
                        duration: 0.2,
                        ease: "power1.out"
                    });
                }
            });
        }
    });
}

export function onClick(event, camera, scene, callback) {
    try {
        // Mouse pozisyon hesaplama (normalized device coordinates: -1 to +1)
        let clientX = event.clientX;
        let clientY = event.clientY;
        
        if (event.changedTouches && event.changedTouches.length > 0) {
            clientX = event.changedTouches[0].clientX;
            clientY = event.changedTouches[0].clientY;
        } else if (clientX === undefined || clientY === undefined) {
            return;
        }

        mouse.x = (clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(clientY / window.innerHeight) * 2 + 1;

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
    } catch (error) {
        console.error("onClick error:", error);
    }
}

// Touch event'lerde 300ms delay kaldırma (touch-action: manipulation)
const style = document.createElement('style');
style.innerHTML = `
  canvas, button, input, select, textarea {
    touch-action: manipulation;
  }
`;
document.head.appendChild(style);
