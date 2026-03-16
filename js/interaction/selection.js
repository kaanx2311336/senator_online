// js/interaction/selection.js
import * as THREE from 'three';
import { bounceAnimation, selectionPulse, panelSlideIn, panelSlideOut, upgradeAnimation, insufficientResourceAnimation, showToast, panCameraTo, createUpgradeParticles } from './animations.js';
import { canAfford, spendResource } from '../ui/resourceManager.js';
import { updateShieldLabel } from '../ui/shieldLabels.js';

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

// To store reference to global camera and controls for panning
let globalCamera = null;
let globalControls = null;

export function setCameraAndControls(camera, controls) {
    globalCamera = camera;
    globalControls = controls;
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
    
    // Smooth pan camera if we have references
    if (globalCamera && globalControls) {
        panCameraTo(globalCamera, globalControls, worldPos);
    }
    
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
            
            // Attach upgrade event listener if the button exists
            const upgradeBtn = document.getElementById('upgrade-btn');
            if (upgradeBtn) {
                // Remove existing listener to prevent duplicates
                upgradeBtn.replaceWith(upgradeBtn.cloneNode(true));
                const newUpgradeBtn = document.getElementById('upgrade-btn');
                newUpgradeBtn.addEventListener('click', () => handleUpgradeClick(dir));
            }
        } catch (error) {
            console.warn(`interact.js could not be loaded for ${dir}:`, error);
        }
    }

    panelSlideIn();
}

async function handleUpgradeClick(dir) {
    if (!selectedMesh || !currentInteractModule || !currentInteractModule.isUpgradeable || !currentInteractModule.onUpgrade) return;
    
    // Load config to get cost
    let config;
    try {
        const configModule = await import(`../../objects/${dir}/config.json`, { with: { type: "json" } });
        config = configModule.default;
    } catch (e) {
        console.error("Could not load config for upgrade:", e);
        return;
    }
    
    const currentLevel = selectedMesh.userData.level || 1;
    const nextLevelData = config.levels.find(l => l.level === currentLevel + 1);
    
    if (!nextLevelData) {
        showToast("Maksimum seviyeye ulaşıldı.");
        return;
    }
    
    const cost = nextLevelData.cost;
    
    if (canAfford(cost)) {
        // Spend resources
        for (const [type, amount] of Object.entries(cost)) {
            spendResource(type, amount);
        }
        
        const parent = selectedMesh.parent;
        const position = selectedMesh.position.clone();
        const rotation = selectedMesh.rotation.clone();
        const oldY = selectedMesh.userData.originalY; // Get original Y if bounced
        if (oldY !== undefined) position.y = oldY;
        
        // Generate new mesh
        const newMesh = await currentInteractModule.onUpgrade(currentLevel + 1);
        
        // Copy properties
        newMesh.position.copy(position);
        newMesh.rotation.copy(rotation);
        newMesh.userData = { ...selectedMesh.userData, level: currentLevel + 1 };
        
        if (nextLevelData.capacity) newMesh.userData.capacity = nextLevelData.capacity;
        
        // Save ID references for shield update
        const shieldId = selectedMesh.userData.shieldId || `shield-${selectedMesh.uuid}`;
        newMesh.userData.shieldId = shieldId;

        // Add to scene and remove old
        const oldMesh = selectedMesh;
        parent.add(newMesh);
        parent.remove(oldMesh);
        
        // Deselect current to clear old references
        await deselectBuilding();
        
        // Trigger animations
        upgradeAnimation(newMesh);
        createUpgradeParticles(newMesh.parent, position);
        
        // Update shield label (DOM)
        updateShieldLabel(shieldId, currentLevel + 1);
        
        // Automatically re-select new mesh
        await selectBuilding(newMesh);
        
        showToast("Bina yükseltildi!");
    } else {
        insufficientResourceAnimation();
        showToast("Yetersiz kaynak!");
    }
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
