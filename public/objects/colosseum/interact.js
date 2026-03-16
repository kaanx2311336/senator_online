// objects/colosseum/interact.js
export function onSelect(mesh, detailPanel) {
    if (detailPanel) {
        detailPanel.innerHTML = `
            <h3>Colosseum</h3>
            <p>Type: Colosseum</p>
            <p>Level: ${mesh.userData.level || 1}</p>
            <p>HP: ${mesh.userData.hp || 800}/${mesh.userData.maxHp || 800}</p>
            <button id="upgrade-btn">Upgrade</button>
        `;
        detailPanel.style.display = 'block';
    }
}

export function onDeselect(mesh, detailPanel) {
    if (detailPanel) {
        detailPanel.style.display = 'none';
        detailPanel.innerHTML = '';
    }
}

export const isUpgradeable = true;

export function onUpgrade(level) {
    // Return dynamically imported model creator to avoid circular deps or heavy init
    return import('./model.js').then(module => {
        return module.createColosseum(level);
    });
}
