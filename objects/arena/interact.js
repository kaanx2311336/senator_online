export function onSelect(arenaGroup) {
    if (!arenaGroup) return;
    
    // Change document cursor
    document.body.style.cursor = 'pointer';

    // Apply emissive glow
    arenaGroup.traverse((child) => {
        if (child.isMesh && child.material) {
            // Store original emissive color if not already stored
            if (!child.userData.originalEmissives) {
                child.userData.originalEmissives = [];
                // Support both single material and array of materials
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach(mat => {
                    if (mat.emissive) {
                        child.userData.originalEmissives.push(mat.emissive.getHex());
                        // Add glow
                        mat.emissive.addScalar(0.1); // Add a small value to RGB channels (like 0x222222)
                    } else {
                        child.userData.originalEmissives.push(0x000000); // Default black emissive
                    }
                });
            }
        }
    });

    console.log(`Arena (Level ${arenaGroup.userData.level || 1}) selected.`);
}

export function onDeselect(arenaGroup) {
    if (!arenaGroup) return;

    // Reset document cursor
    document.body.style.cursor = 'auto';

    // Remove emissive glow
    arenaGroup.traverse((child) => {
        if (child.isMesh && child.material && child.userData.originalEmissives) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((mat, index) => {
                if (mat.emissive && child.userData.originalEmissives[index] !== undefined) {
                    mat.emissive.setHex(child.userData.originalEmissives[index]);
                }
            });
            // Clear stored emissives so it can be selected again
            delete child.userData.originalEmissives;
        }
    });

    console.log(`Arena (Level ${arenaGroup.userData.level || 1}) deselected.`);
}

export function onUpgrade(arenaGroup) {
    if (!arenaGroup) return;

    // Increment level
    const currentLevel = arenaGroup.userData.level || 1;
    arenaGroup.userData.level = currentLevel + 1;

    console.log(`Arena upgraded to level ${arenaGroup.userData.level}`);

    // The actual geometry swap logic will be handled by the object loader or upgrade manager,
    // which calls createArena(newLevel) and replaces the old group.
}