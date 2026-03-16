import * as THREE from 'three';

/**
 * Creates a Tower model based on level.
 * @param {number} level - The level of the tower.
 * @returns {THREE.Group} The tower group.
 */
export function createTower(level) {
    const group = new THREE.Group();
    group.name = 'Tower';

    const radius = 3;
    const height = 10 + (level * 2); // Increases with level
    
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xD4C5A9 }); // Gray-white
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B3A3A }); // Tile red

    // Main cylindrical body
    const bodyGeo = new THREE.CylinderGeometry(radius, radius, height, 16);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMaterial);
    bodyMesh.position.y = height / 2;
    bodyMesh.castShadow = false;
    bodyMesh.receiveShadow = false;
    group.add(bodyMesh);

    // Crenellations upper platform
    const platformRadius = radius * 1.2;
    const platformHeight = 1;
    const platformGeo = new THREE.CylinderGeometry(platformRadius, platformRadius, platformHeight, 16);
    const platformMesh = new THREE.Mesh(platformGeo, bodyMaterial);
    platformMesh.position.y = height + platformHeight / 2;
    platformMesh.castShadow = false;
    platformMesh.receiveShadow = false;
    group.add(platformMesh);

    // Conical Roof
    const roofRadius = platformRadius * 1.1;
    const roofHeight = 4;
    const roofGeo = new THREE.ConeGeometry(roofRadius, roofHeight, 16);
    const roofMesh = new THREE.Mesh(roofGeo, roofMaterial);
    roofMesh.position.y = height + platformHeight + roofHeight / 2;
    roofMesh.castShadow = false;
    roofMesh.receiveShadow = false;
    group.add(roofMesh);

    // Optional Merlons around platform
    const numMerlons = 12;
    for (let i = 0; i < numMerlons; i++) {
        const angle = (i / numMerlons) * Math.PI * 2;
        const merlonWidth = 1;
        const merlonHeight = 1.5;
        const merlonDepth = 0.5;

        const merlonGeo = new THREE.BoxGeometry(merlonWidth, merlonHeight, merlonDepth);
        const merlonMesh = new THREE.Mesh(merlonGeo, bodyMaterial);
        
        const x = Math.cos(angle) * (platformRadius - merlonDepth / 2);
        const z = Math.sin(angle) * (platformRadius - merlonDepth / 2);
        
        merlonMesh.position.set(x, height + platformHeight + merlonHeight / 2, z);
        
        // Point outwards
        merlonMesh.lookAt(new THREE.Vector3(x * 2, height + platformHeight + merlonHeight / 2, z * 2));

        merlonMesh.castShadow = false;
        merlonMesh.receiveShadow = false;
        group.add(merlonMesh);
    }

    return group;
}
