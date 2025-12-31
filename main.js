/* =========================================================
   2026 新年快乐 · 高级琥珀金 · 粒子飞入成字（最终版）
   使用：与 index.html 放同级，GitHub Pages 发布 root 即可
   ========================================================= */

let scene, camera, renderer, points, geometry;
let positions, targets;

init();
animate();

/* ================= 初始化 ================= */
function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    3000
  );
  camera.position.z = 700;

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 1);
  document.body.appendChild(renderer.domElement);

  createParticles();

  window.addEventListener("resize", onResize);
}

/* ================= 粒子文字 ================= */
function createParticles() {
  const text1 = getTextPoints("2026 年", 160);
  const text2 = getTextPoints("新年快乐", 140).map(p => ({
    x: p.x,
    y: p.y - 200,
    z: p.z
  }));

  targets = [...text1, ...text2];

  geometry = new THREE.BufferGeometry();
  positions = new Float32Array(targets.length * 3);

  // 初始随机散布（远处飞入）
  for (let i = 0; i < targets.length; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 2200;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2200;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 1800;
  }

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    // 高级琥珀金（压绿，避免“土黄”）
    color: new THREE.Color(1.0, 0.78, 0.25),
    // 点越小越清晰；如果你觉得太细，可改成 2.6~3.0
    size: 2.2,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);

  flyIn();
}

/* ================= 粒子飞入动画 ================= */
function flyIn() {
  targets.forEach((t, i) => {
    const delay = Math.random() * 0.6;

    gsap.to(positions, {
      duration: 2.6,
      delay,
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

/* ================= 文字 → 粒子点 ================= */
function getTextPoints(text, fontSize) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // 画布越大，字形边缘越平滑（但点数会增加）
  canvas.width = 1400;
  canvas.height = 400;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${fontSize}px system-ui, "PingFang SC", "Microsoft YaHei", Arial`;

  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const pts = [];

  // step 越小越清晰（但粒子更多，手机压力更大）
  const step = 3;

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const idx = (y * canvas.width + x) * 4;
      // alpha 通道判断是否属于字形
      if (img[idx + 3] > 128) {
        pts.push({
          x: x - canvas.width / 2,
          y: canvas.height / 2 - y,
          z: 0,
        });
      }
    }
  }
  return pts;
}

/* ================= 渲染循环 ================= */
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

/* ================= 自适应 ================= */
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
