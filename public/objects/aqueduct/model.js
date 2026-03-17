import * as THREE from 'three';

// Shared Materials
const materialStone = new THREE.MeshLambertMaterial({ color: 0xAAAAAA }); // Light grey stone
const materialWater = new THREE.MeshLambertMaterial({ color: 0x4A90E2, transparent: true, opacity: 0.8 }); // Blue water

/**
 * Creates an Aqueduct segment.
 * @param {number} length - The overall length of the aqueduct.
 * @returns {THREE.Group} The aqueduct group.
 */
export function createAqueduct(length = 20) {
    const group = new THREE.Group();
    group.name = 'Su Kemeri';

    const archSpacing = 5; // Distance between pillar centers
    const numArches = Math.floor(length / archSpacing);
    const actualLength = numArches * archSpacing;

    const pillarWidth = 1.0;
    const pillarDepth = 2.0;
    const archHeight = 6.0;
    const pillarHeight = archHeight - (archSpacing / 2); // To leave room for the arch

    // Create pillars and arches
    for (let i = 0; i <= numArches; i++) {
        const xPos = -actualLength / 2 + (i * archSpacing);
        
        // Pillar
        const pillarGeo = new THREE.BoxGeometry(pillarWidth, pillarHeight, pillarDepth);
        const pillarMesh = new THREE.Mesh(pillarGeo, materialStone);
        pillarMesh.position.set(xPos, pillarHeight / 2, 0);
        pillarMesh.castShadow = false;
        pillarMesh.receiveShadow = false;
        group.add(pillarMesh);

        // Arch (between this pillar and the next, if not the last pillar)
        if (i < numArches) {
            // Half-cylinder to act as the top of the arch
            // A cylinder rotated on its side, open on the bottom. We'll use thetaLength = Math.PI to make it a half circle.
            const archRadius = (archSpacing - pillarWidth) / 2;
            const archGeo = new THREE.CylinderGeometry(archRadius, archRadius, pillarDepth, 16, 1, false, 0, Math.PI);
            const archMesh = new THREE.Mesh(archGeo, materialStone);
            // Rotate the cylinder so it arches over the X axis
            archMesh.rotation.x = Math.PI / 2;
            // Position the arch exactly between the current pillar and the next one
            archMesh.position.set(xPos + archSpacing / 2, pillarHeight, 0);
            archMesh.castShadow = false;
            archMesh.receiveShadow = false;
            group.add(archMesh);

            // Fill the top square area above the arch to make it a flat top bridge
            // The arch is a half-circle inside a bounding box of width `archSpacing - pillarWidth`
            // But we actually just need to make a straight solid piece spanning the gap over the arch
            // Alternatively, an ExtrudeGeometry for the bridge with an arch cutout is better, but since primitive low-poly is requested, 
            // a simple rectangular block covering above the arch works, and the half-cylinder acts as the inner arch.
            
            // Actually, wait, standard arch look: 
            // - The pillar goes up to `pillarHeight`
            // - The arch half-circle starts at `pillarHeight` and goes up to `pillarHeight + archRadius`.
            // - We need solid stone ABOVE the arch.
            const topFillHeight = archRadius;
            
            // Left piece of top fill (above right half of pillar i)
            const leftFillGeo = new THREE.BoxGeometry(pillarWidth/2, topFillHeight, pillarDepth);
            const leftFill = new THREE.Mesh(leftFillGeo, materialStone);
            leftFill.position.set(xPos + pillarWidth/4, pillarHeight + topFillHeight/2, 0);
            leftFill.castShadow = false;
            leftFill.receiveShadow = false;
            group.add(leftFill);

            // Right piece of top fill (above left half of pillar i+1)
            const rightFillGeo = new THREE.BoxGeometry(pillarWidth/2, topFillHeight, pillarDepth);
            const rightFill = new THREE.Mesh(rightFillGeo, materialStone);
            rightFill.position.set(xPos + archSpacing - pillarWidth/4, pillarHeight + topFillHeight/2, 0);
            rightFill.castShadow = false;
            rightFill.receiveShadow = false;
            group.add(rightFill);

            // Center fill piece above the arch curve? Actually a full box from pillar i to i+1 would cover the arch hole.
            // A more primitive way to do an arch with primitives: Use a Box and an inverted cylinder. But since we cannot do easy CSG (boolean operations) in standard Three.js without external libraries:
            // Let's use two boxes for the "legs" (the pillars) and a box on top for the bridge.
            // Wait, the prompt says: "BoxGeo + yarım daire"
            // If the arch is a half circle, its shape is filled. 
            // If we want a hole, we would use a RingGeometry or ExtrudeGeometry. 
            // Let's keep it simple: A long horizontal box on top of the pillars. The "arch" is represented by the pillars and a simple crossbar. 
            
            // To make it look like an arch:
            // A top bridge spanning the whole arch Spacing.
            const bridgeGeo = new THREE.BoxGeometry(archSpacing, 1.0, pillarDepth);
            const bridgeMesh = new THREE.Mesh(bridgeGeo, materialStone);
            // Put it above the arch top
            bridgeMesh.position.set(xPos + archSpacing/2, archHeight + 0.5, 0);
            bridgeMesh.castShadow = false;
            bridgeMesh.receiveShadow = false;
            group.add(bridgeMesh);
        }
    }

    // Water Channel on Top
    // Spans the entire actual length
    const channelWallThickness = 0.2;
    const channelHeight = 0.6;
    const channelY = archHeight + 1.0; // on top of the bridge
    
    // Bottom of the channel
    const channelBottomGeo = new THREE.BoxGeometry(actualLength + pillarWidth, channelWallThickness, pillarDepth);
    const channelBottomMesh = new THREE.Mesh(channelBottomGeo, materialStone);
    channelBottomMesh.position.set(0, channelY + channelWallThickness/2, 0);
    channelBottomMesh.castShadow = false;
    channelBottomMesh.receiveShadow = false;
    group.add(channelBottomMesh);

    // Side walls
    const channelSideGeo = new THREE.BoxGeometry(actualLength + pillarWidth, channelHeight, channelWallThickness);
    
    const frontWall = new THREE.Mesh(channelSideGeo, materialStone);
    frontWall.position.set(0, channelY + channelHeight/2, pillarDepth/2 - channelWallThickness/2);
    frontWall.castShadow = false;
    frontWall.receiveShadow = false;
    group.add(frontWall);

    const backWall = new THREE.Mesh(channelSideGeo, materialStone);
    backWall.position.set(0, channelY + channelHeight/2, -pillarDepth/2 + channelWallThickness/2);
    backWall.castShadow = false;
    backWall.receiveShadow = false;
    group.add(backWall);

    // Water
    const waterDepth = channelHeight * 0.7;
    const waterGeo = new THREE.BoxGeometry(actualLength + pillarWidth, waterDepth, pillarDepth - channelWallThickness * 2);
    const waterMesh = new THREE.Mesh(waterGeo, materialWater);
    waterMesh.position.set(0, channelY + channelWallThickness + waterDepth/2, 0);
    waterMesh.castShadow = false;
    waterMesh.receiveShadow = false;
    group.add(waterMesh);

    group.dispose = function() {
        group.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
            }
        });
    };

    return group;
}
