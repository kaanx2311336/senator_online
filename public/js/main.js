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

// Festival System Variables
window.festivalActive = false;
const particles = [];
const maxParticles = 200;
const festivalMaterials = [
  new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Red
  new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Green
  new THREE.MeshBasicMaterial({ color: 0x0000ff }), // Blue
  new THREE.MeshBasicMaterial({ color: 0xffff00 }), // Yellow
  new THREE.MeshBasicMaterial({ color: 0xff00ff }), // Magenta
  new THREE.MeshBasicMaterial({ color: 0x00ffff }), // Cyan
  new THREE.MeshBasicMaterial({ color: 0xffffff })  // White
];
const confettiGeo = new THREE.PlaneGeometry(0.5, 0.5);
const fireworkGeo = new THREE.SphereGeometry(0.2, 4, 4);

function createConfetti() {
  if (particles.length >= maxParticles) return;
  const mat = festivalMaterials[Math.floor(Math.random() * festivalMaterials.length)];
  const mesh = new THREE.Mesh(confettiGeo, mat);
  mesh.position.set(
    (Math.random() - 0.5) * 200,
    100 + Math.random() * 20,
    (Math.random() - 0.5) * 200
  );
  mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  
  const particle = {
    mesh: mesh,
    type: 'confetti',
    velocity: new THREE.Vector3(
      (Math.random() - 0.5) * 0.5,
      -0.5 - Math.random() * 0.5,
      (Math.random() - 0.5) * 0.5
    ),
    rotSpeed: new THREE.Vector3(
      Math.random() * 0.1,
      Math.random() * 0.1,
      Math.random() * 0.1
    ),
    life: 300
  };
  
  scene.add(mesh);
  particles.push(particle);
}

function createFirework() {
  if (particles.length >= maxParticles) return;
  
  const startX = (Math.random() - 0.5) * 150;
  const startY = 30 + Math.random() * 40;
  const startZ = (Math.random() - 0.5) * 150;
  
  const burstCount = 10 + Math.floor(Math.random() * 15);
  const mat = festivalMaterials[Math.floor(Math.random() * festivalMaterials.length)];
  
  for (let i = 0; i < burstCount; i++) {
    if (particles.length >= maxParticles) break;
    
    const mesh = new THREE.Mesh(fireworkGeo, mat);
    mesh.position.set(startX, startY, startZ);
    
    // Random spherical direction
    const phi = Math.acos( -1 + ( 2 * i ) / burstCount );
    const theta = Math.sqrt( burstCount * Math.PI ) * phi;
    
    const dir = new THREE.Vector3(
      Math.cos(theta) * Math.sin(phi),
      Math.cos(phi),
      Math.sin(theta) * Math.sin(phi)
    );
    
    const speed = 0.5 + Math.random() * 1.5;
    
    const particle = {
      mesh: mesh,
      type: 'firework',
      velocity: dir.multiplyScalar(speed),
      life: 60 + Math.random() * 40
    };
    
    scene.add(mesh);
    particles.push(particle);
  }
}

function updateFestival() {
  if (window.festivalActive) {
    // Generate new particles occasionally
    if (Math.random() < 0.1) createConfetti();
    if (Math.random() < 0.02) createFirework();
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    
    if (p.type === 'confetti') {
      p.mesh.position.add(p.velocity);
      p.mesh.rotation.x += p.rotSpeed.x;
      p.mesh.rotation.y += p.rotSpeed.y;
      p.mesh.rotation.z += p.rotSpeed.z;
    } else if (p.type === 'firework') {
      p.mesh.position.add(p.velocity);
      p.velocity.y -= 0.05; // gravity
    }
    
    p.life--;
    
    // Auto cleanup logic
    if (p.life <= 0 || p.mesh.position.y < -10 || (!window.festivalActive && p.mesh.position.y < 0)) {
      scene.remove(p.mesh);
      particles.splice(i, 1);
    }
  }
}

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 100, 250);

// Camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 50, 60);
camera.lookAt(0, 0, 0);

// Mobile Detection & Renderer Configuration
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const useAntialias = !isMobile;

// Renderer
const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: useAntialias });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(1); // Fixed pixel ratio for optimization

// Debug Mode & FPS Counter
const isDebugMode = window.location.search.includes('debug=true') || window.location.hash.includes('debug');
let fpsElement = null;
let frameCount = 0;
let lastTime = performance.now();

if (isDebugMode) {
  fpsElement = document.createElement('div');
  fpsElement.style.position = 'absolute';
  fpsElement.style.top = '10px';
  fpsElement.style.left = '10px';
  fpsElement.style.color = 'white';
  fpsElement.style.backgroundColor = 'rgba(0,0,0,0.5)';
  fpsElement.style.padding = '5px';
  fpsElement.style.fontFamily = 'monospace';
  fpsElement.style.zIndex = '1000';
  document.body.appendChild(fpsElement);
}

// Ensure Frustum Culling is active on objects. 
// Three.js frustum culling is on by default, but we'll enforce it during object loading.

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

// Water (South Edge)
const waterGeo = new THREE.PlaneGeometry(300, 100, 32, 32);
const waterMat = new THREE.MeshLambertMaterial({ 
  color: 0x1ca3ec, 
  transparent: true, 
  opacity: 0.7,
  side: THREE.DoubleSide
});
const water = new THREE.Mesh(waterGeo, waterMat);
water.rotation.x = -Math.PI / 2;
// Positioned at the south edge of the ground (ground z goes from -150 to +150)
water.position.set(0, -0.5, 120); 
scene.add(water);

// Store original vertices for wave animation
const waterVertices = [];
const posAttribute = waterGeo.attributes.position;
for (let i = 0; i < posAttribute.count; i++) {
  waterVertices.push({
    x: posAttribute.getX(i),
    y: posAttribute.getY(i),
    z: posAttribute.getZ(i),
    ang: Math.random() * Math.PI * 2,
    amp: 0.5 + Math.random() * 0.5,
    speed: 0.01 + Math.random() * 0.02
  });
}

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

  if (isDebugMode && fpsElement) {
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      fpsElement.innerText = `FPS: ${frameCount}`;
      frameCount = 0;
      lastTime = now;
    }
  }

  if (controls) controls.update();
  // Update LOD
  scene.traverse(obj => {
    if (obj.isLOD) obj.update(camera);
  });
  
  // Wave animation
  const time = Date.now() * 0.001;
  const positions = water.geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const v = waterVertices[i];
    v.ang += v.speed;
    const offset = Math.sin(v.ang) * v.amp;
    positions.setZ(i, v.z + offset * 0.5); // Z in PlaneGeometry is the normal when rotated
  }
  positions.needsUpdate = true;
  
  // Update Festival Particles
  updateFestival();

  renderer.render(scene, camera);
}
animate();
