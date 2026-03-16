export function onSelect(mesh, detailPanel) {
    if (detailPanel) {
        detailPanel.innerHTML = `
            <h3>Gemi</h3>
            <p>Tür: Ticaret Gemisi</p>
            <p>Durum: Demirlemiş</p>
            <button id="sail-btn">Yelken Aç</button>
        `;
        detailPanel.style.display = 'block';

        // Add event listener to the "Yelken Aç" button to trigger animation
        const sailBtn = document.getElementById('sail-btn');
        if (sailBtn) {
            sailBtn.addEventListener('click', () => {
                import('../../js/interaction/animations.js').then(module => {
                    module.animateShipMovement(mesh);
                });
            });
        }
        
        // Dynamic import
        import('../../js/interaction/animations.js').then(module => {
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
