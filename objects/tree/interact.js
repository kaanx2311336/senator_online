// objects/tree/interact.js
export function onSelect(mesh, detailPanel) {
    if (detailPanel) {
        detailPanel.innerHTML = `
            <h3>Tree</h3>
            <p>Type: Decoration</p>
            <p>A beautiful tree.</p>
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
