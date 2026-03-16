import * as THREE from 'three';

/**
 * Creates a Senate model based on level.
 * @param {number} level - The level of the senate.
 * @returns {THREE.Group} The senate group.
 */
export function createSenate(level) {
    const group = new THREE.Group();
    group.name = 'Senate';

    const materialBase = new THREE.MeshLambertMaterial({ color: 0xFAF0E6 }); // White marble
    const materialRoof = new THREE.MeshLambertMaterial({ color: 0xB7410E }); // Terracotta
    const materialWindow = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Dark windows

    // Base Building
    const baseWidth = 16;
    const baseHeight = 8;
    const baseDepth = 12;
    const baseGeo = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    const baseMesh = new THREE.Mesh(baseGeo, materialBase);
    baseMesh.position.y = baseHeight / 2;
    baseMesh.castShadow = false;
    baseMesh.receiveShadow = false;
    group.add(baseMesh);

    // Detailed Dome (Increased segments)
    const domeRadius = 6;
    const domeSegments = 32; // More detailed dome
    const domeGeo = new THREE.SphereGeometry(domeRadius, domeSegments, domeSegments, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMesh = new THREE.Mesh(domeGeo, materialRoof);
    domeMesh.position.y = baseHeight;
    domeMesh.castShadow = false;
    domeMesh.receiveShadow = false;
    group.add(domeMesh);

    // Front Steps (Stepped BoxGeometries)
    const stepCount = 4;
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

    // Columns with Capitals
    const numColumns = 6;
    const columnRadius = 0.4;
    const columnHeight = baseHeight;
    const spacing = (baseWidth - 4) / (numColumns - 1);
    const startX = -(baseWidth - 4) / 2;

    for (let i = 0; i < numColumns; i++) {
        // Column Shaft
        const colGeo = new THREE.CylinderGeometry(columnRadius, columnRadius, columnHeight, 16);
        const colMesh = new THREE.Mesh(colGeo, materialBase);
        colMesh.position.set(startX + (i * spacing), columnHeight / 2, baseDepth / 2 + 1);
        colMesh.castShadow = false;
        colMesh.receiveShadow = false;
        group.add(colMesh);

        // Column Capital (Small BoxGeometry on top)
        const capGeo = new THREE.BoxGeometry(columnRadius * 3, 0.4, columnRadius * 3);
        const capMesh = new THREE.Mesh(capGeo, materialBase);
        capMesh.position.set(startX + (i * spacing), columnHeight + 0.2, baseDepth / 2 + 1);
        capMesh.castShadow = false;
        capMesh.receiveShadow = false;
        group.add(capMesh);
        
        // Column Base
        const baseColGeo = new THREE.BoxGeometry(columnRadius * 3, 0.4, columnRadius * 3);
        const baseColMesh = new THREE.Mesh(baseColGeo, materialBase);
        baseColMesh.position.set(startX + (i * spacing), stepCount * stepHeight + 0.2, baseDepth / 2 + 1); // Place on top step
        baseColMesh.castShadow = false;
        baseColMesh.receiveShadow = false;
        group.add(baseColMesh);
        
        // Adjust column shaft position to sit on base
        colMesh.position.y = stepCount * stepHeight + 0.4 + columnHeight / 2;
        capMesh.position.y = stepCount * stepHeight + 0.4 + columnHeight + 0.2;
    }

    // Pediment (Triangle above columns)
    const pedimentWidth = baseWidth - 2;
    const pedimentHeight = 3;
    const pedimentDepth = 2;
    
    // Create triangle using shape
    const shape = new THREE.Shape();
    shape.moveTo(-pedimentWidth / 2, 0);
    shape.lineTo(0, pedimentHeight);
    shape.lineTo(pedimentWidth / 2, 0);
    shape.lineTo(-pedimentWidth / 2, 0);

    const extrudeSettings = {
        depth: pedimentDepth,
        bevelEnabled: false
    };

    const pedimentGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const pedimentMesh = new THREE.Mesh(pedimentGeo, materialBase);
    pedimentMesh.position.set(0, stepCount * stepHeight + 0.4 + columnHeight + 0.4, baseDepth / 2 + 1 - pedimentDepth / 2);
    pedimentMesh.castShadow = false;
    pedimentMesh.receiveShadow = false;
    group.add(pedimentMesh);


    // Side Wall Windows (Recessed BoxGeometries)
    const windowWidth = 1.5;
    const windowHeight = 3;
    const windowDepth = 0.5;
    const numWindows = 4;
    const winSpacing = baseDepth / (numWindows + 1);
    const startZ = -baseDepth / 2 + winSpacing;

    for(let side of [-1, 1]) {
        for (let i = 0; i < numWindows; i++) {
            const winGeo = new THREE.BoxGeometry(windowDepth, windowHeight, windowWidth);
            const winMesh = new THREE.Mesh(winGeo, materialWindow);
            
            // Position slightly recessed into the wall
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
