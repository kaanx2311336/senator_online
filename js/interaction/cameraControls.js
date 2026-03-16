import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { setCameraAndControls } from './selection.js';

/**
 * OrbitControls kurulumu
 * @param {THREE.Camera} camera
 * @param {HTMLElement} domElement
 * @returns {OrbitControls}
 */
export function setupControls(camera, domElement) {
    const controls = new OrbitControls(camera, domElement);
    
    // Setup references for selection logic
    setCameraAndControls(camera, controls);
    
    // enableRotate = false (döndürme KESİNLİKLE KAPALI)
    controls.enableRotate = false;
    
    // enablePan = true (sağa-sola kaydırma AÇIK)
    controls.enablePan = true;
    
    // enableZoom = true (zoom AÇIK)
    controls.enableZoom = true;
    
    // minDistance = 20, maxDistance = 120 (zoom limitleri)
    controls.minDistance = 20;
    controls.maxDistance = 120;
    
    // maxPolarAngle = Math.PI/3 (çok dik bakma engeli)
    controls.maxPolarAngle = Math.PI / 3;
    
    return controls;
}
