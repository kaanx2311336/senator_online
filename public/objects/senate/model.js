import * as THREE from 'three';

// Shared Materials
const materialBase = new THREE.MeshLambertMaterial({ color: 0xFAF0E6, emissive: 0x111111 }); // White Marble
const materialRoof = new THREE.MeshLambertMaterial({ color: 0xB7410E, emissive: 0x1a0000 }); // Terracotta Red
const materialWindow = new THREE.MeshLambertMaterial({ color: 0x111122, emissive: 0x050510 }); // Dark windows
const materialGold = new THREE.MeshLambertMaterial({ color: 0xFFD700, emissive: 0x222200 }); // Gold

/**
 * Creates a Senate model based on level.
 * @param {number} level - The level of the senate (1-5).
 * @returns {THREE.Group} The senate group.
 */
function createSenateHigh(level = 1) {
    const group = new THREE.Group();
    group.name = 'Senate';

    // Base Dimensions
    const baseWidth = 16;
    const baseHeight = 8 + (level > 2 ? 2 : 0);
    const baseDepth = 12;

    // Base Building
    const baseGeo = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    const baseMesh = new THREE.Mesh(baseGeo, materialBase);
    baseMesh.position.y = baseHeight / 2;
    baseMesh.castShadow = false;
    baseMesh.receiveShadow = false;
    group.add(baseMesh);

    // Front Steps (3 steps)
    const stepCount = 3;
    const stepDepth = 1.5;
    const stepHeight = 1;
    for (let i = 0; i < stepCount; i++) {
        const currentStepWidth = baseWidth - 4;
        const currentStepDepth = stepDepth * (stepCount - i);
        const currentStepHeight = stepHeight;
        
        const stepGeo = new THREE.BoxGeometry(currentStepWidth, currentStepHeight, currentStepDepth);
        const stepMesh = new THREE.Mesh(stepGeo, materialBase);
        
        stepMesh.position.set(0, currentStepHeight / 2 + (i * currentStepHeight), baseDepth / 2 + currentStepDepth / 2);
        stepMesh.castShadow = false;
        stepMesh.receiveShadow = false;
        group.add(stepMesh);
    }

    // Columns (4 initially, up to 8 for higher levels)
    const numColumns = level === 1 ? 4 : (level < 4 ? 6 : 8);
    const columnRadius = 0.5;
    const columnHeight = baseHeight;
    const spacing = (baseWidth - 4) / (numColumns - 1);
    const startX = -(baseWidth - 4) / 2;

    for (let i = 0; i < numColumns; i++) {
        // CylinderGeometry minimum 16 segments
        const colGeo = new THREE.CylinderGeometry(columnRadius, columnRadius, columnHeight, 16, 1, false);
        const colMesh = new THREE.Mesh(colGeo, materialBase);
        
        colMesh.position.set(startX + (i * spacing), stepCount * stepHeight + columnHeight / 2, baseDepth / 2 + 1);
        colMesh.castShadow = false;
        colMesh.receiveShadow = false;
        group.add(colMesh);
    }

    // Pediment (Triangle)
    const pedimentWidth = baseWidth - 2;
    const pedimentHeight = 3;
    const pedimentDepth = 2;
    
    const shape = new THREE.Shape();
    shape.moveTo(-pedimentWidth / 2, 0);
    shape.lineTo(0, pedimentHeight);
    shape.lineTo(pedimentWidth / 2, 0);
    shape.lineTo(-pedimentWidth / 2, 0);

    const extrudeSettings = { depth: pedimentDepth, bevelEnabled: false };
    const pedimentGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const pedimentMesh = new THREE.Mesh(pedimentGeo, materialBase);
    
    pedimentMesh.position.set(0, stepCount * stepHeight + baseHeight, baseDepth / 2 + 1 - pedimentDepth / 2);
    pedimentMesh.castShadow = false;
    pedimentMesh.receiveShadow = false;
    group.add(pedimentMesh);

    // Gold decoration on pediment for level 4+
    if (level >= 4) {
        const decGeo = new THREE.CylinderGeometry(1, 1, 0.2, 16);
        const decMesh = new THREE.Mesh(decGeo, materialGold);
        decMesh.rotation.x = Math.PI / 2;
        decMesh.position.set(0, stepCount * stepHeight + baseHeight + 1, baseDepth / 2 + 1 + 0.1);
        decMesh.castShadow = false;
        decMesh.receiveShadow = false;
        group.add(decMesh);
    }

    // Dome (SphereGeometry min 16 segments, present even at level 1)
    const domeRadius = 4 + (level * 0.8);
    const domeSegments = 24; // >16
    const domeMaterial = level === 5 ? materialGold : materialRoof;
    
    const domeGeo = new THREE.SphereGeometry(domeRadius, domeSegments, domeSegments, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMesh = new THREE.Mesh(domeGeo, domeMaterial);
    domeMesh.position.y = baseHeight;
    domeMesh.castShadow = false;
    domeMesh.receiveShadow = false;
    group.add(domeMesh);

    // Side Wall Windows
    const windowWidth = 1.5;
    const windowHeight = 3;
    const windowDepth = 0.5;
    const numWindows = level > 2 ? 6 : 4;
    const winSpacing = baseDepth / (numWindows + 1);
    const startZ = -baseDepth / 2 + winSpacing;

    for(let side of [-1, 1]) {
        for (let i = 0; i < numWindows; i++) {
            const winGeo = new THREE.BoxGeometry(windowDepth, windowHeight, windowWidth);
            const winMesh = new THREE.Mesh(winGeo, materialWindow);
            const xPos = side * (baseWidth / 2 - windowDepth / 2);
            const zPos = startZ + (i * winSpacing);
            winMesh.position.set(xPos, baseHeight / 2 + 1, zPos);
            winMesh.castShadow = false;
            winMesh.receiveShadow = false;
            group.add(winMesh);
        }
    }
    
    return group;
}




/**
 * Creates a Senate LOD model.
 */
export function createSenate(level = 1) {
    const lod = new THREE.LOD();
    
    // High detail
    const high = createSenateHigh(level);
    
    // To generate simpler versions, we will use bounding boxes and basic shapes
    // Calculate bounding box from high detail model
    const box = new THREE.Box3().setFromObject(high);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    
    // Medium detail: A simplified version using just a few blocks or cylinder
    const mid = new THREE.Group();
    // For Colosseum/Tower/Fountain, cylinder is better. For others, box.
    const isCylindrical = ['Colosseum', 'Tower', 'Fountain', 'Statue'].includes('Senate');
    
    let midGeo, midMat, midMesh;
    if (isCylindrical) {
        midGeo = new THREE.CylinderGeometry(size.x/2, size.z/2, size.y, 4); // fewer segments
    } else {
        midGeo = new THREE.BoxGeometry(size.x, size.y, size.z);
    }
    
    // Average color from high detail
    midMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
    if (high.children && high.children.length > 0 && high.children[0].material) {
        if (high.children[0].material.color) {
            midMat.color.copy(high.children[0].material.color);
        }
    }
    
    midMesh = new THREE.Mesh(midGeo, midMat);
    midMesh.position.copy(center);
    if (isCylindrical) midMesh.position.y = size.y / 2; // Adjust for cylinder origin
    mid.add(midMesh);
    
    // Low detail: Very simple box
    const low = new THREE.Group();
    const lowGeo = new THREE.BoxGeometry(size.x, size.y, size.z);
    const lowMat = new THREE.MeshLambertMaterial({ color: 0x888888 }); // Generic gray
    if (midMat.color) {
        lowMat.color.copy(midMat.color);
    }
    const lowMesh = new THREE.Mesh(lowGeo, lowMat);
    lowMesh.castShadow = false;
    lowMesh.receiveShadow = false;
    lowMesh.position.copy(center);
    low.add(lowMesh);
    
    // Add levels to LOD
    // High: 0-50, Mid: 50-100, Low: 100+
    lod.addLevel(high, 0);
    lod.addLevel(mid, 50);
    lod.addLevel(low, 100);
    
    // Copy userData from high to LOD so raycasting and logic still works
    lod.userData = high.userData || {};
    lod.name = high.name || 'Senate';
    
    // Geometry dispose
    lod.dispose = function() {
        lod.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material && child.material !== materialBase && child.material !== materialRoof && child.material !== materialWindow && child.material !== materialGold) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });
    };

    return lod;
}
