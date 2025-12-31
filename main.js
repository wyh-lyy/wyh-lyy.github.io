let scene, camera, renderer, composer;
let points, geometry;
let positions, velocities, brightness;
let attractors = [];

const COUNT = 120000;     // 粒子规模（关键）
const AREA = 1600;
const BASE_COLOR = new THREE.Color(1.0, 0.75, 0.25);

init();
animate();

function init(){
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 1, 5000);
  camera.position.z = 900;

  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 1.4;
  document.body.appendChild(renderer.domElement);

  composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene,camera));

  const bloom = new THREE.UnrealBloomPass(
    new THREE.Vector2(innerWidth,innerHeight),
    1.4, 0.45, 0.15
  );
  composer.addPass(bloom);

  buildParticles();
  buildTextAttractors();

  addEventListener('resize',onResize);
}

function buildParticles(){
  geometry = new THREE.BufferGeometry();
  positions  = new Float32Array(COUNT*3);
  velocities = new Float32Array(COUNT*3);
  brightness = new Float32Array(COUNT);

  for(let i=0;i<COUNT;i++){
    positions[i*3]   = (Math.random()-0.5)*AREA;
    positions[i*3+1] = (Math.random()-0.5)*AREA;
    positions[i*3+2] = (Math.random()-0.5)*AREA;

    velocities[i*3]   = (Math.random()-0.5)*0.3;
    velocities[i*3+1] = (Math.random()-0.5)*0.3;
    velocities[i*3+2] = (Math.random()-0.5)*0.3;

    brightness[i] = Math.random();
  }

  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('aBright',new THREE.BufferAttribute(brightness,1));

  const material = new THREE.ShaderMaterial({
    transparent:true,
    depthWrite:false,
    blending:THREE.AdditiveBlending,
    uniforms:{
      uColor:{value:BASE_COLOR}
    },
    vertexShader:`
      attribute float aBright;
      varying float vBright;
      void main(){
        vBright = aBright;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        gl_PointSize = 1.8 + aBright*2.5;
      }
    `,
    fragmentShader:`
      uniform vec3 uColor;
      varying float vBright;
      void main(){
        float d = length(gl_PointCoord-0.5);
        float a = smoothstep(0.5,0.0,d);
        gl_FragColor = vec4(uColor * (vBright*1.6), a);
      }
    `
  });

  points = new THREE.Points(geometry,material);
  scene.add(points);
}

function buildTextAttractors(){
  const make = (text,y,size)=>{
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    c.width = 1400; c.height = 300;
    ctx.fillStyle='#fff';
    ctx.font = `bold ${size}px system-ui,PingFang SC`;
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText(text,c.width/2,c.height/2);

    const data = ctx.getImageData(0,0,c.width,c.height).data;
    for(let y0=0;y0<c.height;y0+=4){
      for(let x0=0;x0<c.width;x0+=4){
        if(data[(y0*c.width+x0)*4+3]>150){
          attractors.push({
            x:x0-c.width/2,
            y:(c.height/2-y0)+y,
            z:0
          });
        }
      }
    }
  };

  make("2026 年", 120, 170);
  make("新年快乐",-120, 140);
}

function animate(){
  requestAnimationFrame(animate);

  for(let i=0;i<COUNT;i++){
    let ix=i*3;

    let ax=0,ay=0,az=0;
    for(let j=0;j<attractors.length;j+=25){
      const t=attractors[j];
      let dx=t.x-positions[ix];
      let dy=t.y-positions[ix+1];
      let dz=t.z-positions[ix+2];
      let d=Math.sqrt(dx*dx+dy*dy+dz*dz)+0.001;
      let f=1.2/(d*d);
      ax+=dx*f; ay+=dy*f; az+=dz*f;
    }

    velocities[ix]   += ax*0.0006;
    velocities[ix+1] += ay*0.0006;
    velocities[ix+2] += az*0.0006;

    positions[ix]   += velocities[ix];
    positions[ix+1] += velocities[ix+1];
    positions[ix+2] += velocities[ix+2];

    brightness[i] = 0.6 + Math.random()*0.4;
  }

  geometry.attributes.position.needsUpdate=true;
  geometry.attributes.aBright.needsUpdate=true;

  camera.position.z = 900 + Math.sin(Date.now()*0.0004)*20;

  composer.render();
}

function onResize(){
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
  composer.setSize(innerWidth,innerHeight);
}
