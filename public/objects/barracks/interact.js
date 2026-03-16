import * as THREE from 'three';
import gsap from 'gsap';

export function onSelect(mesh, detailPanel) {
    if (detailPanel) {
        detailPanel.innerHTML = `
            <h3>Kışla</h3>
            <p>Tür: Askeri</p>
            <p>Seviye: ${mesh.userData.level || 1}</p>
            <button id="train-soldier-btn" class="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded">Asker Eğit</button>
            <button id="defense-mode-btn" class="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">Savunma Modu</button>
            <button id="simulate-attack-btn" class="mt-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded">Saldırı Simülasyonu</button>
            <button id="upgrade-btn" class="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded">Geliştir</button>
        `;
        detailPanel.style.display = 'block';

        // Add event listeners for new buttons
        const trainBtn = document.getElementById('train-soldier-btn');
        if (trainBtn) {
            trainBtn.addEventListener('click', () => {
                trainSoldier(mesh);
            });
        }

        const defenseBtn = document.getElementById('defense-mode-btn');
        if (defenseBtn) {
            defenseBtn.addEventListener('click', () => {
                activateDefenseMode(mesh);
            });
        }

        const attackBtn = document.getElementById('simulate-attack-btn');
        if (attackBtn) {
            attackBtn.addEventListener('click', () => {
                simulateEnemyAttack(mesh);
            });
        }

        // Use dynamic import for animations to prevent circular dependencies
        import('../../js/interaction/animations.js').then(module => {
            module.showToast("Kışla seçildi. Ordu paneli açıldı.");
            module.panelSlideIn();
        }).catch(err => console.error("Failed to load animations for barracks:", err));
    }
}

export function onDeselect(mesh, detailPanel) {
    if (detailPanel) {
        detailPanel.style.display = 'none';
        detailPanel.innerHTML = '';

        import('../../js/interaction/animations.js').then(module => {
            module.panelSlideOut();
        }).catch(err => console.error("Failed to load animations for barracks deselect:", err));
    }
}

export const isUpgradeable = true;

export function onUpgrade(level) {
    return import('./model.js').then(module => {
        import('../../js/interaction/animations.js').then(animModule => {
            animModule.showToast("Kışla geliştirildi! Daha güçlü askerler eğitilebilir.");
        });
        return module.createBarracks(level);
    }).catch(err => {
        console.warn("model.js bulunamadı (Roma City Builder standartlarında henüz kışla modeli oluşturulmamış olabilir). Kışla upgrade fallback:", err);
        // Fallback: Return a simple dummy mesh if model.js doesn't exist yet
        const geometry = new THREE.BoxGeometry(3, 3, 3);
        const material = new THREE.MeshLambertMaterial({ color: 0x8b0000 }); // Dark red
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData.objectType = 'building';
        mesh.userData.objectName = 'Barracks';
        mesh.userData.level = level;
        return mesh;
    });
}

/**
 * Asker eğitim animasyonu: Kışladan çıkan asker figürü (scale 0→1, GSAP).
 * @param {THREE.Object3D} barracksMesh 
 */
function trainSoldier(barracksMesh) {
    if (!barracksMesh || !barracksMesh.parent) return;

    const scene = barracksMesh.parent;
    const spawnPos = new THREE.Vector3();
    barracksMesh.getWorldPosition(spawnPos);
    
    // Spawn in front of the barracks
    spawnPos.x += 2;
    spawnPos.z += 2;

    // Create a simple soldier geometry (e.g., a cylinder or a small box)
    const geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8);
    // Red color for roman soldiers
    const material = new THREE.MeshLambertMaterial({ color: 0xcc0000 });
    const soldier = new THREE.Mesh(geometry, material);
    
    soldier.position.copy(spawnPos);
    soldier.position.y += 0.6; // Half height to rest on ground
    
    // Start scale at 0
    soldier.scale.set(0, 0, 0);
    
    scene.add(soldier);

    import('../../js/interaction/animations.js').then(module => {
        module.showToast("Asker eğitiliyor...");
    });

    // Scale 0 -> 1 animation
    gsap.to(soldier.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.0,
        ease: "back.out(1.7)",
        onComplete: () => {
            import('../../js/interaction/animations.js').then(module => {
                module.showToast("Asker eğitimi tamamlandı!");
            });
            
            // Optionally, remove the soldier after some time, or make it walk away
            gsap.to(soldier.position, {
                x: spawnPos.x + 3,
                duration: 2.0,
                delay: 1.0,
                ease: "power1.inOut",
                onComplete: () => {
                    gsap.to(soldier.scale, {
                        x: 0,
                        y: 0,
                        z: 0,
                        duration: 0.5,
                        onComplete: () => {
                            scene.remove(soldier);
                            geometry.dispose();
                            material.dispose();
                        }
                    });
                }
            });
        }
    });
}

/**
 * Savunma modu: Askerler surların üzerine yerleşsin (pozisyon animasyonu).
 * @param {THREE.Object3D} barracksMesh 
 */
function activateDefenseMode(barracksMesh) {
    if (!barracksMesh || !barracksMesh.parent) return;

    const scene = barracksMesh.parent;
    const walls = [];

    // Find walls in the scene
    scene.traverse((child) => {
        if (child.isGroup && child.userData && child.userData.objectType === 'building') {
            const name = (child.userData.objectName || "").toLowerCase();
            if (name.includes('wall') || name.includes('sur')) {
                walls.push(child);
            }
        } else if (child.isMesh && child.userData && child.userData.objectType === 'building') {
            const name = (child.userData.objectName || "").toLowerCase();
            if (name.includes('wall') || name.includes('sur')) {
                walls.push(child);
            }
        }
    });

    if (walls.length === 0) {
        import('../../js/interaction/animations.js').then(module => {
            module.showToast("Savunma yapılacak sur bulunamadı!");
        });
        return;
    }

    import('../../js/interaction/animations.js').then(module => {
        module.showToast("Savunma modu aktif! Askerler surlara yerleşiyor.");
    });

    const barracksPos = new THREE.Vector3();
    barracksMesh.getWorldPosition(barracksPos);

    // Create a few soldiers and move them to random walls
    const soldierCount = Math.min(walls.length * 2, 5); // Max 5 soldiers or 2 per wall
    
    for (let i = 0; i < soldierCount; i++) {
        // Create soldier
        const geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8);
        const material = new THREE.MeshLambertMaterial({ color: 0x0000cc }); // Blue for defenders
        const soldier = new THREE.Mesh(geometry, material);
        
        soldier.position.copy(barracksPos);
        soldier.position.x += (Math.random() - 0.5) * 2;
        soldier.position.z += (Math.random() - 0.5) * 2;
        soldier.position.y += 0.4;
        
        scene.add(soldier);

        // Pick a random wall
        const targetWall = walls[Math.floor(Math.random() * walls.length)];
        const targetPos = new THREE.Vector3();
        targetWall.getWorldPosition(targetPos);
        
        // Target position on top of the wall
        targetPos.y += 2.0; // Assume wall height is roughly 2
        targetPos.x += (Math.random() - 0.5); // Slight random offset on wall
        targetPos.z += (Math.random() - 0.5);

        // Animate movement to wall
        gsap.to(soldier.position, {
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            duration: 2.0 + Math.random(),
            ease: "power2.inOut",
            onComplete: () => {
                // Keep them on the wall for a while, then remove
                gsap.to(soldier.scale, {
                    x: 0,
                    y: 0,
                    z: 0,
                    duration: 0.5,
                    delay: 5.0, // stay on wall for 5 seconds
                    onComplete: () => {
                        scene.remove(soldier);
                        geometry.dispose();
                        material.dispose();
                    }
                });
            }
        });
    }
}

/**
 * Saldırı efekti: Kırmızı parçacık patlaması (düşman saldırısı simülasyonu).
 * @param {THREE.Object3D} barracksMesh 
 */
function simulateEnemyAttack(barracksMesh) {
    if (!barracksMesh || !barracksMesh.parent) return;

    const scene = barracksMesh.parent;
    const targetPos = new THREE.Vector3();
    barracksMesh.getWorldPosition(targetPos);

    import('../../js/interaction/animations.js').then(module => {
        module.showToast("DİKKAT: Düşman saldırısı tespit edildi!");
    });

    // Create explosion particles
    const particleCount = 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        // Start near the barracks
        positions[i * 3] = targetPos.x + (Math.random() - 0.5) * 2;
        positions[i * 3 + 1] = targetPos.y + 1 + Math.random();
        positions[i * 3 + 2] = targetPos.z + (Math.random() - 0.5) * 2;

        // Random explosive velocity (spherical outward)
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos((Math.random() * 2) - 1);
        const speed = 2 + Math.random() * 3;

        velocities.push({
            x: speed * Math.sin(phi) * Math.cos(theta),
            y: speed * Math.cos(phi) + 2, // Biased upwards
            z: speed * Math.sin(phi) * Math.sin(theta)
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Red fire/explosion material
    const material = new THREE.PointsMaterial({
        color: 0xff0000, // Red
        size: 0.8,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Shake the barracks mesh
    const originalPos = barracksMesh.position.clone();
    gsap.killTweensOf(barracksMesh.position);
    gsap.to(barracksMesh.position, {
        x: originalPos.x + 0.5,
        z: originalPos.z + 0.5,
        duration: 0.05,
        yoyo: true,
        repeat: 10,
        ease: "rough({ template: none.out, strength: 1, points: 20, taper: none, randomize: true, clamp: false })",
        onComplete: () => {
            barracksMesh.position.copy(originalPos);
        }
    });

    // Animate particles
    const dummyObj = { t: 0 };
    gsap.to(dummyObj, {
        t: 1,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => {
            const positionsArray = particles.geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                positionsArray[i * 3] += velocities[i].x * 0.05;
                positionsArray[i * 3 + 1] += velocities[i].y * 0.05;
                positionsArray[i * 3 + 2] += velocities[i].z * 0.05;
                // Add gravity
                velocities[i].y -= 0.1;
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
}
