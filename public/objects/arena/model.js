import * as THREE from 'three';

// Materials are instantiated at the module level for performance
const baseMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc }); // Marble white
const woodMaterial = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
const sandMaterial = new THREE.MeshLambertMaterial({ color: 0xd2b48c });

export function createArena(level) {
    const group = new THREE.Group();
    group.userData.objectType = 'entertainment';
    group.userData.objectName = 'Arena';
    group.userData.level = level;

    // Base Dimensions
    let radiusTop, radiusBottom, height, radialSegments;
    
    switch (level) {
        case 1:
            radiusTop = 3;
            radiusBottom = 3;
            height = 1;
            radialSegments = 16;
            break;
        case 2:
            radiusTop = 4;
            radiusBottom = 4;
            height = 1.5;
            radialSegments = 24;
            break;
        case 3:
            radiusTop = 5;
            radiusBottom = 5;
            height = 2;
            radialSegments = 32;
            break;
        default:
            radiusTop = 3;
            radiusBottom = 3;
            height = 1;
            radialSegments = 16;
    }

    // Outer Wall
    const wallGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, 1, true);
    const wallMesh = new THREE.Mesh(wallGeo, baseMaterial);
    wallMesh.castShadow = false;
    wallMesh.receiveShadow = false;
    wallMesh.position.y = height / 2;
    group.add(wallMesh);

    // Arena Floor (Sand)
    const floorGeo = new THREE.CircleGeometry(radiusBottom - 0.2, radialSegments);
    const floorMesh = new THREE.Mesh(floorGeo, sandMaterial);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0.05; // Slightly above ground to avoid z-fighting
    floorMesh.castShadow = false;
    floorMesh.receiveShadow = false;
    group.add(floorMesh);
    
    // Wooden seating tiers
    const seatingGeo = new THREE.TorusGeometry(radiusBottom - 0.5, 0.2, 4, radialSegments);
    const seatingMesh = new THREE.Mesh(seatingGeo, woodMaterial);
    seatingMesh.rotation.x = Math.PI / 2;
    seatingMesh.position.y = height * 0.4;
    seatingMesh.castShadow = false;
    seatingMesh.receiveShadow = false;
    group.add(seatingMesh);

    if (level > 1) {
        const seatingGeo2 = new THREE.TorusGeometry(radiusBottom - 1.0, 0.2, 4, radialSegments);
        const seatingMesh2 = new THREE.Mesh(seatingGeo2, woodMaterial);
        seatingMesh2.rotation.x = Math.PI / 2;
        seatingMesh2.position.y = height * 0.2;
        seatingMesh2.castShadow = false;
        seatingMesh2.receiveShadow = false;
        group.add(seatingMesh2);
    }

    return group;
}

export function addFestivalDecorations(arenaGroup) {
    if (!arenaGroup) return;

    const level = arenaGroup.userData.level || 1;
    let radius = 3;
    if (level === 2) radius = 4;
    if (level === 3) radius = 5;
    
    const height = level === 1 ? 1 : level === 2 ? 1.5 : 2;

    const flagColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00]; // Red, Green, Blue, Yellow
    const flagGeo = new THREE.PlaneGeometry(0.5, 0.3);
    
    // Number of flags based on level
    const numFlags = level * 4;
    
    for (let i = 0; i < numFlags; i++) {
        const angle = (i / numFlags) * Math.PI * 2;
        const color = flagColors[i % flagColors.length];
        const flagMat = new THREE.MeshLambertMaterial({ color: color, side: THREE.DoubleSide });
        
        const flagMesh = new THREE.Mesh(flagGeo, flagMat);
        flagMesh.castShadow = false;
        flagMesh.receiveShadow = false;
        
        // Position flags on top of the outer wall
        flagMesh.position.x = Math.cos(angle) * radius;
        flagMesh.position.z = Math.sin(angle) * radius;
        flagMesh.position.y = height + 0.5; // Above the wall
        
        // Orient flags tangentially to the circle and pointing slightly outwards
        flagMesh.rotation.y = -angle + Math.PI / 2;
        
        arenaGroup.add(flagMesh);
        
        // Add a pole for the flag
        const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
        const poleMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
        const poleMesh = new THREE.Mesh(poleGeo, poleMat);
        poleMesh.castShadow = false;
        poleMesh.receiveShadow = false;
        poleMesh.position.x = Math.cos(angle) * radius;
        poleMesh.position.z = Math.sin(angle) * radius;
        poleMesh.position.y = height;
        arenaGroup.add(poleMesh);
    }

    // Add some flower decorations on the ground around the arena
    const numFlowers = level * 3;
    const flowerColors = [0xff69b4, 0xffa500, 0xdda0dd]; // Hot Pink, Orange, Plum
    const flowerGeo = new THREE.DodecahedronGeometry(0.2, 0);

    for (let i = 0; i < numFlowers; i++) {
        const angle = (i / numFlowers) * Math.PI * 2 + (Math.PI / numFlowers); // Offset slightly from flags
        const dist = radius + 0.5 + Math.random() * 0.5; // Placed outside the arena randomly
        
        const flowerColor = flowerColors[i % flowerColors.length];
        const flowerMat = new THREE.MeshLambertMaterial({ color: flowerColor });
        
        const flowerMesh = new THREE.Mesh(flowerGeo, flowerMat);
        flowerMesh.castShadow = false;
        flowerMesh.receiveShadow = false;
        flowerMesh.position.x = Math.cos(angle) * dist;
        flowerMesh.position.z = Math.sin(angle) * dist;
        flowerMesh.position.y = 0.1; // On the ground
        
        arenaGroup.add(flowerMesh);
    }
}