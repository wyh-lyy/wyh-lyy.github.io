let scene, camera, renderer, composer;
let textPoints = [], textGeo, textPos;
let sparkGeo, sparkPos;
let textParticles, sparks;

init();
animate();

/* ---------------- 初始化 ---------------- */
function init(){
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    4000
  );
  camera.position.z = 900;

  renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.setClearColor(0x000000,1);
  document.body.appendChild(renderer.domElement);

  /* -------- 后处理 Bloom -------- */
  const renderPass = new THREE.RenderPass(scene, camera);
  const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.4,   // strength
    0.55,  // radius
    0.15   // threshold
  );

  composer = new THREE.EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(bloomPass);

  createTextParticles();
  createSparks();

  window.addEventListener("resize", onResize);
}

/* ---------------- 文字粒子 ---------------- */
function createTextParticles(){
  const top = getTextPoints("2026 年", 170);
  const bottom = getTextPoints("新年快乐", 150)
    .map(p => ({ x:p.x, y:p.y - 230, z:0 }));

  textPoints = [...top, ...bottom];

  textGeo = new THREE.BufferGeometry();
  textPos = new Float32Array(textPoints.length * 3);

  for(let i=0;i<textPoints.length;i++){
    textPos[i*3]   = (Math.random()-0.5)*2500;
    textPos[i*3+1] = (Math.random()-0.5)*2500;
    textPos[i*3+2] = (Math.random()-0.5)*1800;
  }

  textGeo.setAttribute("position", new THREE.BufferAttribute(textPos,3));

  const mat = new THREE.PointsMaterial({
    color: new THREE.Color(1.0,0.78,0.28),
    size: 2.6,
    transparent:true,
    opacity:1,
    depthWrite:false,
    blending:THREE.AdditiveBlending
  });

  textParticles = new THREE.Points(textGeo, mat);
  scene.add(textParticles);

  flyInText();
}

/* ---------------- 飞入动画 ---------------- */
function flyInText(){
  textPoints.forEach((t,i)=>{
    gsap.to(textPos,{
      duration:2.8,
      delay:Math.random()*0.7,
      ease:"power3.out",
      [i*3]:t.x,
      [i*3+1]:t.y,
      [i*3+2]:t.z,
      onUpdate:()=>textGeo.attributes.position.needsUpdate=true
    });
  });
}

/* ---------------- 火花粒子 ---------------- */
function createSparks(){
  const COUNT = 1200;
  sparkGeo = new THREE.BufferGeometry();
  sparkPos = new Float32Array(COUNT*3);

  for(let i=0;i<COUNT;i++){
    sparkPos[i*3]   = (Math.random()-0.5)*1800;
    sparkPos[i*3+1] = (Math.random()-0.5)*1200;
    sparkPos[i*3+2] = (Math.random()-0.5)*2000;
  }

  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos,3));

  const mat = new THREE.PointsMaterial({
    color: new THREE.Color(1.0,0.6,0.2),
    size:1.6,
    transparent:true,
    opacity:.75,
    depthWrite:false,
    blending:THREE.AdditiveBlending
  });

  sparks = new THREE.Points(sparkGeo, mat);
  scene.add(sparks);
}

/* ---------------- 文字采样 ---------------- */
function getTextPoints(text, fontSize){
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 1600;
  canvas.height = 420;

  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#fff";
  ctx.textAlign="center";
  ctx.textBaseline="middle";
  ctx.font=`900 ${fontSize}px system-ui,PingFang SC,Microsoft YaHei`;

  ctx.fillText(text, canvas.width/2, canvas.height/2);

  const data = ctx.getImageData(0,0,canvas.width,canvas.height).data;
  const pts = [];
  const step = 3;

  for(let y=0;y<canvas.height;y+=step){
    for(let x=0;x<canvas.width;x+=step){
      const i = (y*canvas.width + x)*4;
      if(data[i+3]>120){
        pts.push({
          x:x-canvas.width/2,
          y:canvas.height/2-y,
          z:0
        });
      }
    }
  }
  return pts;
}

/* ---------------- 动画循环 ---------------- */
function animate(){
  requestAnimationFrame(animate);

  // 火花缓慢漂移
  const arr = sparkGeo.attributes.position.array;
  for(let i=0;i<arr.length;i+=3){
    arr[i]   += Math.sin(Date.now()*0.001+i)*0.03;
    arr[i+1] += Math.cos(Date.now()*0.001+i)*0.04;
  }
  sparkGeo.attributes.position.needsUpdate = true;

  composer.render();
}

/* ---------------- resize ---------------- */
function onResize(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}
