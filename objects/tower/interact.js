// objects/tower/interact.js
export function onSelect(mesh, detailPanel) {
    if (detailPanel) {
        detailPanel.innerHTML = `
            <h3>Tower</h3>
            <p>Type: Defense Tower</p>
            <p>Level: ${mesh.userData.level || 1}</p>
            <p>Damage: ${mesh.userData.damage || 50}</p>
            <p>Range: ${mesh.userData.range || 10}</p>
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
