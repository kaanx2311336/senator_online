import * as THREE from 'three';

// Shared Materials
const material = new THREE.MeshLambertMaterial({ color: 0xF0EAD6, emissive: 0x111111 }); // Off-white marble with slight emissive
const arenaMaterial = new THREE.MeshLambertMaterial({ color: 0xD2B48C }); // Sand colored arena
const archMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Dark gaps
const gateMaterial = new THREE.MeshLambertMaterial({ color: 0x1A1A1A }); // Very dark gates
const goldMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700, emissive: 0x222200 });

/**
 * Creates a Colosseum model based on level.
 * @param {number} level - The level of the colosseum (1-5).
 * @returns {THREE.Group} The colosseum group.
 */
function createColosseumHigh(level = 1) {
    const group = new THREE.Group();
    group.name = 'Colosseum';

    // Base Dimensions
    const radiusX = 10 + level * 2;
    const radiusZ = 8 + level * 1.5;
    const height = 4 + level * 2;
    
    // Outer Wall
    // Geometry optimization: reduced segments from 32 to 24
    const outerGeo = new THREE.CylinderGeometry(radiusX, radiusX, height, 8);
    const outerWall = new THREE.Mesh(outerGeo, material);
    outerWall.scale.set(1, 1, radiusZ / radiusX);
    outerWall.position.y = height / 2;
    outerWall.castShadow = false;
    outerWall.receiveShadow = false;
    group.add(outerWall);

    // Inner seating (steps) - increases with level
    const numSteps = level;
    for (let i = 0; i < numSteps; i++) {
        const stepHeight = height * ((i + 1) / numSteps) * 0.8;
        const stepRadiusX = radiusX * (1 - (i * 0.15)) - 1;
        
        if (stepRadiusX > 0) {
            // Geometry optimization: reduced segments from 32 to 24
            const stepGeo = new THREE.CylinderGeometry(stepRadiusX, stepRadiusX, stepHeight, 8);
            const stepMesh = new THREE.Mesh(stepGeo, material);
            stepMesh.scale.set(1, 1, radiusZ / radiusX);
            stepMesh.position.y = stepHeight / 2;
            stepMesh.castShadow = false;
            stepMesh.receiveShadow = false;
            group.add(stepMesh);
        }
    }

    // Inner Arena Floor
    const arenaRadiusX = radiusX * (1 - (numSteps * 0.15)) - 1;
    if (arenaRadiusX > 0) {
        // Geometry optimization: reduced segments from 32 to 24
        const arenaGeo = new THREE.CylinderGeometry(arenaRadiusX, arenaRadiusX, 0.2, 8);
        const arenaMesh = new THREE.Mesh(arenaGeo, arenaMaterial);
        arenaMesh.scale.set(1, 1, radiusZ / radiusX);
        arenaMesh.position.y = 0.1;
        arenaMesh.castShadow = false;
        arenaMesh.receiveShadow = false;
        group.add(arenaMesh);
    }

    // Detailed Arches for Level 3+
    if (level >= 3) {
        const numArches = 16 + level * 4;
        const numFloors = level - 1;
        const floorHeight = height / (numFloors + 0.5);

        for (let floor = 0; floor < numFloors; floor++) {
            for (let i = 0; i < numArches; i++) {
                const angle = (i / numArches) * Math.PI * 2; 
                const archWidth = 1.0 + (level * 0.1);
                const archHeight = floorHeight * 0.6;
                const archDepth = 2;

                const archGeo = new THREE.BoxGeometry(archWidth, archHeight, archDepth);
                const archMesh = new THREE.Mesh(archGeo, archMaterial);
                archMesh.castShadow = false;
                archMesh.receiveShadow = false;
                
                const x = Math.cos(angle) * (radiusX - 0.5);
                const z = Math.sin(angle) * (radiusZ - 0.5);
                const yPos = floor * floorHeight + archHeight / 2 + 0.5;
                
                archMesh.position.set(x, yPos, z);
                archMesh.lookAt(new THREE.Vector3(x * 2, yPos, z * 2));
                
                archMesh.castShadow = false;
                archMesh.receiveShadow = false;
                group.add(archMesh);

                // Add a small decorative ledge below each arch
                const ledgeGeo = new THREE.BoxGeometry(archWidth * 1.2, 0.2, archDepth * 1.1);
                const ledgeMesh = new THREE.Mesh(ledgeGeo, material);
                ledgeMesh.castShadow = false;
                ledgeMesh.receiveShadow = false;
                ledgeMesh.position.set(x, yPos - archHeight / 2, z);
                ledgeMesh.lookAt(new THREE.Vector3(x * 2, yPos - archHeight / 2, z * 2));
                ledgeMesh.castShadow = false;
                ledgeMesh.receiveShadow = false;
                group.add(ledgeMesh);
            }
        }
    }

    // Entrance Gates
    const gateAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
    const gateHeight = height * 0.4;
    
    for (let i = 0; i < gateAngles.length; i++) {
        const angle = gateAngles[i];
        const gateWidth = 2 + level * 0.5;
        const gateDepth = 3;
        
        const gateGeo = new THREE.BoxGeometry(gateWidth, gateHeight, gateDepth);
        const gateMesh = new THREE.Mesh(gateGeo, gateMaterial);
        gateMesh.castShadow = false;
        gateMesh.receiveShadow = false;
        
        const x = Math.cos(angle) * (radiusX - 0.2);
        const z = Math.sin(angle) * (radiusZ - 0.2);
        
        gateMesh.position.set(x, gateHeight / 2, z);
        gateMesh.lookAt(new THREE.Vector3(x * 2, gateHeight / 2, z * 2));
        
        gateMesh.castShadow = false;
        gateMesh.receiveShadow = false;
        group.add(gateMesh);

        // Gold trim for level 5
        if (level === 5) {
            const trimGeo = new THREE.BoxGeometry(gateWidth + 0.4, gateHeight + 0.4, gateDepth - 1);
            const trimMesh = new THREE.Mesh(trimGeo, goldMaterial);
            trimMesh.castShadow = false;
            trimMesh.receiveShadow = false;
            trimMesh.position.set(x, gateHeight / 2, z);
            trimMesh.lookAt(new THREE.Vector3(x * 2, gateHeight / 2, z * 2));
            trimMesh.castShadow = false;
            trimMesh.receiveShadow = false;
            group.add(trimMesh);
        }
    }
    
    return group;
}




/**
 * Creates a Colosseum LOD model.
 */
export function createColosseum(level = 1) {
    const lod = new THREE.LOD();
    
    // High detail
    const high = createColosseumHigh(level);
    
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
    const isCylindrical = ['Colosseum', 'Tower', 'Fountain', 'Statue'].includes('Colosseum');
    
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
    lod.name = high.name || 'Colosseum';

    // Geometry dispose
    lod.dispose = function() {
        lod.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                // Material is shared, so don't dispose material to prevent issues with other instances,
                // or handle material disposing at a higher level if needed. 
                // But for LOD-specific materials like midMat, lowMat we should dispose them.
                if (child.material && child.material !== material && child.material !== arenaMaterial && child.material !== archMaterial && child.material !== gateMaterial && child.material !== goldMaterial) {
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
