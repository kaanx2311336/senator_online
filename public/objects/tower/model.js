import * as THREE from 'three';

// Shared Materials
const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xD4C5A9, emissive: 0x111111 }); // Gray-white with slight glow
const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B3A3A, emissive: 0x1a0b0b }); // Tile red
const woodMaterial = new THREE.MeshLambertMaterial({ color: 0x5C4033 }); // Wood
const flagMaterial = new THREE.MeshLambertMaterial({ color: 0xCC0000, emissive: 0x330000 }); // Red flag
const roofPatternMat = new THREE.MeshLambertMaterial({ color: 0x7a3030, emissive: 0x1a0b0b });

/**
 * Creates a Tower model based on level.
 * @param {number} level - The level of the tower (1-5).
 * @returns {THREE.Group} The tower group.
 */
function createTowerHigh(level = 1) {
    const group = new THREE.Group();
    group.name = 'Tower';

    const radius = 2 + level * 0.5;
    const height = 8 + level * 3;

    // Main cylindrical body
    // Geometry optimization: reduced segments from 16 to 12
    const bodyGeo = new THREE.CylinderGeometry(radius, radius, height, 12);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMaterial);
    bodyMesh.position.y = height / 2;
    bodyMesh.castShadow = false;
    bodyMesh.receiveShadow = false;
    group.add(bodyMesh);

    // Level 2+: Reinforced bands
    if (level >= 2) {
        const numBands = level;
        for(let i = 1; i <= numBands; i++) {
            // Geometry optimization: reduced segments from 16 to 12
            const bandGeo = new THREE.CylinderGeometry(radius + 0.2, radius + 0.2, 0.5, 12);
            const bandMesh = new THREE.Mesh(bandGeo, woodMaterial);
            bandMesh.position.y = (height / (numBands + 1)) * i;
            bandMesh.castShadow = false;
            bandMesh.receiveShadow = false;
            group.add(bandMesh);
        }
    }

    // Upper platform
    const platformRadius = radius * 1.2;
    const platformHeight = 1;
    // Geometry optimization: reduced segments from 16 to 12
    const platformGeo = new THREE.CylinderGeometry(platformRadius, platformRadius, platformHeight, 12);
    const platformMesh = new THREE.Mesh(platformGeo, bodyMaterial);
    platformMesh.position.y = height + platformHeight / 2;
    platformMesh.castShadow = false;
    platformMesh.receiveShadow = false;
    group.add(platformMesh);

    // Level 3+: Crenellations
    if (level >= 3) {
        const numMerlons = 8 + level * 2;
        for (let i = 0; i < numMerlons; i++) {
            const angle = (i / numMerlons) * Math.PI * 2;
            const merlonWidth = platformRadius * 0.4;
            const merlonHeight = 1.5;
            const merlonDepth = 0.5;

            const merlonGeo = new THREE.BoxGeometry(merlonWidth, merlonHeight, merlonDepth);
            const merlonMesh = new THREE.Mesh(merlonGeo, bodyMaterial);
            
            const x = Math.cos(angle) * (platformRadius - merlonDepth / 2);
            const z = Math.sin(angle) * (platformRadius - merlonDepth / 2);
            
            merlonMesh.position.set(x, height + platformHeight + merlonHeight / 2, z);
            merlonMesh.lookAt(new THREE.Vector3(x * 2, height + platformHeight + merlonHeight / 2, z * 2));
            merlonMesh.castShadow = false;
            merlonMesh.receiveShadow = false;
            group.add(merlonMesh);
        }
    }

    // Conical Roof (Level 4+)
    if (level >= 4) {
        const roofRadius = platformRadius * 1.1;
        const roofHeight = 4 + level;
        // Geometry optimization: reduced segments from 16 to 12
        const roofGeo = new THREE.ConeGeometry(roofRadius, roofHeight, 12);
        const roofMesh = new THREE.Mesh(roofGeo, roofMaterial);
        roofMesh.position.y = height + platformHeight + roofHeight / 2;
        roofMesh.castShadow = false;
        roofMesh.receiveShadow = false;
        group.add(roofMesh);

        // Tile pattern effect
        // Geometry optimization: reduced segments from 8 to 6
        const roofPatternGeo = new THREE.ConeGeometry(roofRadius * 1.01, roofHeight * 0.98, 6);
        const roofPatternMesh = new THREE.Mesh(roofPatternGeo, roofPatternMat);
        roofPatternMesh.position.y = height + platformHeight + roofHeight * 0.98 / 2;
        roofPatternMesh.rotation.y = Math.PI / 8;
        roofPatternMesh.castShadow = false;
        roofPatternMesh.receiveShadow = false;
        group.add(roofPatternMesh);
        
        // Level 5: Flag
        if (level === 5) {
            // Geometry optimization: reduced segments from 8 to 4
            const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 4, 4);
            const poleMesh = new THREE.Mesh(poleGeo, woodMaterial);
            poleMesh.position.y = height + platformHeight + roofHeight + 2;
            poleMesh.castShadow = false;
            poleMesh.receiveShadow = false;
            group.add(poleMesh);
            
            const flagGeo = new THREE.PlaneGeometry(2, 1);
            const flagMesh = new THREE.Mesh(flagGeo, flagMaterial);
            flagMesh.position.set(1, height + platformHeight + roofHeight + 3.5, 0);
            flagMesh.castShadow = false;
            flagMesh.receiveShadow = false;
            group.add(flagMesh);
        }
    }
    
    return group;
}




/**
 * Creates a Tower LOD model.
 */
export function createTower(level = 1) {
    const lod = new THREE.LOD();
    
    // High detail
    const high = createTowerHigh(level);
    
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
    const isCylindrical = ['Colosseum', 'Tower', 'Fountain', 'Statue'].includes('Tower');
    
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
    lod.name = high.name || 'Tower';

    // Geometry dispose
    lod.dispose = function() {
        lod.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material && child.material !== bodyMaterial && child.material !== roofMaterial && child.material !== woodMaterial && child.material !== flagMaterial && child.material !== roofPatternMat) {
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
