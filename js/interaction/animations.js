// js/interaction/animations.js
import gsap from 'gsap';

/**
 * Tıklanan bina hafifçe zıplasın (y ekseni yukarı-aşağı, 0.3sn, ease: "back.out")
 * @param {THREE.Object3D} mesh 
 */
export function bounceAnimation(mesh) {
    if (!mesh) return;
    
    // Store original Y if not stored
    if (mesh.userData.originalY === undefined) {
        mesh.userData.originalY = mesh.position.y;
    }
    
    const originalY = mesh.userData.originalY;
    
    // Kill any existing animation on this mesh's position
    gsap.killTweensOf(mesh.position);
    
    mesh.position.y = originalY;
    
    // Bounce up and back down
    gsap.to(mesh.position, {
        y: originalY + 1.5,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        ease: "back.out(1.7)"
    });
}

/**
 * Seçim halkası hafif pulse efekti (scale 1→1.1→1, tekrarlı)
 * @param {THREE.Mesh} ring 
 */
export function selectionPulse(ring) {
    if (!ring) return;
    
    // Reset scale
    ring.scale.set(1, 1, 1);
    
    // Kill existing animations on this ring's scale
    gsap.killTweensOf(ring.scale);
    
    gsap.to(ring.scale, {
        x: 1.1,
        y: 1.1,
        z: 1.1,
        duration: 1,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
    });
}

/**
 * Detay paneli alttan kayarak gelsin
 */
export function panelSlideIn() {
    const panel = document.getElementById('detail-panel');
    if (panel) {
        // Ensure panel is visible before animating
        panel.style.display = 'block';
        
        gsap.killTweensOf(panel);
        
        // Start from below screen if it's currently hidden
        if (!panel.classList.contains('open')) {
            gsap.fromTo(panel, 
                { y: 500, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
            );
            panel.classList.add('open');
        } else {
            // Just animate to visible state if it's already considered open but not physically so
            gsap.to(panel, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" });
        }
    }
}

/**
 * Detay paneli aşağı kayarak gitsin
 */
export function panelSlideOut() {
    const panel = document.getElementById('detail-panel');
    if (panel && panel.classList.contains('open')) {
        gsap.killTweensOf(panel);
        gsap.to(panel, {
            y: 500,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                panel.classList.remove('open');
                panel.style.display = 'none';
            }
        });
    }
}
