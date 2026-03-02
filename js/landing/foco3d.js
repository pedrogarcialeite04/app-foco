/**
 * FOCO — Texto 3D imersivo com Three.js (realista, com movimento)
 * Uso: apenas na landing (index.html). Não carregar em app.html.
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import { FontLoader } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/geometries/TextGeometry.js";

const container = document.getElementById("foco-3d");

let scene, camera, renderer, textMesh, clock;
let rafId = null;
let resizeBound = null;

// Fonte profissional: Helvetiker (Swiss, neutra, corporativa)
const FONT_URL =
  "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/fonts/helvetiker_bold.typeface.json";

const MIN_WIDTH = 320;
const MIN_HEIGHT = 140;

// Paleta neutra: prata realista, sem tons azulados
const COLORS = {
  silver: 0xb8bcc4,
  silverHighlight: 0xe4e6ea,
  silverShadow: 0x585c64,
  edgeSubtle: 0xd0d4d8,
};

function getContainerSize() {
  if (!container) return { width: MIN_WIDTH, height: MIN_HEIGHT };
  const w = container.clientWidth || MIN_WIDTH;
  const h = container.clientHeight || MIN_HEIGHT;
  return { width: Math.max(w, MIN_WIDTH), height: Math.max(h, MIN_HEIGHT) };
}

function init() {
  const { width, height } = getContainerSize();

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
  camera.position.set(0, 0, 180);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  container.appendChild(renderer.domElement);

  // Iluminação de estúdio: apenas luzes neutras (sem azul), realista
  const ambient = new THREE.AmbientLight(0xf8f8fa, 0.28);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xfffbf7, 1.35);
  keyLight.position.set(-55, 75, 95);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xe8eaee, 0.55);
  fillLight.position.set(45, 15, 55);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xfafafa, 0.45);
  rimLight.position.set(-25, 35, -35);
  scene.add(rimLight);

  const backLight = new THREE.DirectionalLight(COLORS.silverShadow, 0.4);
  backLight.position.set(15, -35, -55);
  scene.add(backLight);

  clock = new THREE.Clock();

  const loader = new FontLoader();
  loader.load(FONT_URL, (font) => {
    const geometry = new TextGeometry("FOCO", {
      font,
      size: 38,
      depth: 10,
      curveSegments: 20,
      bevelEnabled: true,
      bevelThickness: 1.6,
      bevelSize: 0.5,
      bevelSegments: 6,
    });

    geometry.computeBoundingBox();
    geometry.computeVertexNormals();
    const center = new THREE.Vector3();
    geometry.boundingBox.getCenter(center);
    geometry.translate(-center.x, -center.y, -center.z);

    const material = new THREE.MeshStandardMaterial({
      color: COLORS.silver,
      metalness: 0.82,
      roughness: 0.22,
      envMapIntensity: 1,
      emissive: 0x000000,
    });

    textMesh = new THREE.Group();
    const mesh = new THREE.Mesh(geometry, material);
    const edges = new THREE.EdgesGeometry(geometry, 10);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        color: COLORS.edgeSubtle,
        transparent: true,
        opacity: 0.72,
      })
    );
    textMesh.add(mesh);
    textMesh.add(line);

    scene.add(textMesh);
    container.classList.add("foco-3d--ready");
    onResize();
  });

  resizeBound = onResize;
  window.addEventListener("resize", resizeBound);
  animate();
}

function onResize() {
  const { width, height } = getContainerSize();
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// Easing suave para movimento profissional (evita “saltos”)
function easeInOutSine(x) {
  return 0.5 * (1 - Math.cos(Math.PI * x));
}

function animate() {
  rafId = requestAnimationFrame(animate);
  if (!clock || !renderer || !scene || !camera) return;
  const t = clock.getElapsedTime();

  if (textMesh) {
    const breath = 0.5 + 0.5 * Math.sin(t * 0.35);
    const rotY = easeInOutSine((Math.sin(t * 0.2) + 1) / 2) * 0.18 - 0.09;
    const rotX = Math.sin(t * 0.15) * 0.06;
    const floatY = Math.sin(t * 0.28) * 2.2;

    textMesh.rotation.y = rotY;
    textMesh.rotation.x = rotX;
    textMesh.position.y = floatY;
    textMesh.scale.setScalar(0.98 + 0.04 * breath);
  }

  renderer.render(scene, camera);
}

function startWhenReady() {
  const { width, height } = getContainerSize();
  if (width > 0 && height > 0) {
    init();
    return;
  }
  requestAnimationFrame(startWhenReady);
}

if (container) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => requestAnimationFrame(startWhenReady));
  } else {
    requestAnimationFrame(startWhenReady);
  }
}

// Limpeza ao sair (evita leak e animação em background)
window.addEventListener("pagehide", () => {
  if (rafId != null) cancelAnimationFrame(rafId);
  if (resizeBound) window.removeEventListener("resize", resizeBound);
  if (renderer && container && renderer.domElement.parentNode === container) {
    container.removeChild(renderer.domElement);
    renderer.dispose();
  }
});
