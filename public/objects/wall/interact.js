// objects/wall/interact.js
export function onSelect(mesh, detailPanel) {
    if (detailPanel) {
        detailPanel.innerHTML = `
            <h3>Wall</h3>
            <p>Type: Defense</p>
            <p>Provides basic defense against attacks.</p>
            <p>HP: ${mesh.userData.hp || 500}/${mesh.userData.maxHp || 500}</p>
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

export const isUpgradeable = false;
