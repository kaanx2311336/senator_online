import * as THREE from 'three';

/**
 * Creates a Colosseum model based on level.
 * @param {number} level - The level of the colosseum.
 * @returns {THREE.Group} The colosseum group.
 */
export function createColosseum(level) {
    const group = new THREE.Group();
    group.name = 'Colosseum';

    // Base Dimensions (Level 1)
    const radiusX = 15;
    const radiusZ = 12;
    const height = 8;
    
    const material = new THREE.MeshLambertMaterial({ color: 0xF0EAD6 }); // Off-white marble
    const arenaMaterial = new THREE.MeshLambertMaterial({ color: 0xD2B48C }); // Sand colored arena
    const archMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Dark gaps
    const gateMaterial = new THREE.MeshLambertMaterial({ color: 0x1A1A1A }); // Very dark gates

    // Outer Wall
    const outerGeo = new THREE.CylinderGeometry(radiusX, radiusX, height, 32);
    // Make it oval by scaling
    const outerWall = new THREE.Mesh(outerGeo, material);
    outerWall.scale.set(1, 1, radiusZ / radiusX);
    outerWall.position.y = height / 2;
    outerWall.castShadow = false;
    outerWall.receiveShadow = false;
    group.add(outerWall);

    // Inner seating (steps)
    const numSteps = 4;
    for (let i = 0; i < numSteps; i++) {
        const stepHeight = height * ((i + 1) / numSteps) * 0.8; // Max height is 80% of outer wall
        const stepRadiusX = radiusX * (1 - (i * 0.15)) - 1; // Decrease radius for inner steps
        
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

    // Inner Arena Floor (Sand colored circle)
    const arenaRadiusX = radiusX * (1 - (numSteps * 0.15)) - 1;
    if (arenaRadiusX > 0) {
        const arenaGeo = new THREE.CylinderGeometry(arenaRadiusX, arenaRadiusX, 0.2, 32);
        const arenaMesh = new THREE.Mesh(arenaGeo, arenaMaterial);
        arenaMesh.scale.set(1, 1, radiusZ / radiusX);
        arenaMesh.position.y = 0.1; // Just above the ground
        arenaMesh.castShadow = false;
        arenaMesh.receiveShadow = false;
        group.add(arenaMesh);
    }

    // Detailed Arches (Rows of arches on each floor)
    const numArches = 24;
    const numFloors = 3; // 3 floors of arches
    const floorHeight = height / (numFloors + 0.5); // Leave some space at top

    for (let floor = 0; floor < numFloors; floor++) {
        for (let i = 0; i < numArches; i++) {
            // Offset every other floor slightly for variety, or keep them aligned
            const angle = (i / numArches) * Math.PI * 2; 
            
            const archWidth = 1.2;
            const archHeight = floorHeight * 0.6;
            const archDepth = 2; // Deep enough to cut into the wall

            const archGeo = new THREE.BoxGeometry(archWidth, archHeight, archDepth);
            const archMesh = new THREE.Mesh(archGeo, archMaterial);
            
            // Position on the oval perimeter
            const x = Math.cos(angle) * (radiusX - 0.5);
            const z = Math.sin(angle) * (radiusZ - 0.5);
            
            const yPos = floor * floorHeight + archHeight / 2 + 0.5; // +0.5 to offset from ground slightly
            
            archMesh.position.set(x, yPos, z);
            
            // Point outwards
            archMesh.lookAt(new THREE.Vector3(x * 2, yPos, z * 2));
            
            archMesh.castShadow = false;
            archMesh.receiveShadow = false;
            group.add(archMesh);
        }
    }

    // Entrance Gates (4 large arches on front/back/sides)
    const gateAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5]; // Front, Right, Back, Left
    
    for (let i = 0; i < gateAngles.length; i++) {
        const angle = gateAngles[i];
        
        const gateWidth = 3; // Wider than normal arches
        const gateHeight = floorHeight * 1.5; // Taller
        const gateDepth = 3;
        
        const gateGeo = new THREE.BoxGeometry(gateWidth, gateHeight, gateDepth);
        const gateMesh = new THREE.Mesh(gateGeo, gateMaterial);
        
        // Position
        const x = Math.cos(angle) * (radiusX - 0.2); // Protrude slightly less or more? Let's make it cut deep
        const z = Math.sin(angle) * (radiusZ - 0.2);
        
        gateMesh.position.set(x, gateHeight / 2, z);
        
        // Point outwards
        gateMesh.lookAt(new THREE.Vector3(x * 2, gateHeight / 2, z * 2));
        
        gateMesh.castShadow = false;
        gateMesh.receiveShadow = false;
        group.add(gateMesh);
    }

    return group;
}
