// =======================
// 基础三件套
// =======================
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  5000
);
camera.position.z = 600;

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 1);
document.body.appendChild(renderer.domElement);

// =======================
// 光（防止黑屏）
// =======================
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const pointLight = new THREE.PointLight(0xffcc66, 2, 3000);
pointLight.position.set(0, 0, 600);
scene.add(pointLight);

// =======================
// 粒子文字（简化版，保证可见）
// =======================
const particles = new THREE.BufferGeometry();
const count = 18000;
const positions = new Float32Array(count * 3);

for (let i = 0; i < count; i++) {
  const i3 = i * 3;
  const r = Math.random() * 250;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI;

  positions[i3]     = r * Math.sin(phi) * Math.cos(theta);
  positions[i3 + 1] = r * Math.cos(phi);
  positions[i3 + 2] = r * Math.sin(phi) * Math.sin(theta);
}

particles.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

const particleMaterial = new THREE.PointsMaterial({
  color: 0xffcc66,
  size: 3,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const particleMesh = new THREE.Points(particles, particleMaterial);
scene.add(particleMesh);

// =======================
// Bloom 后处理
// =======================
const composer = new THREE.EffectComposer(renderer);
composer.addPass(new THREE.RenderPass(scene, camera));

const bloomPass = new THREE.UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.2,   // strength
  0.4,   // radius
  0.15   // threshold
);
composer.addPass(bloomPass);

// =======================
// 动画
// =======================
function animate() {
  requestAnimationFrame(animate);
  particleMesh.rotation.y += 0.0015;
  particleMesh.rotation.x += 0.0008;
  composer.render();
}
animate();

// =======================
// 自适应
// =======================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
