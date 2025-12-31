/* ======================================================
   GitHub Pages Safe Bloom Particle Text
   - NO module / NO import
   - Works with CDN three.js + examples/js
   ====================================================== */

console.log("Bloom Safe main.js loaded");

// ---------- 基础防御 ----------
if (!window.THREE) {
  alert("THREE not loaded");
  throw new Error("THREE not found");
}
if (!THREE.EffectComposer || !THREE.UnrealBloomPass) {
  alert("Bloom not loaded (EffectComposer / UnrealBloomPass)");
  throw new Error("Bloom classes missing");
}

// ---------- 场景 / 相机 / 渲染 ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  2000
);
camera.position.z = 600;

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);
document.body.appendChild(renderer.domElement);

// ---------- 粒子文字 Canvas ----------
const textCanvas = document.createElement("canvas");
textCanvas.width = 1024;
textCanvas.height = 512;
const ctx = textCanvas.getContext("2d");

ctx.fillStyle = "black";
ctx.fillRect(0, 0, textCanvas.width, textCanvas.height);

ctx.font = "bold 140px sans-serif";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillStyle = "#ffffff";
ctx.fillText("2026 年", 512, 180);
ctx.fillText("新年快乐", 512, 330);

const imageData = ctx.getImageData(
  0,
  0,
  textCanvas.width,
  textCanvas.height
).data;

// ---------- 粒子生成 ----------
const positions = [];
const velocities = [];
const colors = [];

for (let y = 0; y < textCanvas.height; y += 3) {
  for (let x = 0; x < textCanvas.width; x += 3) {
    const i = (y * textCanvas.width + x) * 4;
    if (imageData[i] > 10) {
      const px = x - textCanvas.width / 2;
      const py = textCanvas.height / 2 - y;

      positions.push(px, py, 0);
      velocities.push(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        Math.random() * 0.3
      );

      colors.push(1.0, 0.75, 0.25); // 金色
    }
  }
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(positions, 3)
);
geometry.setAttribute(
  "color",
  new THREE.Float32BufferAttribute(colors, 3)
);

const material = new THREE.PointsMaterial({
  size: 2.2,
  vertexColors: true,
  transparent: true,
  opacity: 0.9,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const points = new THREE.Points(geometry, material);
scene.add(points);

// ---------- 第二层辉光粒子 ----------
const glowMaterial = new THREE.PointsMaterial({
  size: 4.5,
  color: 0xffaa33,
  transparent: true,
  opacity: 0.15,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const glowPoints = new THREE.Points(geometry, glowMaterial);
scene.add(glowPoints);

// ---------- 后处理 Bloom ----------
const composer = new THREE.EffectComposer(renderer);
composer.addPass(new THREE.RenderPass(scene, camera));

const bloomPass = new THREE.UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.3,   // strength
  0.6,   // radius
  0.15   // threshold
);
composer.addPass(bloomPass);

// ---------- 动画 ----------
const pos = geometry.attributes.position.array;

function animate() {
  requestAnimationFrame(animate);

  for (let i = 0; i < pos.length; i += 3) {
    pos[i] += velocities[i];
    pos[i + 1] += velocities[i + 1];
    pos[i + 2] += velocities[i + 2];

    // 呼吸感回拉
    pos[i] *= 0.999;
    pos[i + 1] *= 0.999;
    pos[i + 2] *= 0.995;
  }

  geometry.attributes.position.needsUpdate = true;

  glowPoints.rotation.z += 0.0005;

  composer.render();
}

animate();

// ---------- 自适应 ----------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
