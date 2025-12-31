// ================== WebGL 安全检查 ==================
if (!window.WebGLRenderingContext) {
  document.body.innerHTML =
    '<div style="color:#ffcc66;text-align:center;margin-top:40vh;font-size:16px">' +
    '当前浏览器不支持 WebGL</div>';
  throw new Error("WebGL not supported");
}

// ================== 场景基础 ==================
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 120;

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: "low-power"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 1);
document.body.appendChild(renderer.domElement);

// ================== 文字 Canvas ==================
function createTextPoints(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 200;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 96px sans-serif";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const points = [];

  for (let y = 0; y < canvas.height; y += 4) {
    for (let x = 0; x < canvas.width; x += 4) {
      const i = (y * canvas.width + x) * 4;
      if (img.data[i + 3] > 128) {
        points.push({
          x: (x - canvas.width / 2) * 0.25,
          y: (canvas.height / 2 - y) * 0.25,
          z: 0
        });
      }
    }
  }
  return points.slice(0, 1200); // 手机安全上限
}

// ================== 粒子 ==================
const pointsData = createTextPoints("2026 新年快乐");
const geometry = new THREE.BufferGeometry();

const positions = new Float32Array(pointsData.length * 3);
const startPositions = new Float32Array(pointsData.length * 3);

pointsData.forEach((p, i) => {
  positions[i * 3] = p.x;
  positions[i * 3 + 1] = p.y;
  positions[i * 3 + 2] = p.z;

  startPositions[i * 3] = (Math.random() - 0.5) * 400;
  startPositions[i * 3 + 1] = (Math.random() - 0.5) * 400;
  startPositions[i * 3 + 2] = (Math.random() - 0.5) * 400;
});

geometry.setAttribute(
  "position",
  new THREE.BufferAttribute(startPositions, 3)
);

const material = new THREE.PointsMaterial({
  color: 0xffcc66,
  size: 2.2,
  transparent: true,
  opacity: 0.95,
  depthWrite: false
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// ================== 飞入动画 ==================
gsap.to(geometry.attributes.position.array, {
  duration: 3.2,
  ease: "power3.out",
  endArray: positions,
  onUpdate: () => {
    geometry.attributes.position.needsUpdate = true;
  }
});

// ================== 渲染循环 ==================
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// ================== 自适应 ==================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
