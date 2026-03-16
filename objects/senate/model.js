import * as THREE from 'three';

/**
 * Creates a Senate model based on level.
 * @param {number} level - The level of the senate (1-5).
 * @returns {THREE.Group} The senate group.
 */
export function createSenate(level = 1) {
    const group = new THREE.Group();
    group.name = 'Senate';

    const materialBase = new THREE.MeshLambertMaterial({ color: 0xFAF0E6 }); // White marble
    const materialRoof = new THREE.MeshLambertMaterial({ color: 0xB7410E }); // Terracotta
    const materialWindow = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Dark windows
    const materialGold = new THREE.MeshLambertMaterial({ color: 0xFFD700 }); // Gold

    // Base Dimensions
    const baseWidth = 16;
    const baseHeight = 8 + (level > 2 ? 2 : 0); // taller base for level 3+
    const baseDepth = 12;

    // Base Building
    const baseGeo = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    const baseMesh = new THREE.Mesh(baseGeo, materialBase);
    baseMesh.position.y = baseHeight / 2;
    baseMesh.castShadow = false;
    baseMesh.receiveShadow = false;
    group.add(baseMesh);

    // Front Steps
    const stepCount = level > 1 ? 4 : 2; // more steps for higher levels
    const stepDepth = 1.5;
    const stepHeight = 1;
    for (let i = 0; i < stepCount; i++) {
        const currentStepWidth = baseWidth - 4;
        const currentStepDepth = stepDepth * (stepCount - i);
        const currentStepHeight = stepHeight;
        
        const stepGeo = new THREE.BoxGeometry(currentStepWidth, currentStepHeight, currentStepDepth);
        const stepMesh = new THREE.Mesh(stepGeo, materialBase);
        
        stepMesh.position.set(0, currentStepHeight / 2 + (i * currentStepHeight), baseDepth / 2 + currentStepDepth / 2);
        stepMesh.castShadow = false;
        stepMesh.receiveShadow = false;
        group.add(stepMesh);
    }

    // Level 2+ details: Columns
    if (level >= 2) {
        const numColumns = level > 3 ? 8 : 6;
        const columnRadius = 0.4;
        const columnHeight = baseHeight;
        const spacing = (baseWidth - 4) / (numColumns - 1);
        const startX = -(baseWidth - 4) / 2;

        for (let i = 0; i < numColumns; i++) {
            const colGeo = new THREE.CylinderGeometry(columnRadius, columnRadius, columnHeight, 16);
            const colMesh = new THREE.Mesh(colGeo, materialBase);
            colMesh.castShadow = false;
            colMesh.receiveShadow = false;
            group.add(colMesh);

            const capGeo = new THREE.BoxGeometry(columnRadius * 3, 0.4, columnRadius * 3);
            const capMesh = new THREE.Mesh(capGeo, level === 5 ? materialGold : materialBase);
            capMesh.castShadow = false;
            capMesh.receiveShadow = false;
            group.add(capMesh);
            
            const baseColGeo = new THREE.BoxGeometry(columnRadius * 3, 0.4, columnRadius * 3);
            const baseColMesh = new THREE.Mesh(baseColGeo, materialBase);
            baseColMesh.castShadow = false;
            baseColMesh.receiveShadow = false;
            group.add(baseColMesh);
            
            baseColMesh.position.set(startX + (i * spacing), stepCount * stepHeight + 0.2, baseDepth / 2 + 1);
            colMesh.position.set(startX + (i * spacing), stepCount * stepHeight + 0.4 + columnHeight / 2, baseDepth / 2 + 1);
            capMesh.position.set(startX + (i * spacing), stepCount * stepHeight + 0.4 + columnHeight + 0.2, baseDepth / 2 + 1);
        }
    }

    // Level 3+ details: Pediment
    if (level >= 3) {
        const pedimentWidth = baseWidth - 2;
        const pedimentHeight = 3;
        const pedimentDepth = 2;
        
        const shape = new THREE.Shape();
        shape.moveTo(-pedimentWidth / 2, 0);
        shape.lineTo(0, pedimentHeight);
        shape.lineTo(pedimentWidth / 2, 0);
        shape.lineTo(-pedimentWidth / 2, 0);

        const extrudeSettings = { depth: pedimentDepth, bevelEnabled: false };
        const pedimentGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const pedimentMesh = new THREE.Mesh(pedimentGeo, materialBase);
        pedimentMesh.position.set(0, stepCount * stepHeight + 0.4 + baseHeight + 0.4, baseDepth / 2 + 1 - pedimentDepth / 2);
        pedimentMesh.castShadow = false;
        pedimentMesh.receiveShadow = false;
        group.add(pedimentMesh);

        // Gold decoration on pediment for level 5
        if (level === 5) {
            const decGeo = new THREE.CylinderGeometry(1, 1, 0.2, 16);
            const decMesh = new THREE.Mesh(decGeo, materialGold);
            decMesh.rotation.x = Math.PI / 2;
            decMesh.position.set(0, stepCount * stepHeight + 0.4 + baseHeight + 0.4 + 1, baseDepth / 2 + 1 + 0.1);
            decMesh.castShadow = false;
            decMesh.receiveShadow = false;
            group.add(decMesh);
        }
    }

    // Level 4+ details: Dome
    if (level >= 4) {
        const domeRadius = level === 5 ? 8 : 6;
        const domeSegments = level === 5 ? 64 : 32;
        const domeGeo = new THREE.SphereGeometry(domeRadius, domeSegments, domeSegments, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMesh = new THREE.Mesh(domeGeo, level === 5 ? materialGold : materialRoof);
        domeMesh.position.y = baseHeight;
        domeMesh.castShadow = false;
        domeMesh.receiveShadow = false;
        group.add(domeMesh);
        
        // Base for dome
        const domeBaseGeo = new THREE.CylinderGeometry(domeRadius, domeRadius, 2, domeSegments);
        const domeBaseMesh = new THREE.Mesh(domeBaseGeo, materialBase);
        domeBaseMesh.position.y = baseHeight + 1;
        domeBaseMesh.castShadow = false;
        domeBaseMesh.receiveShadow = false;
        group.add(domeBaseMesh);
        domeMesh.position.y = baseHeight + 2;
    } else {
        // Simple roof for level 1-3
        const roofGeo = new THREE.BoxGeometry(baseWidth + 1, 1, baseDepth + 1);
        const roofMesh = new THREE.Mesh(roofGeo, materialRoof);
        roofMesh.position.y = baseHeight + 0.5;
        roofMesh.castShadow = false;
        roofMesh.receiveShadow = false;
        group.add(roofMesh);
    }

    // Side Wall Windows
    const windowWidth = 1.5;
    const windowHeight = 3;
    const windowDepth = 0.5;
    const numWindows = level > 2 ? 6 : 4;
    const winSpacing = baseDepth / (numWindows + 1);
    const startZ = -baseDepth / 2 + winSpacing;

    for(let side of [-1, 1]) {
        for (let i = 0; i < numWindows; i++) {
            const winGeo = new THREE.BoxGeometry(windowDepth, windowHeight, windowWidth);
            const winMesh = new THREE.Mesh(winGeo, materialWindow);
            const xPos = side * (baseWidth / 2 - windowDepth / 2);
            const zPos = startZ + (i * winSpacing);
            winMesh.position.set(xPos, baseHeight / 2 + 1, zPos);
            winMesh.castShadow = false;
            winMesh.receiveShadow = false;
            group.add(winMesh);
        }
    }
    
    return group;
}
