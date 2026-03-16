import * as THREE from 'three';
import gsap from 'gsap';
import { ObjectLoader } from './objectLoader.js';
import { setupControls } from './interaction/cameraControls.js';
import { onClick, onMouseMove } from './interaction/raycaster.js';
import { initDetailPanel } from './ui/detailPanel.js';
import { initNotifications, showNotification } from './ui/notifications.js';
import './ui/topBar.js';
import './ui/tooltip.js';

// Make gsap globally available for UI components that check window.gsap
window.gsap = gsap;

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 80, 200);

// Camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 50, 60);
camera.lookAt(0, 0, 0);

// Renderer
const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xfff4e0, 1.0);
dirLight.position.set(50, 80, 30);
scene.add(dirLight);

// Ground
const groundGeo = new THREE.PlaneGeometry(300, 300);
const groundMat = new THREE.MeshLambertMaterial({ color: 0x5a8f3c });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.1;
scene.add(ground);

// Controls
const controls = setupControls(camera, renderer.domElement);

// UI
initDetailPanel();
initNotifications();

// Load all objects
try {
  const objects = ObjectLoader.loadAllObjects();
  objects.forEach(obj => scene.add(obj));
  showNotification('Roma İnşa Edildi!');
} catch (e) {
  console.error('Object loading error:', e);
}

// Events
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.domElement.addEventListener('click', (e) => onClick(e, camera, scene));
renderer.domElement.addEventListener('touchend', (e) => onClick(e, camera, scene));
renderer.domElement.addEventListener('mousemove', (e) => onMouseMove(e, camera, scene));
renderer.domElement.addEventListener('touchmove', (e) => onMouseMove(e, camera, scene));

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  if (controls) controls.update();
  // Update LOD
  scene.traverse(obj => {
    if (obj.isLOD) obj.update(camera);
  });
  renderer.render(scene, camera);
}
animate();
