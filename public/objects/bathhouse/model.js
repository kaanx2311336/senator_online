import * as THREE from 'three';

// Shared Materials
const materialWall = new THREE.MeshLambertMaterial({ color: 0xE0CDA9 }); // Plaster
const materialWater = new THREE.MeshLambertMaterial({ color: 0x4A90E2, transparent: true, opacity: 0.8 }); // Blue water
const materialMarble = new THREE.MeshLambertMaterial({ color: 0xFAF0E6 }); // Marble
const materialRoof = new THREE.MeshLambertMaterial({ color: 0x8B3A3A }); // Terracotta roof
const materialDarkWood = new THREE.MeshLambertMaterial({ color: 0x3E2723 }); // Wood

export function createBathhouse(level = 1) {
    const group = new THREE.Group();
    group.name = 'Hamam';

    let width = 6 + (level * 1.5);
    let depth = 6 + (level * 1.5);
    let height = 3 + (level * 0.5);

    // Common Base
    const baseGeo = new THREE.BoxGeometry(width, 0.5, depth);
    const baseMesh = new THREE.Mesh(baseGeo, level >= 5 ? materialMarble : materialWall);
    baseMesh.position.y = 0.25;
    baseMesh.castShadow = false;
    baseMesh.receiveShadow = false;
    group.add(baseMesh);

    if (level < 3) {
        // Level 1-2: Small pool + walls
        const poolWidth = width * 0.6;
        const poolDepth = depth * 0.6;

        const poolGeo = new THREE.BoxGeometry(poolWidth, 0.2, poolDepth);
        const poolMesh = new THREE.Mesh(poolGeo, materialWater);
        poolMesh.position.y = 0.6;
        poolMesh.castShadow = false;
        poolMesh.receiveShadow = false;
        group.add(poolMesh);

        // Walls around
        const wallThickness = 0.5;
        const wallHeight = height;
        
        // Back wall
        const backWallGeo = new THREE.BoxGeometry(width, wallHeight, wallThickness);
        const backWallMesh = new THREE.Mesh(backWallGeo, materialWall);
        backWallMesh.position.set(0, wallHeight/2 + 0.5, -depth/2 + wallThickness/2);
        backWallMesh.castShadow = false;
        backWallMesh.receiveShadow = false;
        group.add(backWallMesh);
        
        // Side walls
        const sideWallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, depth - wallThickness);
        const leftWall = new THREE.Mesh(sideWallGeo, materialWall);
        leftWall.position.set(-width/2 + wallThickness/2, wallHeight/2 + 0.5, wallThickness/2);
        leftWall.castShadow = false;
        leftWall.receiveShadow = false;
        group.add(leftWall);

        const rightWall = new THREE.Mesh(sideWallGeo, materialWall);
        rightWall.position.set(width/2 - wallThickness/2, wallHeight/2 + 0.5, wallThickness/2);
        rightWall.castShadow = false;
        rightWall.receiveShadow = false;
        group.add(rightWall);

    } else if (level < 5) {
        // Level 3-4: Domed bathhouse, colonnaded entrance, steam effect support
        const buildingWidth = width * 0.8;
        const buildingDepth = depth * 0.8;
        
        const bldgGeo = new THREE.BoxGeometry(buildingWidth, height, buildingDepth);
        const bldgMesh = new THREE.Mesh(bldgGeo, materialWall);
        bldgMesh.position.y = height/2 + 0.5;
        bldgMesh.castShadow = false;
        bldgMesh.receiveShadow = false;
        group.add(bldgMesh);

        // Dome
        const domeRadius = buildingWidth * 0.4;
        const domeGeo = new THREE.SphereGeometry(domeRadius, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMesh = new THREE.Mesh(domeGeo, materialRoof);
        domeMesh.position.y = height + 0.5;
        domeMesh.castShadow = false;
        domeMesh.receiveShadow = false;
        group.add(domeMesh);

        // Colonnaded entrance
        const entranceWidth = buildingWidth * 0.6;
        const colRadius = 0.3;
        const colHeight = height * 0.8;
        for (let i = 0; i < 4; i++) {
            const px = -entranceWidth/2 + (entranceWidth / 3) * i;
            const pz = buildingDepth/2 + 1;
            
            const colGeo = new THREE.CylinderGeometry(colRadius, colRadius, colHeight, 16, 1, true);
            const colMesh = new THREE.Mesh(colGeo, materialMarble);
            colMesh.position.set(px, colHeight/2 + 0.5, pz);
            colMesh.castShadow = false;
            colMesh.receiveShadow = false;
            group.add(colMesh);
        }

        // Roof over entrance
        const entRoofGeo = new THREE.BoxGeometry(entranceWidth + 1, 0.5, 2);
        const entRoofMesh = new THREE.Mesh(entRoofGeo, materialRoof);
        entRoofMesh.position.set(0, colHeight + 0.75, buildingDepth/2 + 1);
        entRoofMesh.castShadow = false;
        entRoofMesh.receiveShadow = false;
        group.add(entRoofMesh);
        
        // Steam placeholder point (for particles)
        const steamDummy = new THREE.Object3D();
        steamDummy.name = "SteamSource";
        steamDummy.position.set(0, height + domeRadius + 1, 0);
        group.add(steamDummy);

    } else {
        // Level 5: Large bathhouse complex, multiple pools, marble floor
        // Main Building
        const mainW = width * 0.6;
        const mainD = depth * 0.6;
        const bldgGeo = new THREE.BoxGeometry(mainW, height, mainD);
        const bldgMesh = new THREE.Mesh(bldgGeo, materialMarble);
        bldgMesh.position.y = height/2 + 0.5;
        bldgMesh.castShadow = false;
        bldgMesh.receiveShadow = false;
        group.add(bldgMesh);

        // Main Dome
        const domeRadius = mainW * 0.45;
        const domeGeo = new THREE.SphereGeometry(domeRadius, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMesh = new THREE.Mesh(domeGeo, materialRoof);
        domeMesh.position.y = height + 0.5;
        domeMesh.castShadow = false;
        domeMesh.receiveShadow = false;
        group.add(domeMesh);

        // Side Pools (Wings)
        const wingW = width * 0.3;
        const wingD = depth * 0.4;
        const wingH = height * 0.6;
        for (const dir of [-1, 1]) {
            const wingX = dir * (mainW/2 + wingW/2);
            
            // Wing Building
            const wingGeo = new THREE.BoxGeometry(wingW, wingH, wingD);
            const wingMesh = new THREE.Mesh(wingGeo, materialMarble);
            wingMesh.position.set(wingX, wingH/2 + 0.5, 0);
            wingMesh.castShadow = false;
            wingMesh.receiveShadow = false;
            group.add(wingMesh);

            // Wing Roof (Half Cylinder)
            const wingRoofGeo = new THREE.CylinderGeometry(wingD/2, wingD/2, wingW, 16, 1, false, 0, Math.PI);
            const wingRoofMesh = new THREE.Mesh(wingRoofGeo, materialRoof);
            wingRoofMesh.rotation.z = Math.PI/2;
            wingRoofMesh.position.set(wingX, wingH + 0.5, 0);
            wingRoofMesh.castShadow = false;
            wingRoofMesh.receiveShadow = false;
            group.add(wingRoofMesh);

            // Exterior Pool
            const extPoolW = wingW * 0.8;
            const extPoolD = depth * 0.3;
            const extPoolGeo = new THREE.BoxGeometry(extPoolW, 0.3, extPoolD);
            const extPoolMesh = new THREE.Mesh(extPoolGeo, materialWater);
            extPoolMesh.position.set(wingX, 0.65, mainD/2 + extPoolD/2 + 0.5);
            extPoolMesh.castShadow = false;
            extPoolMesh.receiveShadow = false;
            group.add(extPoolMesh);
        }

        // Colonnade around main building
        const colRadius = 0.4;
        const colHeight = height * 1.2;
        for (let i = 0; i < 6; i++) {
            const px = -mainW/2 + (mainW / 5) * i;
            const pz = mainD/2 + 1.5;
            
            const colGeo = new THREE.CylinderGeometry(colRadius, colRadius, colHeight, 16, 1, true);
            const colMesh = new THREE.Mesh(colGeo, materialMarble);
            colMesh.position.set(px, colHeight/2 + 0.5, pz);
            colMesh.castShadow = false;
            colMesh.receiveShadow = false;
            group.add(colMesh);
        }
        
        const entRoofGeo = new THREE.BoxGeometry(mainW + 1, 0.6, 2.5);
        const entRoofMesh = new THREE.Mesh(entRoofGeo, materialRoof);
        entRoofMesh.position.set(0, colHeight + 0.8, mainD/2 + 1.5);
        entRoofMesh.castShadow = false;
        entRoofMesh.receiveShadow = false;
        group.add(entRoofMesh);

        // Steam placeholders
        const steamDummy1 = new THREE.Object3D();
        steamDummy1.name = "SteamSource1";
        steamDummy1.position.set(0, height + domeRadius + 1, 0);
        group.add(steamDummy1);
        
        const steamDummy2 = new THREE.Object3D();
        steamDummy2.name = "SteamSource2";
        steamDummy2.position.set(mainW/2 + wingW/2, wingH + 2, 0);
        group.add(steamDummy2);
        
        const steamDummy3 = new THREE.Object3D();
        steamDummy3.name = "SteamSource3";
        steamDummy3.position.set(-(mainW/2 + wingW/2), wingH + 2, 0);
        group.add(steamDummy3);
    }

    group.dispose = function() {
        group.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
            }
        });
    };

    return group;
}
