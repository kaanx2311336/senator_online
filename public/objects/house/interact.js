// objects/house/interact.js
export function onSelect(mesh, detailPanel) {
    if (detailPanel) {
        detailPanel.innerHTML = `
            <h3>House</h3>
            <p>Type: Residential</p>
            <p>Level: ${mesh.userData.level || 1}</p>
            <p>Population: ${mesh.userData.population || 4}</p>
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
    return import('./model.js').then(module => {
        return module.createHouse(level);
    });
}
