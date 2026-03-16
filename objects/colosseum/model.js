import * as THREE from 'three';

/**
 * Creates a Colosseum model based on level.
 * @param {number} level - The level of the colosseum (1-5).
 * @returns {THREE.Group} The colosseum group.
 */
export function createColosseum(level = 1) {
    const group = new THREE.Group();
    group.name = 'Colosseum';

    // Base Dimensions
    const radiusX = 10 + level * 2;
    const radiusZ = 8 + level * 1.5;
    const height = 4 + level * 2;
    
    const material = new THREE.MeshLambertMaterial({ color: 0xF0EAD6 }); // Off-white marble
    const arenaMaterial = new THREE.MeshLambertMaterial({ color: 0xD2B48C }); // Sand colored arena
    const archMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Dark gaps
    const gateMaterial = new THREE.MeshLambertMaterial({ color: 0x1A1A1A }); // Very dark gates
    const goldMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });

    // Outer Wall
    const outerGeo = new THREE.CylinderGeometry(radiusX, radiusX, height, 32);
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
            const stepGeo = new THREE.CylinderGeometry(stepRadiusX, stepRadiusX, stepHeight, 32);
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
        const arenaGeo = new THREE.CylinderGeometry(arenaRadiusX, arenaRadiusX, 0.2, 32);
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
                
                const x = Math.cos(angle) * (radiusX - 0.5);
                const z = Math.sin(angle) * (radiusZ - 0.5);
                const yPos = floor * floorHeight + archHeight / 2 + 0.5;
                
                archMesh.position.set(x, yPos, z);
                archMesh.lookAt(new THREE.Vector3(x * 2, yPos, z * 2));
                
                archMesh.castShadow = false;
                archMesh.receiveShadow = false;
                group.add(archMesh);
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
            trimMesh.position.set(x, gateHeight / 2, z);
            trimMesh.lookAt(new THREE.Vector3(x * 2, gateHeight / 2, z * 2));
            trimMesh.castShadow = false;
            trimMesh.receiveShadow = false;
            group.add(trimMesh);
        }
    }
    
    return group;
}
