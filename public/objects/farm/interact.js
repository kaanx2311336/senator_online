import * as THREE from 'three';
import gsap from 'gsap';
import { addResource } from '../../js/ui/resourceManager.js';

export function onSelect(mesh, detailPanel) {
    if (detailPanel) {
        const level = mesh.userData.level || 1;
        detailPanel.innerHTML = `
            <h3>Çiftlik</h3>
            <p>Tür: Üretim</p>
            <p>Seviye: ${level}</p>
            <button id="upgrade-btn" class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded w-full mt-2">Yükselt</button>
        `;
        detailPanel.style.display = 'block';
    }

    // Trigger harvest immediately upon selection
    harvest(mesh);

    // Apply selection highlight
    mesh.traverse((child) => {
        if (child.isMesh) {
            if (child.userData.originalEmissive === undefined) {
                child.userData.originalEmissive = child.material.emissive ? child.material.emissive.getHex() : 0x000000;
            }
            // Add a slight emissive glow
            child.material.emissive.setHex(child.userData.originalEmissive + 0x222222);
        }
    });

    document.body.style.cursor = 'pointer';

    // Show production panel
    if (window.RomanUI && window.RomanUI.ProductionPanel) {
        window.RomanUI.ProductionPanel.show();
    }
}

export function onDeselect(mesh, detailPanel) {
    if (detailPanel) {
        detailPanel.style.display = 'none';
        detailPanel.innerHTML = '';
    }

    // Remove selection highlight
    if (mesh) {
        mesh.traverse((child) => {
            if (child.isMesh && child.userData.originalEmissive !== undefined) {
                child.material.emissive.setHex(child.userData.originalEmissive);
            }
        });
    }

    document.body.style.cursor = 'default';

    // Hide production panel
    if (window.RomanUI && window.RomanUI.ProductionPanel) {
        window.RomanUI.ProductionPanel.hide();
    }
}

export const isUpgradeable = true;

export function onUpgrade(object, newLevel) {
    // Determine the level to create (handles both signature variations where first arg is number)
    const levelToCreate = typeof object === 'number' ? object : newLevel;
    
    return import('./model.js').then(module => {
        return module.createFarm ? module.createFarm(levelToCreate) : null;
    }).catch(err => {
        console.warn('Farm model not implemented yet:', err);
        return null;
    });
}

function harvest(mesh) {
    const amount = (mesh.userData.level || 1) * 5; // Example yield logic

    // Add resource
    addResource('wheat', amount);

    // Get 2D position for floating text and trigger CSS animation
    if (mesh.parent) {
        const scene = mesh.parent;
        
        // Find global camera
        let camera = window.RomanUI && window.RomanUI.camera ? window.RomanUI.camera : null;
        
        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2;

        if (camera) {
            const worldPos = new THREE.Vector3();
            mesh.getWorldPosition(worldPos);
            worldPos.project(camera);

            if (worldPos.z <= 1) { // In front of camera
                x = (worldPos.x * 0.5 + 0.5) * window.innerWidth;
                y = -(worldPos.y * 0.5 - 0.5) * window.innerHeight;
            }
        }

        // Trigger floating text with CSS animation
        const floatEl = document.createElement('div');
        floatEl.className = 'absolute font-bold text-xl pointer-events-none z-50 drop-shadow-md text-green-400';
        floatEl.style.left = `${x}px`;
        floatEl.style.top = `${y - 50}px`;
        floatEl.style.transform = 'translate(-50%, -50%)';
        floatEl.textContent = `+${amount} 🌾`;
        
        document.body.appendChild(floatEl);

        // Animate up and fade out using GSAP
        gsap.to(floatEl, {
            y: "-=50",
            opacity: 0,
            duration: 2,
            ease: "power1.out",
            onComplete: () => floatEl.remove()
        });

        // Trigger wheat harvest animation
        createHarvestParticles(scene, mesh.position);
    }
}

function createHarvestParticles(scene, position) {
    try {
        if (!scene || !position) return;

        const particleCount = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            // Random position near center
            positions[i * 3] = position.x + (Math.random() - 0.5) * 4;
            positions[i * 3 + 1] = position.y + 1 + Math.random() * 2;
            positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 4;

            // Random velocity upwards
            velocities.push({
                x: (Math.random() - 0.5) * 2,
                y: Math.random() * 3 + 2, // Always up
                z: (Math.random() - 0.5) * 2
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Wheat color material (yellow small squares)
        const material = new THREE.PointsMaterial({
            color: 0xf5deb3, // Wheat
            size: 0.8,
            transparent: true,
            opacity: 1
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        const dummyObj = { t: 0 };
        gsap.to(dummyObj, {
            t: 1,
            duration: 1.0,
            ease: "power1.out",
            onUpdate: () => {
                const positionsArray = particles.geometry.attributes.position.array;
                for (let i = 0; i < particleCount; i++) {
                    positionsArray[i * 3] += velocities[i].x * 0.05;
                    positionsArray[i * 3 + 1] += velocities[i].y * 0.05;
                    positionsArray[i * 3 + 2] += velocities[i].z * 0.05;
                }
                particles.geometry.attributes.position.needsUpdate = true;
                // Fade out
                particles.material.opacity = 1 - dummyObj.t;
            },
            onComplete: () => {
                scene.remove(particles);
                geometry.dispose();
                material.dispose();
            }
        });
    } catch (err) {
        console.error("createHarvestParticles error:", err);
    }
}
