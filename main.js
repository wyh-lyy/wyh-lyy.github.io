let scene, camera, renderer;
let textGeo, textPos, glowGeo, glowPos;
let textParticles, glowParticles;

init();
animate();

function init(){
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    3000
  );
  camera.position.z = 850;

  renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.setClearColor(0x000000,1);
  document.body.appendChild(renderer.domElement);

  createParticles();

  window.addEventListener("resize", onResize);
}

function createParticles(){
  const top = getTextPoints("2026 年", 170);
  const bottom = getTextPoints("新年快乐", 150)
    .map(p=>({x:p.x, y:p.y-230, z:0}));

  const points = [...top, ...bottom];

  // ===== 主粒子 =====
  textGeo = new THREE.BufferGeometry();
  textPos = new Float32Array(points.length * 3);

  // ===== 光晕粒子（放大一圈）=====
  glowGeo = new THREE.BufferGeometry();
  glowPos = new Float32Array(points.length * 3);

  for(let i=0;i<points.length;i++){
    const rx = (Math.random()-0.5)*2400;
    const ry = (Math.random()-0.5)*2400;
    const rz = (Math.random()-0.5)*1800;

    textPos[i*3]   = rx;
    textPos[i*3+1] = ry;
    textPos[i*3+2] = rz;

    glowPos[i*3]   = rx;
    glowPos[i*3+1] = ry;
    glowPos[i*3+2] = rz;
  }

  textGeo.setAttribute("position", new THREE.BufferAttribute(textPos,3));
  glowGeo.setAttribute("position", new THREE.BufferAttribute(glowPos,3));

  textParticles = new THREE.Points(
    textGeo,
    new THREE.PointsMaterial({
      color:new THREE.Color(1.0,0.78,0.25),
      size:2.2,
      transparent:true,
      opacity:1,
      depthWrite:false,
      blending:THREE.AdditiveBlending
    })
  );

  glowParticles = new THREE.Points(
    glowGeo,
    new THREE.PointsMaterial({
      color:new THREE.Color(1.0,0.6,0.2),
      size:6.5,           // 关键：放大形成光晕
      transparent:true,
      opacity:0.18,
      depthWrite:false,
      blending:THREE.AdditiveBlending
    })
  );

  scene.add(glowParticles);
  scene.add(textParticles);

  flyIn(points);
}

function flyIn(points){
  points.forEach((p,i)=>{
    const d = Math.random()*0.6;

    gsap.to(textPos,{
      duration:2.6,
      delay:d,
      ease:"power3.out",
      [i*3]:p.x,
      [i*3+1]:p.y,
      [i*3+2]:p.z,
      onUpdate:()=>textGeo.attributes.position.needsUpdate=true
    });

    gsap.to(glowPos,{
      duration:2.8,
      delay:d,
      ease:"power3.out",
      [i*3]:p.x,
      [i*3+1]:p.y,
      [i*3+2]:p.z,
      onUpdate:()=>glowGeo.attributes.position.needsUpdate=true
    });
  });
}

function getTextPoints(text, fontSize){
  const c=document.createElement("canvas");
  const ctx=c.getContext("2d");
  c.width=1600; c.height=420;

  ctx.fillStyle="#fff";
  ctx.textAlign="center";
  ctx.textBaseline="middle";
  ctx.font=`900 ${fontSize}px system-ui,PingFang SC,Microsoft YaHei`;
  ctx.fillText(text, c.width/2, c.height/2);

  const d=ctx.getImageData(0,0,c.width,c.height).data;
  const pts=[];
  for(let y=0;y<c.height;y+=3){
    for(let x=0;x<c.width;x+=3){
      if(d[(y*c.width+x)*4+3]>120){
        pts.push({x:x-c.width/2,y:c.height/2-y,z:0});
      }
    }
  }
  return pts;
}

function animate(){
  requestAnimationFrame(animate);
  renderer.render(scene,camera);
}

function onResize(){
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
}
