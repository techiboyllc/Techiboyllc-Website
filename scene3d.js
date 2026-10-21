// Hero WebGL scene: a glossy logo medallion with orbiting shapes and particles.
// Loaded as a module; if WebGL is unavailable the page keeps its CSS card stack.
import * as THREE from 'three';
import { RoomEnvironment } from './assets/vendor/RoomEnvironment.js';

const canvas = document.getElementById('hero3d');
const hero = document.querySelector('.hero');
const anchor = document.querySelector('.hero-visual');

function init() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return; // no WebGL: the CSS fallback stays visible
  }
  document.documentElement.classList.add('has-3d');

  // Reduced motion is read live so a mid-session OS change is respected
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let noMotion = motionQuery.matches;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 6, 8);
  scene.add(key);
  const rim = new THREE.PointLight(0xc026d3, 30, 30);
  rim.position.set(-5, -2, 3);
  scene.add(rim);

  // ----- Medallion -----
  const rig = new THREE.Group();      // follows the .hero-visual slot
  const spinner = new THREE.Group();  // drag / auto spin
  rig.add(spinner);
  scene.add(rig);

  const logoTex = new THREE.TextureLoader().load('assets/logo-1024.jpg', () => requestRender());
  logoTex.colorSpace = THREE.SRGBColorSpace;
  logoTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  logoTex.center.set(0.5, 0.5);
  logoTex.rotation = Math.PI / 2;

  const face = new THREE.MeshPhysicalMaterial({ map: logoTex, roughness: 0.32, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08 });
  const edge = new THREE.MeshPhysicalMaterial({ color: 0xd9d9e6, metalness: 1, roughness: 0.18, clearcoat: 1 });
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.34, 128, 1), [edge, face, face]);
  coin.rotation.x = Math.PI / 2;
  spinner.add(coin);

  const ringMat = new THREE.MeshPhysicalMaterial({ color: 0x8b5cf6, metalness: 0.6, roughness: 0.15, clearcoat: 1, iridescence: 1, iridescenceIOR: 1.6 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.07, 32, 200), ringMat);
  spinner.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.025, 16, 200), new THREE.MeshPhysicalMaterial({ color: 0xf97316, metalness: 0.8, roughness: 0.2, emissive: 0xf97316, emissiveIntensity: 0.25 }));
  ring2.rotation.x = Math.PI / 2.4;
  rig.add(ring2);

  // ----- Orbiting shapes -----
  const palette = [0x5b5bf6, 0xc026d3, 0xf97316, 0x22d3ee, 0xec4899, 0x8b5cf6];
  const geos = [
    new THREE.TorusGeometry(0.42, 0.17, 32, 64),
    new THREE.IcosahedronGeometry(0.5, 0),
    new THREE.OctahedronGeometry(0.45, 0),
    new THREE.SphereGeometry(0.38, 48, 32),
    new THREE.CapsuleGeometry(0.2, 0.55, 12, 24),
    new THREE.TorusKnotGeometry(0.32, 0.11, 128, 16),
    new THREE.ConeGeometry(0.36, 0.7, 48),
    new THREE.DodecahedronGeometry(0.42, 0),
  ];
  const shapes = [];
  const SHAPES = window.innerWidth < 700 ? 8 : 12;
  for (let i = 0; i < SHAPES; i++) {
    const mat = new THREE.MeshPhysicalMaterial({
      color: palette[i % palette.length], roughness: 0.12, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05,
      iridescence: i % 3 === 0 ? 1 : 0, sheen: 0.4,
    });
    const mesh = new THREE.Mesh(geos[i % geos.length], mat);
    const angle = (i / SHAPES) * Math.PI * 2;
    const data = {
      angle, radius: 3.1 + (i % 3) * 0.9, height: Math.sin(i * 1.7) * 1.9, depth: Math.cos(i * 2.3) * 2.2,
      speed: 0.08 + (i % 4) * 0.025, bob: 0.6 + (i % 5) * 0.15, spin: new THREE.Vector3(0.3 + (i % 3) * 0.2, 0.4, 0.2 + (i % 2) * 0.3),
      scale: 0.75 + ((i * 37) % 10) / 20,
    };
    mesh.scale.setScalar(data.scale);
    mesh.userData = data;
    rig.add(mesh);
    shapes.push(mesh);
  }

  // ----- Particles -----
  const COUNT = window.innerWidth < 700 ? 900 : 1800;
  const pos = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 34;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 4;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pMat = new THREE.PointsMaterial({ size: 0.045, transparent: true, opacity: 0.8, depthWrite: false });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // ----- Theme -----
  const applyTheme = () => {
    const bg = getComputedStyle(document.body).backgroundColor.match(/\d+/g).map(Number);
    const dark = (bg[0] * 299 + bg[1] * 587 + bg[2] * 114) / 1000 < 128;
    pMat.color.set(dark ? 0xffffff : 0x5b5bf6);
    pMat.opacity = dark ? 0.75 : 0.45;
    renderer.toneMappingExposure = dark ? 1.05 : 1.15;
    rim.intensity = dark ? 40 : 18;
    requestRender();
  };
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => setTimeout(applyTheme, 50));
  setTimeout(applyTheme, 0);

  // ----- Layout: keep the medallion centred on the .hero-visual slot -----
  let width = 1, height = 1;
  const visibleHalf = new THREE.Vector2();
  const resize = () => {
    width = hero.clientWidth; height = hero.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    visibleHalf.set(halfH * camera.aspect, halfH);
    const h = hero.getBoundingClientRect(), a = anchor.getBoundingClientRect();
    const cx = (a.left + a.width / 2 - h.left) / width, cy = (a.top + a.height / 2 - h.top) / height;
    rig.userData.home = new THREE.Vector3((cx * 2 - 1) * visibleHalf.x, -(cy * 2 - 1) * visibleHalf.y, 0);
    const fit = Math.min(a.width / width * visibleHalf.x * 2, a.height / height * visibleHalf.y * 2) / 6.2;
    rig.userData.size = THREE.MathUtils.clamp(fit, 0.55, 1.15);
    requestRender();
  };
  window.addEventListener('resize', resize);

  // ----- Pointer: parallax + drag to spin (touch keeps vertical page scroll) -----
  const pointer = new THREE.Vector2(), look = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let dragging = false, lastX = 0, lastY = 0, velX = 0, velY = 0;
  const toNdc = (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  const overCoin = () => { raycaster.setFromCamera(pointer, camera); return raycaster.intersectObject(coin).length > 0; };
  hero.addEventListener('pointermove', (e) => {
    toNdc(e);
    if (dragging) {
      velY = (e.clientX - lastX) * 0.012; velX = (e.clientY - lastY) * 0.012;
      spinner.rotation.y += velY; spinner.rotation.x += velX;
      lastX = e.clientX; lastY = e.clientY;
    } else if (e.target === canvas) {
      canvas.style.cursor = overCoin() ? 'grab' : '';
    }
    requestRender();
  });
  canvas.addEventListener('pointerdown', (e) => {
    toNdc(e);
    if (!overCoin()) return;
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = 'grabbing';
  });
  const endDrag = () => { dragging = false; canvas.style.cursor = ''; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  hero.addEventListener('pointerleave', () => pointer.set(0, 0));

  // ----- Render loop (paused when the hero is off-screen or the tab is hidden) -----
  const clock = new THREE.Clock();
  let visible = true, frame = 0, pending = false;
  function requestRender() {
    if (pending) return;
    pending = true;
    frame = requestAnimationFrame(tick);
  }
  function tick() {
    pending = false;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const scrollP = THREE.MathUtils.clamp(window.scrollY / Math.max(height, 1), 0, 1);
    const home = rig.userData.home || new THREE.Vector3();
    const size = rig.userData.size || 1;

    // Scroll: the scene drifts up, tilts and spreads as the hero leaves (gently on tall phone layouts)
    const drift = noMotion ? 0 : scrollP * (camera.aspect < 1 ? 0.8 : 3.2);
    rig.position.set(home.x, home.y + drift, noMotion ? 0 : -scrollP * 3);
    rig.scale.setScalar(size);

    if (!noMotion) {
      if (!dragging) {
        velX *= 0.94; velY *= 0.94;
        spinner.rotation.y += dt * 0.55 + velY;
        spinner.rotation.x += velX;
        spinner.rotation.x += (Math.sin(t * 0.6) * 0.18 - spinner.rotation.x) * 0.02;
      }
      ring.rotation.z += dt * 0.4;
      ring2.rotation.z -= dt * 0.25;
      rig.position.y += Math.sin(t * 0.9) * 0.12;
      shapes.forEach((m) => {
        const d = m.userData;
        const a = d.angle + t * d.speed;
        const r = d.radius * (1 + scrollP * 0.9);
        m.position.set(Math.cos(a) * r, d.height + Math.sin(t * d.bob + d.angle) * 0.35, Math.sin(a) * d.depth);
        m.rotation.x += dt * d.spin.x; m.rotation.y += dt * d.spin.y; m.rotation.z += dt * d.spin.z;
      });
      particles.rotation.y += dt * 0.012;
      particles.rotation.x = scrollP * 0.4;
    } else {
      shapes.forEach((m) => {
        const d = m.userData;
        m.position.set(Math.cos(d.angle) * d.radius, d.height, Math.sin(d.angle) * d.depth);
      });
    }

    // Smooth pointer parallax (lerp)
    look.x += (pointer.x - look.x) * 0.05;
    look.y += (pointer.y - look.y) * 0.05;
    camera.position.x = look.x * 0.9;
    camera.position.y = look.y * 0.6;
    camera.lookAt(0, 0, 0);
    rig.rotation.y = look.x * 0.25;
    rig.rotation.x = -look.y * 0.15;

    renderer.render(scene, camera);
    const settling = Math.abs(pointer.x - look.x) + Math.abs(pointer.y - look.y) > 0.001;
    if (visible && !document.hidden && (!noMotion || settling || dragging)) requestRender();
  }

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { clock.getDelta(); requestRender(); } }).observe(hero);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { clock.getDelta(); requestRender(); } });
  motionQuery.addEventListener('change', (e) => { noMotion = e.matches; requestRender(); });
  window.addEventListener('scroll', () => { if (visible) requestRender(); }, { passive: true });

  resize();
  if (document.fonts) document.fonts.ready.then(resize);
  window.addEventListener('load', resize);
  requestRender();
}

if (canvas && hero && anchor) init();
