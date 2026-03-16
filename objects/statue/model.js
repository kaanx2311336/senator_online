import * as THREE from 'three';

// Shared Materials
const materialBase = new THREE.MeshLambertMaterial({ color: 0xD3D3D3, emissive: 0x111111 }); // Gray stone base
const materialStatue = new THREE.MeshLambertMaterial({ color: 0xFFFAFA, emissive: 0x151515 }); // White marble statue

/**
 * Creates a Roman Statue model.
 * @returns {THREE.Group} The statue group.
 */
function createStatueHigh() {
    const group = new THREE.Group();
    group.name = 'Statue';

    // Pedestal Base
    const pedGeo = new THREE.BoxGeometry(2, 2.5, 2);
    const pedMesh = new THREE.Mesh(pedGeo, materialBase);
    pedMesh.position.y = 1.25;
    pedMesh.castShadow = false;
    pedMesh.receiveShadow = false;
    group.add(pedMesh);

    // Pedestal Top Trim
    const trimGeo = new THREE.BoxGeometry(2.2, 0.4, 2.2);
    const trimMesh = new THREE.Mesh(trimGeo, materialBase);
    trimMesh.position.y = 2.7;
    trimMesh.castShadow = false;
    trimMesh.receiveShadow = false;
    group.add(trimMesh);

    // Statue Body (abstract humanoid form)
    // Geometry optimization: reduced segments from 16 to 8
    const bodyGeo = new THREE.CylinderGeometry(0.5, 0.7, 3, 8);
    const bodyMesh = new THREE.Mesh(bodyGeo, materialStatue);
    bodyMesh.position.y = 4.4; // 2.9 (trim top) + 1.5 (half height)
    bodyMesh.castShadow = false;
    bodyMesh.receiveShadow = false;
    group.add(bodyMesh);

    // Shoulders
    const shoulderGeo = new THREE.BoxGeometry(1.6, 0.6, 0.8);
    const shoulderMesh = new THREE.Mesh(shoulderGeo, materialStatue);
    shoulderMesh.position.y = 5.5;
    shoulderMesh.castShadow = false;
    shoulderMesh.receiveShadow = false;
    group.add(shoulderMesh);

    // Head
    // Geometry optimization: reduced segments from 16 to 8
    const headGeo = new THREE.SphereGeometry(0.5, 8, 8);
    const headMesh = new THREE.Mesh(headGeo, materialStatue);
    headMesh.position.y = 6.2;
    headMesh.castShadow = false;
    headMesh.receiveShadow = false;
    group.add(headMesh);

    // Arm (left, raised slightly)
    // Geometry optimization: reduced segments from 8 to 6
    const armLGeo = new THREE.CylinderGeometry(0.2, 0.25, 2, 6);
    const armLMesh = new THREE.Mesh(armLGeo, materialStatue);
    armLMesh.position.set(-1, 4.6, 0);
    armLMesh.rotation.z = Math.PI / 8;
    armLMesh.castShadow = false;
    armLMesh.receiveShadow = false;
    group.add(armLMesh);

    // Arm (right, pointing forward)
    // Geometry optimization: reduced segments from 8 to 6
    const armRGeo = new THREE.CylinderGeometry(0.2, 0.25, 1.8, 6);
    const armRMesh = new THREE.Mesh(armRGeo, materialStatue);
    armRMesh.position.set(1, 5, 0.5);
    armRMesh.rotation.x = Math.PI / 2.5;
    armRMesh.castShadow = false;
    armRMesh.receiveShadow = false;
    group.add(armRMesh);

    return group;
}




/**
 * Creates a Statue LOD model.
 */
export function createStatue() {
    const lod = new THREE.LOD();
    
    // High detail
    const high = createStatueHigh();
    
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
    const isCylindrical = ['Colosseum', 'Tower', 'Fountain', 'Statue'].includes('Statue');
    
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
    lod.name = high.name || 'Statue';

    // Geometry dispose
    lod.dispose = function() {
        lod.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material && child.material !== materialBase && child.material !== materialStatue) {
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
