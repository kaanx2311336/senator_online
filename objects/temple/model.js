import * as THREE from 'three';

// Modül seviyesinde materyalleri paylaş, performans optimizasyonu
const materials = {
    stone: new THREE.MeshLambertMaterial({ color: 0xeeeeee }),
    marble: new THREE.MeshLambertMaterial({ color: 0xf5f5f5 }),
    roof: new THREE.MeshLambertMaterial({ color: 0x8b0000 }), // Kiremit kırmızısı
    gold: new THREE.MeshLambertMaterial({ color: 0xffd700 }),
    base: new THREE.MeshLambertMaterial({ color: 0xaaaaaa })
};

// Ortak geometri fonksiyonları
function createColumn(radius, height) {
    const geo = new THREE.CylinderGeometry(radius, radius, height, 8, 1, true);
    const mesh = new THREE.Mesh(geo, materials.marble);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    return mesh;
}

function createBox(w, h, d, mat) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    return mesh;
}

export function createTemple(level) {
    const group = new THREE.Group();
    group.userData.objectType = "faith";
    group.userData.objectName = "temple";

    switch (level) {
        case 1:
            // Seviye 1: Küçük sunak taşı, 2 sütun
            {
                const base = createBox(2, 0.2, 2, materials.base);
                base.position.y = 0.1;
                group.add(base);

                const altar = createBox(0.8, 0.5, 0.6, materials.stone);
                altar.position.y = 0.45;
                group.add(altar);

                const col1 = createColumn(0.1, 1);
                col1.position.set(-0.8, 0.7, -0.8);
                group.add(col1);

                const col2 = createColumn(0.1, 1);
                col2.position.set(0.8, 0.7, -0.8);
                group.add(col2);
            }
            break;

        case 2:
            // Seviye 2: Küçük tapınak, 4 sütun, üçgen alınlık
            {
                const base2 = createBox(2.5, 0.4, 2.5, materials.base);
                base2.position.y = 0.2;
                group.add(base2);

                const positions2 = [
                    [-1, -1], [1, -1],
                    [-1, 1], [1, 1]
                ];
                positions2.forEach(pos => {
                    const col = createColumn(0.15, 1.5);
                    col.position.set(pos[0], 1.15, pos[1]);
                    group.add(col);
                });

                const roofGeo2 = new THREE.ConeGeometry(1.8, 1, 4);
                const roof2 = new THREE.Mesh(roofGeo2, materials.roof);
                roof2.position.y = 2.4;
                roof2.rotation.y = Math.PI / 4;
                roof2.castShadow = false;
                roof2.receiveShadow = false;
                group.add(roof2);
            }
            break;

        case 3:
            // Seviye 3: Orta tapınak, 6 sütun, mermer zemin
            {
                const base3 = createBox(3, 0.5, 4, materials.marble);
                base3.position.y = 0.25;
                group.add(base3);

                const positions3 = [
                    [-1.2, -1.5], [1.2, -1.5],
                    [-1.2, 0], [1.2, 0],
                    [-1.2, 1.5], [1.2, 1.5]
                ];
                positions3.forEach(pos => {
                    const col = createColumn(0.2, 2);
                    col.position.set(pos[0], 1.5, pos[1]);
                    group.add(col);
                });

                const room3 = createBox(1.8, 1.8, 2.8, materials.stone);
                room3.position.y = 1.4;
                group.add(room3);

                const roofGeo3 = new THREE.PrismGeometry ? new THREE.PrismGeometry(3.2, 4.2) : new THREE.CylinderGeometry(2, 2, 4.2, 3);
                // PrismGeometry yerine Cylinder kullanarak üçgen çatı yapalım
                const altRoofGeo = new THREE.CylinderGeometry(2, 2, 4.2, 3);
                const roof3 = new THREE.Mesh(altRoofGeo, materials.roof);
                roof3.castShadow = false;
                roof3.receiveShadow = false;
                roof3.position.y = 3;
                roof3.rotation.z = Math.PI / 2;
                roof3.rotation.y = Math.PI / 2;
                roof3.castShadow = false;
                roof3.receiveShadow = false;
                group.add(roof3);
            }
            break;

        case 4:
            // Seviye 4: Büyük tapınak, kubbe, iç avlu
            {
                const base4 = createBox(4, 0.6, 5, materials.marble);
                base4.position.y = 0.3;
                group.add(base4);

                // Dış sütunlar
                for (let x of [-1.8, 1.8]) {
                    for (let z of [-2.2, -1, 0, 1, 2.2]) {
                        const col = createColumn(0.2, 2.5);
                        col.position.set(x, 1.85, z);
                        group.add(col);
                    }
                }

                // İç oda / avlu
                const room4 = createBox(2.6, 2.5, 3.6, materials.stone);
                room4.position.y = 1.85;
                group.add(room4);

                // Kubbe
                const domeGeo4 = new THREE.SphereGeometry(1.5, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
                const dome4 = new THREE.Mesh(domeGeo4, materials.roof);
                dome4.position.y = 3.1;
                dome4.castShadow = false;
                dome4.receiveShadow = false;
                group.add(dome4);
            }
            break;

        case 5:
            // Seviye 5: Devasa tapınak, altın kubbe, heykel, merdiven
            {
                // Merdivenli zemin
                for (let i = 0; i < 3; i++) {
                    const step = createBox(5 - i * 0.4, 0.3, 6 - i * 0.4, materials.marble);
                    step.position.y = 0.15 + i * 0.3;
                    group.add(step);
                }

                // Sütunlar
                for (let x of [-2.1, 2.1]) {
                    for (let z of [-2.6, -1.3, 0, 1.3, 2.6]) {
                        const col = createColumn(0.25, 3);
                        col.position.set(x, 2.55, z);
                        group.add(col);
                    }
                }

                const room5 = createBox(3, 3, 4, materials.stone);
                room5.position.y = 2.55;
                group.add(room5);

                // Altın Kubbe
                const domeGeo5 = new THREE.SphereGeometry(1.8, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
                const dome5 = new THREE.Mesh(domeGeo5, materials.gold);
                dome5.position.y = 4.05;
                dome5.castShadow = false;
                dome5.receiveShadow = false;
                group.add(dome5);

                // Heykel (temsili altın silindir/küre birleşimi)
                const statueBase = createBox(0.8, 0.2, 0.8, materials.base);
                statueBase.position.set(0, 1.15, 1);
                group.add(statueBase);

                const statueBody = createColumn(0.2, 1.2);
                statueBody.position.set(0, 1.85, 1);
                statueBody.material = materials.gold;
                group.add(statueBody);

                const statueHeadGeo = new THREE.SphereGeometry(0.25, 8, 8);
                const statueHead = new THREE.Mesh(statueHeadGeo, materials.gold);
                statueHead.position.set(0, 2.6, 1);
                statueHead.castShadow = false;
                statueHead.receiveShadow = false;
                group.add(statueHead);
            }
            break;

        default:
            console.warn(`Tapınak için geçersiz seviye: ${level}`);
            break;
    }

    return group;
}
