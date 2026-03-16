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
    const material = new THREE.MeshLambertMaterial({ color: 0xD4C5A9 }); // white-gray

    // Main wall body
    const bodyGeo = new THREE.BoxGeometry(length, height, thickness);
    const bodyMesh = new THREE.Mesh(bodyGeo, material);
    bodyMesh.position.set(0, height / 2, 0);
    bodyMesh.castShadow = false;
    bodyMesh.receiveShadow = false;
    group.add(bodyMesh);

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
