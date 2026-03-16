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

    // Arches (simulated by adding dark box gaps)
    const archMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Dark gaps
    const numArches = 24;
    for (let i = 0; i < numArches; i++) {
        const angle = (i / numArches) * Math.PI * 2;
        const archWidth = 1.5;
        const archHeight = height * 0.3;
        const archDepth = 2;

        const archGeo = new THREE.BoxGeometry(archWidth, archHeight, archDepth);
        const archMesh = new THREE.Mesh(archGeo, archMaterial);
        
        // Position on the oval perimeter
        const x = Math.cos(angle) * (radiusX - 0.5);
        const z = Math.sin(angle) * (radiusZ - 0.5);
        
        archMesh.position.set(x, archHeight / 2, z);
        
        // Point outwards
        archMesh.lookAt(new THREE.Vector3(x * 2, archHeight / 2, z * 2));
        
        archMesh.castShadow = false;
        archMesh.receiveShadow = false;
        group.add(archMesh);
    }
    
    // Enhance based on level (optional)
    if (level > 1) {
        // Add upper tier arches
        for (let i = 0; i < numArches; i++) {
            const angle = (i / numArches) * Math.PI * 2 + (Math.PI / numArches); // Offset
            const archWidth = 1.2;
            const archHeight = height * 0.25;
            const archDepth = 2;

            const archGeo = new THREE.BoxGeometry(archWidth, archHeight, archDepth);
            const archMesh = new THREE.Mesh(archGeo, archMaterial);
            
            const x = Math.cos(angle) * (radiusX - 0.5);
            const z = Math.sin(angle) * (radiusZ - 0.5);
            
            archMesh.position.set(x, height * 0.5 + archHeight / 2, z);
            archMesh.lookAt(new THREE.Vector3(x * 2, height * 0.5 + archHeight / 2, z * 2));
            
            archMesh.castShadow = false;
            archMesh.receiveShadow = false;
            group.add(archMesh);
        }
    }

    return group;
}
