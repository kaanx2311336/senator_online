export function onSelect(object) {
  if (!object) return;
  
  // Apply selection highlight
  object.traverse((child) => {
    if (child.isMesh) {
      if (child.userData.originalEmissive === undefined) {
        child.userData.originalEmissive = child.material.emissive ? child.material.emissive.getHex() : 0x000000;
      }
      // Add a slight emissive glow
      child.material.emissive.setHex(child.userData.originalEmissive + 0x222222);
    }
  });
  
  document.body.style.cursor = 'pointer';
}

export function onDeselect(object) {
  if (!object) return;
  
  // Remove selection highlight
  object.traverse((child) => {
    if (child.isMesh && child.userData.originalEmissive !== undefined) {
      child.material.emissive.setHex(child.userData.originalEmissive);
    }
  });
  
  document.body.style.cursor = 'default';
}

export function onUpgrade(object, newLevel) {
  // Can trigger animations or sound effects here for upgrades
  console.log(`Çiftlik upgraded to level ${newLevel}`);
}
