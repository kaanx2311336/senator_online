export function onSelect(mesh, detailPanel) {
    if (detailPanel) {
        detailPanel.innerHTML = `
            <h3>Liman</h3>
            <p>Ticaret Rotalarını Yönet</p>
            <p>Seviye: ${mesh.userData.level || 1}</p>
            <p>Gelen Gemi: 0/3</p>
            <button id="upgrade-btn">Genişlet</button>
        `;
        detailPanel.style.display = 'block';
        
        // Dynamic import to avoid circular dependency
        import('../../js/interaction/animations.js').then(module => {
            module.showToast("Ticaret rotası paneli açıldı.");
            module.panelSlideIn();
        });
    }
}

export function onDeselect(mesh, detailPanel) {
    if (detailPanel) {
        detailPanel.style.display = 'none';
        detailPanel.innerHTML = '';
        
        // Dynamic import
        import('../../js/interaction/animations.js').then(module => {
            module.panelSlideOut();
        });
    }
}

export const isUpgradeable = true;

export function onUpgrade(level) {
    return import('./model.js').then(module => {
        // dynamic import animations
        import('../../js/interaction/animations.js').then(animModule => {
            animModule.showToast("Liman genişletildi! Daha fazla ticaret gemisi yanaşabilir.");
        });
        return module.createHarbor(level);
    });
}
