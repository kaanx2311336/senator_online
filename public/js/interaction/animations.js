// js/interaction/animations.js
import * as THREE from 'three';
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
 * Kamera smooth pan efekti (GSAP ile)
 * @param {THREE.Camera} camera
 * @param {OrbitControls} controls
 * @param {THREE.Vector3} targetPosition
 */
export function panCameraTo(camera, controls, targetPosition) {
    try {
        if (!camera || !controls || !targetPosition) return;

        // Hedefe doğru kamerayı taşıyalım, kameranın y'sini biraz yukarıda tutalım
    const newCameraPos = new THREE.Vector3(
        targetPosition.x,
        targetPosition.y + 30, // Kamera biraz yukarıdan baksın
        targetPosition.z + 40  // Kamera biraz geriden baksın
    );

    // controls.target animasyonu
    gsap.killTweensOf(controls.target);
    gsap.to(controls.target, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 1.0,
        ease: "power2.out",
        onUpdate: () => controls.update()
    });

    // camera.position animasyonu
    gsap.killTweensOf(camera.position);
        gsap.to(camera.position, {
            x: newCameraPos.x,
            y: newCameraPos.y,
            z: newCameraPos.z,
            duration: 1.0,
            ease: "power2.out",
            onUpdate: () => controls.update()
        });
    } catch (err) {
        console.error("panCameraTo error:", err);
    }
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

/**
 * Yükseltme animasyonu (scale 1→1.3→1 ve parıltı)
 * @param {THREE.Object3D} mesh 
 */
export function upgradeAnimation(mesh) {
    try {
        if (!mesh) return;

        // Scale animation
    const originalScale = mesh.scale.clone();
    gsap.killTweensOf(mesh.scale);
    
    gsap.to(mesh.scale, {
        x: originalScale.x * 1.3,
        y: originalScale.y * 1.3,
        z: originalScale.z * 1.3,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
        onComplete: () => {
            mesh.scale.copy(originalScale);
        }
    });

    // Emissive flash
    mesh.traverse((child) => {
        if (child.isMesh && child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach(mat => {
                // If the material has an emissive property
                if (mat.emissive !== undefined) {
                    const originalEmissive = mat.emissive.clone();
                    
                    // Flash yellowish/white
                    gsap.to(mat.emissive, {
                        r: 1,
                        g: 1,
                        b: 0.5,
                        duration: 0.2,
                        yoyo: true,
                        repeat: 1,
                        onComplete: () => {
                            mat.emissive.copy(originalEmissive);
                        }
                    });
                    }
                });
            }
        });
    } catch (err) {
        console.error("upgradeAnimation error:", err);
    }
}

/**
 * Yükseltme parçacık efekti (küçük altın yıldızlar)
 * @param {THREE.Scene} scene 
 * @param {THREE.Vector3} position 
 */
export function createUpgradeParticles(scene, position) {
    try {
        if (!scene || !position) return;

        const particleCount = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        // Rastgele pozisyon (merkeze yakın)
        positions[i * 3] = position.x + (Math.random() - 0.5) * 2;
        positions[i * 3 + 1] = position.y + Math.random() * 2;
        positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 2;

        // Rastgele hız (yukarı doğru uçuş)
        velocities.push({
            x: (Math.random() - 0.5) * 2,
            y: Math.random() * 3 + 2, // Hep yukarı yönlü
            z: (Math.random() - 0.5) * 2
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Basit sarı/altın materyal
    const material = new THREE.PointsMaterial({
        color: 0xffd700, // Gold
        size: 0.5,
        transparent: true,
        opacity: 1
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Animasyon döngüsü - GSAP ile her parçacığı güncelleyebiliriz veya onUpdate hook'u kullanabiliriz
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
            // Yavaşça kaybol
            particles.material.opacity = 1 - dummyObj.t;
        },
            onComplete: () => {
                scene.remove(particles);
                geometry.dispose();
                material.dispose();
            }
        });
    } catch (err) {
        console.error("createUpgradeParticles error:", err);
    }
}

/**
 * Yetersiz kaynak uyarısı (kırmızı flash)
 */
export function insufficientResourceAnimation() {
    const upgradeBtn = document.getElementById('upgrade-btn');
    if (upgradeBtn) {
        gsap.killTweensOf(upgradeBtn);
        
        // Add a red glow/background flash
        gsap.to(upgradeBtn, {
            backgroundColor: "#ef4444", // Tailwind red-500
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                gsap.set(upgradeBtn, { clearProps: "all" });
            }
        });
    }
}

/**
 * Toast mesajı göster
 * @param {string} msg 
 */
export function showToast(msg) {
    let toast = document.getElementById('roman-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'roman-toast';
        toast.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-900/90 text-white px-6 py-3 rounded-full shadow-lg border border-yellow-500 z-[100] pointer-events-none opacity-0 transition-opacity duration-300';
        document.body.appendChild(toast);
    }
    
    toast.textContent = msg;
    
    gsap.killTweensOf(toast);
    gsap.to(toast, {
        opacity: 1,
        y: -10,
        duration: 0.3,
        onComplete: () => {
            gsap.to(toast, {
                opacity: 0,
                y: 0,
                duration: 0.3,
                delay: 2
            });
        }
    });
}

/**
 * Ticaret animasyonu (altın parçacıklar uçuşsun)
 * @param {THREE.Scene} scene 
 * @param {THREE.Vector3} position 
 */
export function tradeAnimation(scene, position) {
    try {
        if (!scene || !position) return;

        const particleCount = 30;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            // Rastgele pozisyon (merkeze yakın)
            positions[i * 3] = position.x + (Math.random() - 0.5) * 3;
            positions[i * 3 + 1] = position.y + 1 + Math.random() * 2;
            positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 3;

            // Rastgele hız (her yöne saçılma ve yukarı uçuş)
            velocities.push({
                x: (Math.random() - 0.5) * 4,
                y: Math.random() * 4 + 2, // Yukarı yönlü
                z: (Math.random() - 0.5) * 4
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Parlak altın rengi
        const material = new THREE.PointsMaterial({
            color: 0xffd700, // Gold
            size: 0.8,
            transparent: true,
            opacity: 1
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        const dummyObj = { t: 0 };
        gsap.to(dummyObj, {
            t: 1,
            duration: 1.5,
            ease: "power2.out",
            onUpdate: () => {
                const positionsArray = particles.geometry.attributes.position.array;
                for (let i = 0; i < particleCount; i++) {
                    positionsArray[i * 3] += velocities[i].x * 0.03;
                    positionsArray[i * 3 + 1] += velocities[i].y * 0.03;
                    positionsArray[i * 3 + 2] += velocities[i].z * 0.03;
                    // Biraz yerçekimi (aşağı doğru ivme)
                    velocities[i].y -= 0.05;
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
        console.error("tradeAnimation error:", err);
    }
}

/**
 * Dua etme animasyonu (Tapınaktan yukarı ışık huzmesi ve etrafındaki binalarda altın halka)
 * @param {THREE.Object3D} templeMesh
 */
export function prayAnimation(templeMesh) {
    try {
        if (!templeMesh || !templeMesh.parent) return;

        const scene = templeMesh.parent;
        const position = new THREE.Vector3();
        templeMesh.getWorldPosition(position);

        // Işık huzmesi geometrisi ve materyali
        const beamGeometry = new THREE.CylinderGeometry(0.5, 2, 10, 16, 1, true);
        const beamMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffaa,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        
        // Işık huzmesi tapınağın merkezinden yukarı doğru uzansın
        beam.position.copy(position);
        beam.position.y += 5; // Yüksekliğin yarısı kadar yukarı kaydır
        
        scene.add(beam);

        // Beam animasyonu (Scale Y ve Opacity)
        beam.scale.y = 0.1;
        
        gsap.to(beam.scale, {
            y: 1,
            duration: 0.5,
            ease: "power2.out"
        });

        gsap.to(beamMaterial, {
            opacity: 0.8,
            duration: 0.5,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                // Işık huzmesini kaldır
                gsap.to(beamMaterial, {
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => {
                        scene.remove(beam);
                        beamGeometry.dispose();
                        beamMaterial.dispose();
                    }
                });
            }
        });

        // Etraftaki binalara buff efekti uygula
        applyBuffRing(scene, position, 15); // 15 birim yarıçap

        showToast("Dua edildi! Tanrılar lütfunu sundu.");

    } catch (err) {
        console.error("prayAnimation error:", err);
    }
}

/**
 * Belirli bir merkez etrafındaki binalara altın halka efekti uygula
 * @param {THREE.Scene} scene 
 * @param {THREE.Vector3} centerPos 
 * @param {number} radius 
 */
function applyBuffRing(scene, centerPos, radius) {
    try {
        if (!scene || !centerPos) return;

        // Scene içindeki tüm meshleri kontrol et
        const affectedMeshes = [];
        
        scene.traverse((child) => {
            // Sadece binaları seç (örn. ev, sur, kule vb. - yeryüzü/çimen vb. hariç)
            if (child.isGroup && child.userData && child.userData.objectType) {
                const childPos = new THREE.Vector3();
                child.getWorldPosition(childPos);
                
                // Mesafeyi ölç (Y eksenini ihmal edebiliriz veya hesaba katabiliriz, burada 3D mesafe kullanıyoruz)
                const distance = centerPos.distanceTo(childPos);
                
                // Belirli bir yarıçap içindeki, ancak tapınağın kendisi olmayan objeler
                if (distance > 0.1 && distance <= radius) {
                    affectedMeshes.push(child);
                }
            }
        });

        // Her etkilenen binaya altın halka efekti ekle
        affectedMeshes.forEach(mesh => {
            const meshPos = new THREE.Vector3();
            mesh.getWorldPosition(meshPos);
            
            // Halka geometrisi
            const ringGeo = new THREE.RingGeometry(1.5, 2.0, 32);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0xffd700, // Altın rengi
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
            
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2; // Yere paralel
            ring.position.copy(meshPos);
            ring.position.y += 0.2; // Yüzeyin biraz üstünde
            
            scene.add(ring);
            
            // Halka animasyonu (Büyü ve kaybol)
            ring.scale.set(0.1, 0.1, 0.1);
            
            // Sırayla ortaya çıksınlar diye merkeze olan uzaklığa göre gecikme ekleyelim
            const dist = centerPos.distanceTo(meshPos);
            const delay = (dist / radius) * 0.5; // Maksimum 0.5 saniye gecikme
            
            gsap.to(ring.scale, {
                x: 1.5,
                y: 1.5,
                z: 1.5,
                duration: 1.0,
                delay: delay,
                ease: "power1.out"
            });
            
            gsap.to(ringMat, {
                opacity: 0.8,
                duration: 0.5,
                delay: delay,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    gsap.to(ringMat, {
                        opacity: 0,
                        duration: 0.5,
                        onComplete: () => {
                            scene.remove(ring);
                            ringGeo.dispose();
                            ringMat.dispose();
                        }
                    });
                }
            });
        });

    } catch (err) {
        console.error("applyBuffRing error:", err);
    }
}
