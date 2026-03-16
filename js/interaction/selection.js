// js/interaction/selection.js
import * as THREE from 'three';
import { bounceAnimation, selectionPulse, panelSlideIn, panelSlideOut } from './animations.js';

let selectedMesh = null;
let selectionRing = null;

// To store reference to dynamically loaded interact.js of the selected object
let currentInteractModule = null;

function createSelectionRing() {
    const geometry = new THREE.RingGeometry(2.5, 3.0, 32);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xffff00, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
    });
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.1;
    return ring;
}

function getObjectDirectory(mesh) {
    if (!mesh || !mesh.userData) return null;
    
    // Some objects might have their names like "Kolezyum", "Surlar", "Kule".
    // Try to map to directory.
    const name = (mesh.userData.objectName || "").toLowerCase();
    
    if (name.includes('kolezyum') || name.includes('colosseum')) return 'colosseum';
    if (name.includes('surlar') || name.includes('wall')) return 'wall';
    if (name.includes('kule') || name.includes('tower')) return 'tower';
    if (name.includes('ağaç') || name.includes('agac') || name.includes('tree')) return 'tree';
    if (name.includes('yol') || name.includes('road')) return 'road';
    if (name.includes('ev') || name.includes('house')) return 'house';
    if (name.includes('senato') || name.includes('senate')) return 'senate';
    
    return null;
}

export async function selectBuilding(mesh) {
    if (!mesh) return;

    if (selectedMesh) {
        if (selectedMesh === mesh) {
            return;
        }
        await deselectBuilding();
    }

    selectedMesh = mesh;

    bounceAnimation(selectedMesh);

    if (!selectionRing) {
        selectionRing = createSelectionRing();
    }
    
    const worldPos = new THREE.Vector3();
    selectedMesh.getWorldPosition(worldPos);
    selectionRing.position.set(worldPos.x, worldPos.y + 0.1, worldPos.z);
    
    if (selectedMesh.parent) {
        selectedMesh.parent.add(selectionRing);
    }

    selectionPulse(selectionRing);

    // Load and call interact.js
    const dir = getObjectDirectory(selectedMesh);
    if (dir) {
        try {
            currentInteractModule = await import(`../../objects/${dir}/interact.js`);
            const detailPanel = document.getElementById('detail-panel');
            if (currentInteractModule && currentInteractModule.onSelect) {
                currentInteractModule.onSelect(selectedMesh, detailPanel);
            }
        } catch (error) {
            console.warn(`interact.js could not be loaded for ${dir}:`, error);
        }
    }

    panelSlideIn();
}

export async function deselectBuilding() {
    if (selectedMesh) {
        // Remove ring
        if (selectionRing && selectionRing.parent) {
            selectionRing.parent.remove(selectionRing);
        }

        // Call onDeselect
        if (currentInteractModule && currentInteractModule.onDeselect) {
            const detailPanel = document.getElementById('detail-panel');
            currentInteractModule.onDeselect(selectedMesh, detailPanel);
        }

        selectedMesh = null;
        currentInteractModule = null;

        panelSlideOut();
    }
}
