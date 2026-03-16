import * as THREE from 'three';

/**
 * Creates a Wall model.
 * @param {number} length - The length of the wall segment.
 * @returns {THREE.Group} The wall group.
 */
function createWallHigh(length = 10) {
    const group = new THREE.Group();
    group.name = 'Wall';

    const thickness = 2;
    const height = 5;
    const material = new THREE.MeshLambertMaterial({ color: 0xD4C5A9, emissive: 0x111111 }); // white-gray with faint glow
    const trimMaterial = new THREE.MeshLambertMaterial({ color: 0xB8A98D, emissive: 0x0a0a0a }); // slightly darker for details

    // Main wall body
    const bodyGeo = new THREE.BoxGeometry(length, height, thickness);
    const bodyMesh = new THREE.Mesh(bodyGeo, material);
    bodyMesh.position.set(0, height / 2, 0);
    bodyMesh.castShadow = false;
    bodyMesh.receiveShadow = false;
    group.add(bodyMesh);

    // Wall base trim
    const baseTrimGeo = new THREE.BoxGeometry(length, 0.5, thickness + 0.2);
    const baseTrimMesh = new THREE.Mesh(baseTrimGeo, trimMaterial);
    baseTrimMesh.position.set(0, 0.25, 0);
    baseTrimMesh.castShadow = false;
    baseTrimMesh.receiveShadow = false;
    group.add(baseTrimMesh);

    // Wall top trim
    const topTrimGeo = new THREE.BoxGeometry(length, 0.2, thickness + 0.2);
    const topTrimMesh = new THREE.Mesh(topTrimGeo, trimMaterial);
    topTrimMesh.position.set(0, height - 0.1, 0);
    topTrimMesh.castShadow = false;
    topTrimMesh.receiveShadow = false;
    group.add(topTrimMesh);

    // Crenellations (merlons)
    const merlonWidth = 1;
    const merlonHeight = 1;
    const merlonDepth = thickness;
    const spaceBetween = 1.5; // Gap + Width

    const numMerlons = Math.floor(length / spaceBetween);
    const startX = -length / 2 + merlonWidth / 2 + (length - (numMerlons * spaceBetween)) / 2;

    for (let i = 0; i < numMerlons; i++) {
        const merlonGeo = new THREE.BoxGeometry(merlonWidth, merlonHeight, merlonDepth);
        const merlonMesh = new THREE.Mesh(merlonGeo, material);
        merlonMesh.position.set(startX + i * spaceBetween, height + merlonHeight / 2, 0);
        merlonMesh.castShadow = false;
        merlonMesh.receiveShadow = false;
        group.add(merlonMesh);
    }

    return group;
}




/**
 * Creates a Wall LOD model.
 */
export function createWall(length = 10) {
    const lod = new THREE.LOD();
    
    // High detail
    const high = createWallHigh(length);
    
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
    const isCylindrical = ['Colosseum', 'Tower', 'Fountain', 'Statue'].includes('Wall');
    
    let midGeo, midMat, midMesh;
    if (isCylindrical) {
        midGeo = new THREE.CylinderGeometry(size.x/2, size.z/2, size.y, 8); // fewer segments
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
    lowMesh.position.copy(center);
    low.add(lowMesh);
    
    // Add levels to LOD
    // High: 0-50, Mid: 50-100, Low: 100+
    lod.addLevel(high, 0);
    lod.addLevel(mid, 50);
    lod.addLevel(low, 100);
    
    // Copy userData from high to LOD so raycasting and logic still works
    lod.userData = high.userData || {};
    lod.name = high.name || 'Wall';
    
    return lod;
}
