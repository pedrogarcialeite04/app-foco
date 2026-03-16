/**
 * FOCO — Partículas 3D no fundo (Three.js)
 */

const THREE = window.THREE;
const container = document.getElementById("particles-3d");

if (!THREE || !container) return;

let scene, camera, renderer, points, geometry;
const particleCount = 2800;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 50;

  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    sizes[i] = Math.random() * 1.5 + 0.5;
  }

  geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    color: 0x00d4ff,
    size: 1.1,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);

  window.addEventListener("resize", onResize);
  animate();
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  const t = performance.now() * 0.0002;
  points.rotation.y = t * 0.15;
  points.rotation.x = Math.sin(t * 0.3) * 0.05;
  const pos = geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    pos[i * 3] += Math.sin(t + i * 0.01) * 0.02;
    pos[i * 3 + 1] += Math.cos(t * 0.7 + i * 0.02) * 0.02;
  }
  geometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
}

init();
