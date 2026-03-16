// js/interaction/selection.js
import * as THREE from 'three';
import { bounceAnimation, selectionPulse, panelSlideIn, panelSlideOut, upgradeAnimation, insufficientResourceAnimation, showToast, panCameraTo, createUpgradeParticles } from './animations.js';
import { canAfford, spendResource } from '../ui/resourceManager.js';
import { updateShieldLabel } from '../ui/shieldLabels.js';
import { loadInteract, loadConfig } from './objectModules.js';

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
    if (name.includes('tapınak') || name.includes('tapinak') || name.includes('temple')) return 'temple';
    if (name.includes('liman') || name.includes('harbor')) return 'harbor';
    if (name.includes('gemi') || name.includes('ship')) return 'ship';
    if (name.includes('kışla') || name.includes('kisla') || name.includes('barracks')) return 'barracks';
    
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
    try {
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
                currentInteractModule = await loadInteract(dir);
                const detailPanel = document.getElementById('detail-panel');
                if (currentInteractModule && currentInteractModule.onSelect) {
                    currentInteractModule.onSelect(selectedMesh, detailPanel);
                    
                    // Inject Festival button if this is a Colosseum
                    if (dir === 'colosseum') {
                        // Modify header text
                        const h3 = detailPanel.querySelector('h3');
                        if (h3) h3.textContent = 'Kolezyum / Arena';
                        
                        // Restyle upgrade button and append festival button
                        const upgradeBtn = detailPanel.querySelector('#upgrade-btn');
                        if (upgradeBtn) {
                            upgradeBtn.textContent = 'Yükselt';
                            upgradeBtn.className = 'bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded mb-2 w-full';
                            
                            // Check if festival button already exists to avoid duplicates
                            if (!detailPanel.querySelector('#festival-btn')) {
                                const festivalBtn = document.createElement('button');
                                festivalBtn.id = 'festival-btn';
                                festivalBtn.className = 'bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded w-full';
                                festivalBtn.textContent = 'Festival Başlat';
                                upgradeBtn.insertAdjacentElement('afterend', festivalBtn);
                                
                                festivalBtn.addEventListener('click', () => {
                                    import('./animations.js').then(module => {
                                        module.startFestivalAnimation(selectedMesh.parent, selectedMesh);
                                    }).catch(err => {
                                        console.error("Festival animation import error:", err);
                                    });
                                });
                            }
                        }
                    }
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
    } catch (err) {
        console.error("selectBuilding error:", err);
    }
}

async function handleUpgradeClick(dir) {
    try {
        if (!selectedMesh || !currentInteractModule || !currentInteractModule.isUpgradeable || !currentInteractModule.onUpgrade) return;
    
    // Load config to get cost
    let config;
    try {
        config = await loadConfig(dir);
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
    } catch (err) {
        console.error("handleUpgradeClick error:", err);
    }
}

export async function deselectBuilding() {
    try {
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
    } catch (err) {
        console.error("deselectBuilding error:", err);
    }
}
