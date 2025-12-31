let scene, camera, renderer, composer;
let points, geometry, positions, targets;
let sparks, sparkGeo, sparkPos;

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 3000);
  camera.position.z = 750;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 1);
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 1.35;
  document.body.appendChild(renderer.domElement);

  // ===== 后处理 Bloom =====
  composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));

  const bloom = new THREE.UnrealBloomPass(
    new THREE.Vector2(innerWidth, innerHeight),
    1.25,   // 强度
    0.85,   // 半径
    0.15    // 阈值
  );
  composer.addPass(bloom);

  createTextParticles();
  createSparks();

  window.addEventListener("resize", onResize);
}

function createTextParticles() {
  const t1 = textPoints("2026 年", 170);
  const t2 = textPoints("新年快乐", 150).map(p => ({
    x: p.x,
    y: p.y - 210,
    z: 0
  }));

  targets = [...t1, ...t2];

  geometry = new THREE.BufferGeometry();
  positions = new Float32Array(targets.length * 3);

  for (let i = 0; i < targets.length; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 2400;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2400;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: new THREE.Color(1.0, 0.72, 0.25),
    size: 2.4,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  points = new THREE.Points(geometry, mat);
  scene.add(points);

  flyIn();
}

function flyIn() {
  targets.forEach((t, i) => {
    gsap.to(positions, {
      duration: 3.0,
      delay: Math.random() * 0.6,
      ease: "power3.out",
      [i * 3]:     t.x,
      [i * 3 + 1]: t.y,
      [i * 3 + 2]: t.z,
      onUpdate: () => geometry.attributes.position.needsUpdate = true
    });
  });
}

function createSparks() {
  sparkGeo = new THREE.BufferGeometry();
  sparkPos = new Float32Array(800 * 3);

  for (let i = 0; i < 800; i++) {
    sparkPos[i * 3]     = (Math.random() - 0.5) * 1200;
    sparkPos[i * 3 + 1] = (Math.random() - 0.5) * 600;
    sparkPos[i * 3 + 2] = (Math.random() - 0.5) * 600;
  }

  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));

  const mat = new THREE.PointsMaterial({
    color: new THREE.Color(1.0, 0.55, 0.15),
    size: 1.6,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  sparks = new THREE.Points(sparkGeo, mat);
  scene.add(sparks);
}

function animate() {
  requestAnimationFrame(animate);

  // 火花漂浮
  for (let i = 0; i < sparkPos.length; i += 3) {
    sparkPos[i + 1] += 0.15;
    if (sparkPos[i + 1] > 400) sparkPos[i + 1] = -400;
  }
  sparkGeo.attributes.position.needsUpdate = true;

  composer.render();
}

function textPoints(text, size) {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  c.width = 1400;
  c.height = 400;

  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${size}px system-ui, PingFang SC, Microsoft YaHei`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, c.width / 2, c.height / 2);

  const img = ctx.getImageData(0, 0, c.width, c.height).data;
  const pts = [];
  const step = 3;

  for (let y = 0; y < c.height; y += step) {
    for (let x = 0; x < c.width; x += step) {
      if (img[(y * c.width + x) * 4 + 3] > 128) {
        pts.push({ x: x - c.width / 2, y: c.height / 2 - y, z: 0 });
      }
    }
  }
  return pts;
}

function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
}
