import * as THREE from 'three';

/**
 * Creates a Fountain model.
 * @returns {THREE.Group} The fountain group.
 */
function createFountainHigh() {
    const group = new THREE.Group();
    group.name = 'Fountain';

    const materialBase = new THREE.MeshLambertMaterial({ color: 0xFAF0E6, emissive: 0x111111 }); // White marble
    const materialWater = new THREE.MeshLambertMaterial({ color: 0x4B9CD3, emissive: 0x1a4b8c, transparent: true, opacity: 0.8 }); // Water

    // Base Pool
    const poolGeo = new THREE.CylinderGeometry(3, 3, 0.5, 32);
    const poolMesh = new THREE.Mesh(poolGeo, materialBase);
    poolMesh.position.y = 0.25;
    poolMesh.castShadow = false;
    poolMesh.receiveShadow = false;
    group.add(poolMesh);

    // Inner Water
    const waterGeo = new THREE.CylinderGeometry(2.8, 2.8, 0.4, 32);
    const waterMesh = new THREE.Mesh(waterGeo, materialWater);
    waterMesh.position.y = 0.3;
    waterMesh.castShadow = false;
    waterMesh.receiveShadow = false;
    group.add(waterMesh);

    // Center Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.5, 0.8, 2, 16);
    const pillarMesh = new THREE.Mesh(pillarGeo, materialBase);
    pillarMesh.position.y = 1.5;
    pillarMesh.castShadow = false;
    pillarMesh.receiveShadow = false;
    group.add(pillarMesh);

    // Center Bowl
    const bowlGeo = new THREE.CylinderGeometry(1.5, 0.5, 0.5, 16);
    const bowlMesh = new THREE.Mesh(bowlGeo, materialBase);
    bowlMesh.position.y = 2.5;
    bowlMesh.castShadow = false;
    bowlMesh.receiveShadow = false;
    group.add(bowlMesh);

    // Water inside Center Bowl
    const topWaterGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.1, 16);
    const topWaterMesh = new THREE.Mesh(topWaterGeo, materialWater);
    topWaterMesh.position.y = 2.7;
    topWaterMesh.castShadow = false;
    topWaterMesh.receiveShadow = false;
    group.add(topWaterMesh);
    
    // Spout (top)
    const spoutGeo = new THREE.CylinderGeometry(0.2, 0.4, 0.6, 16);
    const spoutMesh = new THREE.Mesh(spoutGeo, materialBase);
    spoutMesh.position.y = 3;
    spoutMesh.castShadow = false;
    spoutMesh.receiveShadow = false;
    group.add(spoutMesh);
    
    // Falling Water (Simple cylinder to simulate jet)
    const jetGeo = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
    const jetMesh = new THREE.Mesh(jetGeo, materialWater);
    jetMesh.position.y = 3.6;
    jetMesh.castShadow = false;
    jetMesh.receiveShadow = false;
    group.add(jetMesh);

    return group;
}




/**
 * Creates a Fountain LOD model.
 */
export function createFountain() {
    const lod = new THREE.LOD();
    
    // High detail
    const high = createFountainHigh();
    
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
    const isCylindrical = ['Colosseum', 'Tower', 'Fountain', 'Statue'].includes('Fountain');
    
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
    lod.name = high.name || 'Fountain';
    
    return lod;
}
