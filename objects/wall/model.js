import * as THREE from 'three';

/**
 * Creates a Wall model.
 * @param {number} length - The length of the wall segment.
 * @returns {THREE.Group} The wall group.
 */
export function createWall(length = 10) {
    const group = new THREE.Group();
    group.name = 'Wall';

    const thickness = 2;
    const height = 5;
    const material = new THREE.MeshLambertMaterial({ color: 0xD4C5A9, emissive: 0x111111 }); // white-gray with faint glow
    const trimMaterial = new THREE.MeshLambertMaterial({ color: 0xB8A98D, emissive: 0x0a0a0a }); // slightly darker for details

    // Main wall body
    const bodyGeo = new THREE.BoxGeometry(length, height, thickness);
    const bodyMesh = new THREE.Mesh(bodyGeo, material);
    bodyMesh.position.set(0, height / 2, 0);
    bodyMesh.castShadow = false;
    bodyMesh.receiveShadow = false;
    group.add(bodyMesh);

    // Wall base trim
    const baseTrimGeo = new THREE.BoxGeometry(length, 0.5, thickness + 0.2);
    const baseTrimMesh = new THREE.Mesh(baseTrimGeo, trimMaterial);
    baseTrimMesh.position.set(0, 0.25, 0);
    baseTrimMesh.castShadow = false;
    baseTrimMesh.receiveShadow = false;
    group.add(baseTrimMesh);

    // Wall top trim
    const topTrimGeo = new THREE.BoxGeometry(length, 0.2, thickness + 0.2);
    const topTrimMesh = new THREE.Mesh(topTrimGeo, trimMaterial);
    topTrimMesh.position.set(0, height - 0.1, 0);
    topTrimMesh.castShadow = false;
    topTrimMesh.receiveShadow = false;
    group.add(topTrimMesh);

    // Crenellations (merlons)
    const merlonWidth = 1;
    const merlonHeight = 1;
    const merlonDepth = thickness;
    const spaceBetween = 1.5; // Gap + Width

    const numMerlons = Math.floor(length / spaceBetween);
    const startX = -length / 2 + merlonWidth / 2 + (length - (numMerlons * spaceBetween)) / 2;

    for (let i = 0; i < numMerlons; i++) {
        const merlonGeo = new THREE.BoxGeometry(merlonWidth, merlonHeight, merlonDepth);
        const merlonMesh = new THREE.Mesh(merlonGeo, material);
        merlonMesh.position.set(startX + i * spaceBetween, height + merlonHeight / 2, 0);
        merlonMesh.castShadow = false;
        merlonMesh.receiveShadow = false;
        group.add(merlonMesh);
    }

    return group;
}
