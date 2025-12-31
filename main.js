/* =========================================================
   2026 新年快乐 · 粒子飞入 · 发光 · 视频级 90%+
   ========================================================= */

let scene, camera, renderer, points, geometry;
let positions, targets, basePositions;
let clock = new THREE.Clock();

init();
animate();

/* ================= 初始化 ================= */
function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    4000
  );
  camera.position.z = 900;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 1);
  document.body.appendChild(renderer.domElement);

  createParticles();
  window.addEventListener("resize", onResize);
}

/* ================= 生成粒子 ================= */
function createParticles() {
  const textTop = getTextPoints("2026 年", 170);
  const textBottom = getTextPoints("新年快乐", 150).map(p => ({
    x: p.x,
    y: p.y - 220,
    z: p.z
  }));

  targets = [...textTop, ...textBottom];
  geometry = new THREE.BufferGeometry();

  positions = new Float32Array(targets.length * 3);
  basePositions = new Float32Array(targets.length * 3);

  for (let i = 0; i < targets.length; i++) {
    // 初始：随机远处（飞入）
    positions[i * 3]     = (Math.random() - 0.5) * 2600;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2400;

    // 目标位置（存一份用于呼吸动画）
    basePositions[i * 3]     = targets[i].x;
    basePositions[i * 3 + 1] = targets[i].y;
    basePositions[i * 3 + 2] = targets[i].z;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: new THREE.Color(1.0, 0.78, 0.28), // 高级琥珀金
    size: 3.0,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);

  flyIn();
}

/* ================= 粒子飞入（核心） ================= */
function flyIn() {
  targets.forEach((t, i) => {
    gsap.to(positions, {
      duration: 2.8,
      delay: Math.random() * 0.8,
      ease: "power3.out",
      [i * 3]:     t.x,
      [i * 3 + 1]: t.y,
      [i * 3 + 2]: t.z,
      onUpdate: () => {
        geometry.attributes.position.needsUpdate = true;
      }
    });
  });
}

/* ================= 呼吸 / 漂浮（视频感） ================= */
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  for (let i = 0; i < targets.length; i++) {
    positions[i * 3 + 1] =
      basePositions[i * 3 + 1] +
      Math.sin(t * 1.4 + i * 0.15) * 3.5;
  }

  geometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
}

/* ================= 文字 → 点 ================= */
function getTextPoints(text, size) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 1500;
  canvas.height = 400;

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${size}px system-ui, PingFang SC, Microsoft YaHei`;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const pts = [];
  const step = 4;

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const i = (y * canvas.width + x) * 4;
      if (data[i + 3] > 150) {
        pts.push({
          x: x - canvas.width / 2,
          y: canvas.height / 2 - y,
          z: 0
        });
      }
    }
  }
  return pts;
}

/* ================= Resize ================= */
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
