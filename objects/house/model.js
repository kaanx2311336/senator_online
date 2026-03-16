import * as THREE from 'three';

// Shared Materials
const materialBase = new THREE.MeshLambertMaterial({ color: 0xE0CDA9, emissive: 0x111111 }); // Plaster/wood
const materialRoof = new THREE.MeshLambertMaterial({ color: 0x8B3A3A, emissive: 0x1a0b0b }); // Terracotta
const materialDoor = new THREE.MeshLambertMaterial({ color: 0x3E2723 }); // Darker brown
const materialDoorFrame = new THREE.MeshLambertMaterial({ color: 0x5C4033 }); // Frame brown
const materialWindow = new THREE.MeshLambertMaterial({ color: 0x111118, emissive: 0x050510 }); // Dark window
const materialGarden = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // Grass/plants
const materialPillar = new THREE.MeshLambertMaterial({ color: 0xFAF0E6, emissive: 0x222222 }); // Marble

/**
 * Creates a House model based on level.
 * @param {number} level - The level of the house (1-5).
 * @returns {THREE.Group} The house group.
 */
export function createHouse(level = 1) {
    const group = new THREE.Group();
    group.name = 'House';

    let width = 4 + (level * 1.5);
    let height = 3 + (level * 0.8);
    let depth = 4 + (level * 1.5);

    // Main Body
    const bodyGeo = new THREE.BoxGeometry(width, height, depth);
    const bodyMesh = new THREE.Mesh(bodyGeo, materialBase);
    bodyMesh.position.y = height / 2;
    bodyMesh.castShadow = false;
    bodyMesh.receiveShadow = false;
    group.add(bodyMesh);

    // Roof (Düzgün üçgen çatı - Prism geometry using ExtrudeGeometry or ConeGeometry)
    const roofHeight = 2 + (level * 0.5);
    const roofOverhang = 0.5;
    
    // Create a triangular prism for the roof
    const shape = new THREE.Shape();
    shape.moveTo(-(width + roofOverhang) / 2, 0);
    shape.lineTo(0, roofHeight);
    shape.lineTo((width + roofOverhang) / 2, 0);
    shape.lineTo(-(width + roofOverhang) / 2, 0);

    const extrudeSettings = { depth: depth + roofOverhang, bevelEnabled: false };
    const roofGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const roofMesh = new THREE.Mesh(roofGeo, materialRoof);
    roofMesh.position.set(0, height, (depth + roofOverhang) / 2);
    roofMesh.rotation.y = Math.PI; // Face the right way
    roofMesh.castShadow = false;
    roofMesh.receiveShadow = false;
    group.add(roofMesh);

    // Door and Frame
    const doorWidth = 1.2 + (level * 0.2);
    const doorHeight = 2.0 + (level * 0.2);
    
    const doorFrameGeo = new THREE.BoxGeometry(doorWidth + 0.4, doorHeight + 0.2, 0.3);
    const doorFrameMesh = new THREE.Mesh(doorFrameGeo, materialDoorFrame);
    doorFrameMesh.position.set(0, doorHeight / 2, depth / 2 + 0.05);
    doorFrameMesh.castShadow = false;
    doorFrameMesh.receiveShadow = false;
    group.add(doorFrameMesh);

    const doorGeo = new THREE.BoxGeometry(doorWidth, doorHeight, 0.4);
    const doorMesh = new THREE.Mesh(doorGeo, materialDoor);
    doorMesh.position.set(0, doorHeight / 2, depth / 2 + 0.05);
    doorMesh.castShadow = false;
    doorMesh.receiveShadow = false;
    group.add(doorMesh);

    // Windows (2 yan duvarlarda)
    const winWidth = 1.0;
    const winHeight = 1.2;
    const winDepth = 0.4;
    
    for (const side of [-1, 1]) {
        const winGeo = new THREE.BoxGeometry(winDepth, winHeight, winWidth);
        const winMesh = new THREE.Mesh(winGeo, materialWindow);
        const winX = side * (width / 2 + 0.05);
        const winY = height * 0.5;
        winMesh.position.set(winX, winY, 0);
        winMesh.castShadow = false;
        winMesh.receiveShadow = false;
        group.add(winMesh);
        
        // Window Frame
        const winFrameGeo = new THREE.BoxGeometry(winDepth + 0.1, winHeight + 0.2, winWidth + 0.2);
        const winFrameMesh = new THREE.Mesh(winFrameGeo, materialDoorFrame);
        winFrameMesh.position.set(winX, winY, 0);
        winFrameMesh.castShadow = false;
        winFrameMesh.receiveShadow = false;
        group.add(winFrameMesh);
    }

    // Level 3+: Second Story / Balcony
    if (level >= 3) {
        const balcGeo = new THREE.BoxGeometry(width + 1.5, 0.4, depth + 1.5);
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
            
            // Geometry optimization: reduced segments from 8 to 6
            const pillarGeo = new THREE.CylinderGeometry(0.3, 0.3, height * 0.8, 6, 1, true);
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

    // Geometry dispose
    group.dispose = function() {
        group.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material && !['MeshLambertMaterial'].includes(child.material.type)) {
                    // Safe cleanup if custom materials added
                }
            }
        });
    };
    
    return group;
}
