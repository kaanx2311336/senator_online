import * as THREE from 'three';

/**
 * Creates a House model based on level.
 * @param {number} level - The level of the house (1-5).
 * @returns {THREE.Group} The house group.
 */
export function createHouse(level = 1) {
    const group = new THREE.Group();
    group.name = 'House';

    const materialBase = new THREE.MeshLambertMaterial({ color: 0xE0CDA9, emissive: 0x111111 }); // Plaster/wood
    const materialRoof = new THREE.MeshLambertMaterial({ color: 0x8B3A3A, emissive: 0x1a0b0b }); // Terracotta
    const materialRoofAlt = new THREE.MeshLambertMaterial({ color: 0x9B4A4A, emissive: 0x1a0b0b }); // Alternate Terracotta
    const materialDoor = new THREE.MeshLambertMaterial({ color: 0x5C4033 }); // Dark wood
    const materialGarden = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // Grass/plants
    const materialPillar = new THREE.MeshLambertMaterial({ color: 0xFAF0E6, emissive: 0x222222 }); // Marble

    // Level 1: Simple Hut
    let width = 4;
    let height = 3;
    let depth = 4;

    if (level >= 3) {
        width = 6;
        height = 5;
        depth = 6;
    }
    if (level >= 4) {
        width = 8;
        height = 6;
        depth = 8;
    }
    if (level === 5) {
        width = 10;
        height = 6;
        depth = 10;
    }

    // Main Body
    const bodyGeo = new THREE.BoxGeometry(width, height, depth);
    const bodyMesh = new THREE.Mesh(bodyGeo, materialBase);
    bodyMesh.position.y = height / 2;
    bodyMesh.castShadow = false;
    bodyMesh.receiveShadow = false;
    group.add(bodyMesh);

    // Roof
    if (level === 1) {
        const roofGeo = new THREE.ConeGeometry(width * 0.7, 2, 4);
        const roofMesh = new THREE.Mesh(roofGeo, materialRoof);
        roofMesh.rotation.y = Math.PI / 4;
        roofMesh.position.y = height + 1;
        roofMesh.castShadow = false;
        roofMesh.receiveShadow = false;
        group.add(roofMesh);
        
        // Add some variation for tiles
        const roofGeoAlt = new THREE.ConeGeometry(width * 0.71, 1.8, 4);
        const roofMeshAlt = new THREE.Mesh(roofGeoAlt, materialRoofAlt);
        roofMeshAlt.rotation.y = Math.PI / 4 + 0.05;
        roofMeshAlt.position.y = height + 1;
        roofMeshAlt.castShadow = false;
        roofMeshAlt.receiveShadow = false;
        group.add(roofMeshAlt);
    } else {
        const roofGeo = new THREE.ConeGeometry(width * 0.8, height * 0.5, 4);
        const roofMesh = new THREE.Mesh(roofGeo, materialRoof);
        roofMesh.rotation.y = Math.PI / 4;
        roofMesh.position.y = height + height * 0.25;
        roofMesh.castShadow = false;
        roofMesh.receiveShadow = false;
        group.add(roofMesh);

        // Add some variation for tiles
        const roofGeoAlt = new THREE.ConeGeometry(width * 0.81, height * 0.45, 4);
        const roofMeshAlt = new THREE.Mesh(roofGeoAlt, materialRoofAlt);
        roofMeshAlt.rotation.y = Math.PI / 4 + 0.05;
        roofMeshAlt.position.y = height + height * 0.25;
        roofMeshAlt.castShadow = false;
        roofMeshAlt.receiveShadow = false;
        group.add(roofMeshAlt);
    }

    // Door
    const doorGeo = new THREE.BoxGeometry(width * 0.2, height * 0.4, 0.2);
    const doorMesh = new THREE.Mesh(doorGeo, materialDoor);
    doorMesh.position.set(0, height * 0.2, depth / 2 + 0.1);
    doorMesh.castShadow = false;
    doorMesh.receiveShadow = false;
    group.add(doorMesh);

    // Level 3+: Second Story / Balcony
    if (level >= 3) {
        const balcGeo = new THREE.BoxGeometry(width + 1, 0.5, depth + 1);
        const balcMesh = new THREE.Mesh(balcGeo, materialBase);
        balcMesh.position.y = height * 0.6;
        balcMesh.castShadow = false;
        balcMesh.receiveShadow = false;
        group.add(balcMesh);
    }

    // Level 5: Villa features (Garden, Pillars)
    if (level === 5) {
        // Courtyard / Garden Base
        const gardenGeo = new THREE.BoxGeometry(width + 6, 0.2, depth + 6);
        const gardenMesh = new THREE.Mesh(gardenGeo, materialGarden);
        gardenMesh.position.y = 0.1;
        gardenMesh.castShadow = false;
        gardenMesh.receiveShadow = false;
        group.add(gardenMesh);

        // Pillars around the house
        const numPillars = 4;
        for (let i = 0; i < numPillars; i++) {
            const px = (i % 2 === 0 ? 1 : -1) * (width / 2 + 1);
            const pz = (i < 2 ? 1 : -1) * (depth / 2 + 1);
            
            const pillarGeo = new THREE.CylinderGeometry(0.3, 0.3, height * 0.8, 8);
            const pillarMesh = new THREE.Mesh(pillarGeo, materialPillar);
            pillarMesh.position.set(px, height * 0.4, pz);
            pillarMesh.castShadow = false;
            pillarMesh.receiveShadow = false;
            group.add(pillarMesh);

            // Pillar bases and caps
            const pBaseGeo = new THREE.BoxGeometry(0.8, 0.3, 0.8);
            const pBaseMesh = new THREE.Mesh(pBaseGeo, materialPillar);
            pBaseMesh.position.set(px, 0.25, pz);
            pBaseMesh.castShadow = false;
            pBaseMesh.receiveShadow = false;
            group.add(pBaseMesh);

            const pCapGeo = new THREE.BoxGeometry(0.8, 0.3, 0.8);
            const pCapMesh = new THREE.Mesh(pCapGeo, materialPillar);
            pCapMesh.position.set(px, height * 0.8 - 0.15, pz);
            pCapMesh.castShadow = false;
            pCapMesh.receiveShadow = false;
            group.add(pCapMesh);
        }
    }
    
    return group;
}
