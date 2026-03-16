// public/objects/market/interact.js
import { tradeAnimation } from '../../js/interaction/animations.js';
import gsap from 'gsap';

export function onSelect(mesh, detailPanel, scene) {
    if (detailPanel) {
        detailPanel.innerHTML = `
            <h3>Market</h3>
            <p>Type: Commercial</p>
            <p>Level: ${mesh.userData.level || 1}</p>
            <div class="market-trades">
                <button id="buy-wood-btn" class="trade-btn">Buy Wood (10 Gold)</button>
                <button id="sell-wood-btn" class="trade-btn">Sell Wood (5 Gold)</button>
                <button id="upgrade-btn">Upgrade</button>
            </div>
        `;
        detailPanel.style.display = 'block';

        const buyBtn = document.getElementById('buy-wood-btn');
        if (buyBtn) {
            buyBtn.onclick = () => {
                // Trigger trade animation
                if (scene && mesh) {
                    tradeAnimation(scene, mesh.position);
                }
            };
        }

        const sellBtn = document.getElementById('sell-wood-btn');
        if (sellBtn) {
            sellBtn.onclick = () => {
                // Trigger trade animation
                if (scene && mesh) {
                    tradeAnimation(scene, mesh.position);
                }
            };
        }
    }

    // Pazar tezgahlarında hafif sallanma animasyonu (idle state).
    if (mesh) {
        // Store original rotation if not stored
        if (mesh.userData.originalRotationY === undefined) {
            mesh.userData.originalRotationY = mesh.rotation.y;
        }

        mesh.userData.idleAnimation = gsap.to(mesh.rotation, {
            y: mesh.userData.originalRotationY + 0.05,
            duration: 1,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        });
    }
}

export function onDeselect(mesh, detailPanel) {
    if (detailPanel) {
        detailPanel.style.display = 'none';
        detailPanel.innerHTML = '';
    }

    if (mesh && mesh.userData.idleAnimation) {
        mesh.userData.idleAnimation.kill();
        mesh.userData.idleAnimation = null;
        if (mesh.userData.originalRotationY !== undefined) {
            mesh.rotation.y = mesh.userData.originalRotationY;
        }
    }
}

export const isUpgradeable = true;

export function onUpgrade(level) {
    return import('./model.js').then(module => {
        return module.createMarket ? module.createMarket(level) : null;
    }).catch(err => {
        console.warn('Market model not implemented yet:', err);
        return null;
    });
}
