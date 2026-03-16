import * as THREE from 'three';

/**
 * Creates a Roman Statue model.
 * @returns {THREE.Group} The statue group.
 */
export function createStatue() {
    const group = new THREE.Group();
    group.name = 'Statue';

    const materialBase = new THREE.MeshLambertMaterial({ color: 0xD3D3D3, emissive: 0x111111 }); // Gray stone base
    const materialStatue = new THREE.MeshLambertMaterial({ color: 0xFFFAFA, emissive: 0x151515 }); // White marble statue

    // Pedestal Base
    const pedGeo = new THREE.BoxGeometry(2, 2.5, 2);
    const pedMesh = new THREE.Mesh(pedGeo, materialBase);
    pedMesh.position.y = 1.25;
    pedMesh.castShadow = false;
    pedMesh.receiveShadow = false;
    group.add(pedMesh);

    // Pedestal Top Trim
    const trimGeo = new THREE.BoxGeometry(2.2, 0.4, 2.2);
    const trimMesh = new THREE.Mesh(trimGeo, materialBase);
    trimMesh.position.y = 2.7;
    trimMesh.castShadow = false;
    trimMesh.receiveShadow = false;
    group.add(trimMesh);

    // Statue Body (abstract humanoid form)
    const bodyGeo = new THREE.CylinderGeometry(0.5, 0.7, 3, 16);
    const bodyMesh = new THREE.Mesh(bodyGeo, materialStatue);
    bodyMesh.position.y = 4.4; // 2.9 (trim top) + 1.5 (half height)
    bodyMesh.castShadow = false;
    bodyMesh.receiveShadow = false;
    group.add(bodyMesh);

    // Shoulders
    const shoulderGeo = new THREE.BoxGeometry(1.6, 0.6, 0.8);
    const shoulderMesh = new THREE.Mesh(shoulderGeo, materialStatue);
    shoulderMesh.position.y = 5.5;
    shoulderMesh.castShadow = false;
    shoulderMesh.receiveShadow = false;
    group.add(shoulderMesh);

    // Head
    const headGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const headMesh = new THREE.Mesh(headGeo, materialStatue);
    headMesh.position.y = 6.2;
    headMesh.castShadow = false;
    headMesh.receiveShadow = false;
    group.add(headMesh);

    // Arm (left, raised slightly)
    const armLGeo = new THREE.CylinderGeometry(0.2, 0.25, 2, 8);
    const armLMesh = new THREE.Mesh(armLGeo, materialStatue);
    armLMesh.position.set(-1, 4.6, 0);
    armLMesh.rotation.z = Math.PI / 8;
    armLMesh.castShadow = false;
    armLMesh.receiveShadow = false;
    group.add(armLMesh);

    // Arm (right, pointing forward)
    const armRGeo = new THREE.CylinderGeometry(0.2, 0.25, 1.8, 8);
    const armRMesh = new THREE.Mesh(armRGeo, materialStatue);
    armRMesh.position.set(1, 5, 0.5);
    armRMesh.rotation.x = Math.PI / 2.5;
    armRMesh.castShadow = false;
    armRMesh.receiveShadow = false;
    group.add(armRMesh);

    return group;
}
