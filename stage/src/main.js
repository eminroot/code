import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Actor } from './actor.js';
import { GESTURES, smooth } from './gestures.js';
import { buildSet } from './sets.js';

const RN = typeof window.ReactNativeWebView !== 'undefined';
const send = (msg) => {
  if (RN) window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  else if (window.__onStage) window.__onStage(msg);
};
window.onerror = (m, s, l, c, e) => send({ type: 'error', message: String(m) + ' @' + l + ':' + c });

// ---------- renderer -------------------------------------------------------

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

// Speech bubbles live in the DOM, positioned over the speaker's head every frame.
const bubbleCss = document.createElement('style');
bubbleCss.textContent = `
#bubbles{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.bub{position:absolute;left:0;top:0;max-width:62%;min-width:64px;padding:8px 13px 9px;border-radius:16px;background:#fff;border:2px solid #E5E5E5;border-bottom-width:4px;
  font-family:ui-rounded,"SF Pro Rounded","Nunito",system-ui,-apple-system,sans-serif;color:#3C3C3C;text-align:center;opacity:0;
  transition:opacity .22s ease, transform .22s cubic-bezier(.3,1.5,.6,1);will-change:transform,opacity}
.bub.you{background:#DDF4FF;border-color:#84D8FF}
.bub:after{content:"";position:absolute;left:50%;bottom:-11px;width:14px;height:14px;margin-left:-7px;background:inherit;border:inherit;border-width:0 4px 4px 0;border-style:solid;border-color:inherit;transform:rotate(45deg);border-radius:0 0 4px 0}
.bub .l{font-size:17px;line-height:1.2;font-weight:800;letter-spacing:-.1px}
.bub .r{font-size:12.5px;line-height:1.25;font-weight:700;color:#777;margin-top:2px}
.bub .e{font-size:12px;line-height:1.25;font-weight:600;color:#8a8a8a;margin-top:2px}
.bub.you .r,.bub.you .e{color:#1899D6}
`;
document.head.appendChild(bubbleCss);
const bubbleLayer = document.createElement('div');
bubbleLayer.id = 'bubbles';
document.body.appendChild(bubbleLayer);
let bubbles = [];
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function buildBubbles(lines) {
  bubbleLayer.innerHTML = '';
  bubbles = (lines || []).map((ln) => {
    const el = document.createElement('div');
    el.className = 'bub ' + (ln.who === 'you' ? 'you' : 'local');
    el.innerHTML = ln.local
      ? `<div class="l">${esc(ln.local)}</div>${ln.roman ? `<div class="r">${esc(ln.roman)}</div>` : ''}<div class="e">${esc(ln.en)}</div>`
      : `<div class="l">${esc(ln.en)}</div>`;
    bubbleLayer.appendChild(el);
    return { ln, el, on: false };
  });
}
const _hp = new THREE.Vector3();
function placeBubbles() {
  if (!bubbles.length) return;
  const W = window.innerWidth, H = window.innerHeight;
  const placed = [];
  for (const b of bubbles) {
    const a = actors[b.ln.who];
    const dur = b.ln.dur ?? 2.3;
    const live = !!a && script && clock >= b.ln.t && clock <= b.ln.t + dur;
    if (!live) {
      if (b.on) { b.el.style.opacity = '0'; b.on = false; }
      continue;
    }
    a.headPos(_hp).add(new THREE.Vector3(0, 0.2, 0)).project(camera);
    if (_hp.z > 1) { b.el.style.opacity = '0'; b.on = false; continue; }
    const w = b.el.offsetWidth, h = b.el.offsetHeight;
    let x = (_hp.x * 0.5 + 0.5) * W, y = (-_hp.y * 0.5 + 0.5) * H;
    x = Math.min(W - w / 2 - 8, Math.max(w / 2 + 8, x));
    // y is the tail tip; the box top sits at y - h - 12 and must stay on screen.
    const minY = h + 22;
    y = Math.max(minY, y);
    for (const p of placed) {
      if (Math.abs(p.x - x) < (p.w + w) / 2 && Math.abs(p.y - y) < h + 6) {
        y = p.y - p.h - 8 >= minY ? p.y - p.h - 8 : p.y + h + 8;
      }
    }
    placed.push({ x, y, w, h });
    b.el.style.transform = `translate(${x - w / 2}px, ${y - h - 12}px) scale(${b.on ? 1 : 1})`;
    if (!b.on) { b.el.style.opacity = '1'; b.on = true; }
  }
}

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;

const camera = new THREE.PerspectiveCamera(28, window.innerWidth / window.innerHeight, 0.05, 50);
camera.position.set(0, 1.4, 5);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.minPolarAngle = 0.9;
controls.maxPolarAngle = 1.68;
controls.minDistance = 1.2;
controls.maxDistance = 9;
controls.rotateSpeed = 0.6;
controls.target.set(0, 1.0, 0);

// Studio light: warm key, cool fill, crisp rim.
scene.add(new THREE.HemisphereLight(0xfff6ec, 0x7d746b, 0.6));
const key = new THREE.DirectionalLight(0xfff0de, 2.3);
key.position.set(2.2, 4.2, 3.4);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.left = -2.2; key.shadow.camera.right = 2.2;
key.shadow.camera.top = 2.6; key.shadow.camera.bottom = -0.6;
key.shadow.camera.near = 0.5; key.shadow.camera.far = 12;
key.shadow.bias = -0.0004;
key.shadow.normalBias = 0.025;
key.shadow.radius = 5;
scene.add(key, key.target);
const fill = new THREE.DirectionalLight(0xe6eeff, 0.55);
fill.position.set(-3.5, 2.2, 2.4);
scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 1.35);
rim.position.set(-0.6, 3.4, -4.2);
scene.add(rim);

// Floor: shadow catcher plus a soft contact pool.
const floor = new THREE.Mesh(new THREE.CircleGeometry(8, 48), new THREE.ShadowMaterial({ opacity: 0.2 }));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);
function radialTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(40,30,20,0.35)'); gr.addColorStop(0.5, 'rgba(40,30,20,0.12)'); gr.addColorStop(1, 'rgba(40,30,20,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const poolTex = radialTexture();
function contactPool() {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.002; m.renderOrder = -1;
  return m;
}

// ---------- props ----------------------------------------------------------

function cardMesh() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 312;
  const g = c.getContext('2d');
  g.fillStyle = '#fbf8f2'; g.fillRect(0, 0, 512, 312);
  g.fillStyle = '#b5342b'; g.fillRect(36, 40, 10, 72);
  g.fillStyle = '#1b1712'; g.font = '600 40px Georgia, serif'; g.fillText('Your Name', 64, 92);
  g.font = '24px Helvetica, Arial'; g.fillStyle = '#6b6258'; g.fillText('Visiting Partner', 64, 128);
  g.fillRect(64, 230, 300, 2); g.fillText('hello@example.com', 64, 268);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const side = new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.7 });
  const face = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.091, 0.0025, 0.055), [side, side, face, side, side, side]);
  mesh.castShadow = true;
  return mesh;
}
function giftMesh(color) {
  const grp = new THREE.Group();
  const paper = new THREE.MeshStandardMaterial({ color: color || 0xa8322a, roughness: 0.45, metalness: 0.0 });
  const ribbon = new THREE.MeshStandardMaterial({ color: 0xd8b25a, roughness: 0.3, metalness: 0.6 });
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.11, 0.17), paper); box.castShadow = true; grp.add(box);
  const r1 = new THREE.Mesh(new THREE.BoxGeometry(0.175, 0.113, 0.025), ribbon); grp.add(r1);
  const r2 = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.113, 0.175), ribbon); grp.add(r2);
  const knot = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.008, 8, 20), ribbon); knot.position.y = 0.06; knot.rotation.x = Math.PI / 2.4; grp.add(knot);
  const knot2 = knot.clone(); knot2.rotation.z = Math.PI / 2; grp.add(knot2);
  return grp;
}

// ---------- assets ---------------------------------------------------------

const loader = new GLTFLoader();
const gltfCache = new Map();
const clipCache = new Map();
const waiting = new Map();
let devPack = null;
const ASSET_BASE = window.__assetBase || '../../assets/';

function b64ToBuffer(b64) {
  const bin = atob(b64); const n = bin.length; const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}
function decodeClip(c) {
  const bones = {};
  for (const k in c.bones) bones[k] = new Int16Array(b64ToBuffer(c.bones[k]));
  return { frames: c.frames, fps: c.fps, bones, root: c.root ? new Float32Array(b64ToBuffer(c.root)) : null };
}
function parseGlb(buf) {
  return new Promise((res, rej) => loader.parse(buf, '', res, rej));
}

async function need(avatars, clips) {
  const missA = avatars.filter((a) => !gltfCache.has(a));
  const missC = clips.filter((c) => !clipCache.has(c));
  if (!missA.length && !missC.length) return;
  if (!RN) {
    if (missC.length) {
      if (!devPack) devPack = await (await fetch(ASSET_BASE + 'stage/clips.bin')).json();
      for (const c of missC) if (devPack[c]) clipCache.set(c, decodeClip(devPack[c]));
    }
    await Promise.all(missA.map(async (a) => {
      const buf = await (await fetch(ASSET_BASE + 'avatars/' + a + '.glb')).arrayBuffer();
      gltfCache.set(a, await parseGlb(buf));
    }));
    return;
  }
  const id = Math.random().toString(36).slice(2);
  const p = new Promise((res) => waiting.set(id, res));
  send({ type: 'need', id, avatars: missA, clips: missC });
  await p;
}
async function receiveAssets(msg) {
  for (const k in msg.clips || {}) clipCache.set(k, decodeClip(msg.clips[k]));
  for (const k in msg.avatars || {}) {
    if (gltfCache.has(k)) continue;
    gltfCache.set(k, await parseGlb(b64ToBuffer(msg.avatars[k])));
  }
  const res = waiting.get(msg.id);
  if (res) { waiting.delete(msg.id); res(); }
}

// ---------- director -------------------------------------------------------

let actors = {};
let props = {};
let script = null;
let clock = 0;
let speed = 1;
let paused = false;
// Hold freezes the script but lets people keep breathing, for questions asked mid-scene.
let hold = false;
let setGroup = null;
let lastBeat = -1;
let camPreset = 'three';
let camAnim = null;
let sceneToken = 0;
const pools = [];

function clipName(actor, name) {
  const g = actor.gender;
  const want = g + '_' + name;
  if (clipCache.has(want)) return want;
  const other = (g === 'm' ? 'f_' : 'm_') + name;
  return clipCache.has(other) ? other : null;
}

function allClipNames(spec) {
  const names = new Set();
  const base = (spec.idle || 'idle_neutral_01');
  for (const a of spec.actors) {
    const g = a.gender || 'm';
    names.add(g + '_' + base);
    for (const ev of (spec.script?.events?.[a.id] || [])) {
      if (ev.clip) names.add(g + '_' + ev.clip);
      if (ev.then) names.add(g + '_' + ev.then);
    }
  }
  return [...names];
}

async function loadScene(spec) {
  const token = ++sceneToken;
  send({ type: 'loading' });
  const avatarIds = [...new Set(spec.actors.map((a) => a.avatar))];
  const clips = allClipNames(spec);
  // Ask for the opposite gender too, in case a clip only exists for one.
  const alt = clips.map((c) => (c[0] === 'm' ? 'f' : 'm') + c.slice(1));
  await need(avatarIds, [...clips, ...alt]);
  if (token !== sceneToken) return;

  for (const k in actors) scene.remove(actors[k].root);
  for (const k in props) scene.remove(props[k].mesh);
  pools.forEach((p) => scene.remove(p)); pools.length = 0;
  actors = {}; props = {};

  const n = spec.actors.length;
  const gap = spec.gap ?? 1.0;
  spec.actors.forEach((a, i) => {
    const actor = new Actor(gltfCache.get(a.avatar), a);
    for (const c of clipCache.keys()) actor.addClip(c, clipCache.get(c));
    if (n === 1) {
      actor.root.position.set(0, 0, 0);
      actor.root.rotation.y = a.yaw ?? 0;
    } else {
      const x = i === 0 ? -gap / 2 : gap / 2;
      actor.root.position.set(x, 0, 0);
      actor.root.rotation.y = i === 0 ? Math.PI / 2 : -Math.PI / 2;
    }
    const idle = clipName(actor, a.idle || spec.idle || 'idle_neutral_01');
    if (idle) {
      actor.play(idle, { fade: 0 });
      // De-sync idles so two people never breathe in lockstep.
      actor.current.time = (i * 3.7) % actor.current.getClip().duration;
    }
    actor.idleClip = idle;
    scene.add(actor.root);
    const pool = contactPool(); pool.position.x = actor.root.position.x; pools.push(pool); scene.add(pool);
    actors[a.id] = actor;
  });
  const ids = Object.keys(actors);
  ids.forEach((id) => { actors[id].partner = ids.length > 1 ? actors[ids.find((x) => x !== id)] : null; });

  if (setGroup) scene.remove(setGroup);
  setGroup = spec.set ? buildSet(spec.set, spec.accent) : null;
  if (setGroup) scene.add(setGroup);
  floor.visible = !setGroup;

  for (const p of spec.props || []) {
    const mesh = p.kind === 'gift' ? giftMesh(p.color) : cardMesh();
    mesh.visible = false;
    scene.add(mesh);
    props[p.id] = { ...p, mesh };
  }

  script = spec.script || null;
  if (spec.bg) document.body.style.background = spec.bg;
  buildBubbles(script && script.lines);
  clock = 0; lastBeat = -1;
  if (script) resetEvents();
  setCamera(spec.camera || 'three', true);
  for (let i = 0; i < 3; i++) tick(0.016, true);
  send({ type: 'loaded' });
}

function resetEvents() {
  for (const id in actors) {
    const a = actors[id];
    a.fired = new Set();
    if (a.idleClip && a.current && a.current.getClip().name !== a.idleClip) a.play(a.idleClip, { fade: 0.4 });
  }
}

function runScript(dt) {
  if (!script) return;
  clock += dt;
  const dur = script.duration || 6;
  if (clock >= dur) {
    if (script.loop === false) { clock = dur; }
    else { clock = 0; lastBeat = -1; resetEvents(); send({ type: 'cycle' }); }
  }
  const beats = script.beats || [];
  for (let i = beats.length - 1; i >= 0; i--) {
    if (clock >= beats[i].t) {
      if (i !== lastBeat) { lastBeat = i; send({ type: 'beat', i: beats[i].i ?? i }); }
      break;
    }
  }
  for (const id in actors) {
    const a = actors[id];
    const evs = script.events?.[id] || [];
    a.pose.look = a.partner ? a.partner.headPos(new THREE.Vector3()) : null;
    a.pose.lookW = a.partner ? (script.lookW ?? 0.8) : 0;
    evs.forEach((ev, k) => {
      if (ev.clip && clock >= ev.t && !a.fired.has(k)) {
        a.fired.add(k);
        const nm = clipName(a, ev.clip);
        const then = ev.then ? clipName(a, ev.then) : (ev.once ? a.idleClip : null);
        if (nm) a.play(nm, { fade: ev.fade ?? 0.45, once: !!ev.once, then, speed: ev.speed ?? 1 });
      }
      if (ev.g && clock >= ev.t && clock <= ev.t + ev.dur) {
        const fn = GESTURES[ev.g];
        if (fn) fn({ a, o: a.partner, u: clock - ev.t, dur: ev.dur, p: ev.p || {}, pose: a.pose });
      }
    });
  }
}

function placeProps() {
  for (const id in props) {
    const pr = props[id];
    let state = null;
    for (const st of pr.at || []) if (clock >= st.t) state = st;
    const a = state && state.holder ? actors[state.holder] : null;
    const hold = a && a._lastHold;
    if (!hold || hold.e < 0.04) { pr.mesh.visible = false; continue; }
    pr.mesh.visible = true;
    const toO = a.partner ? a.partner.root.position.clone().sub(a.root.position).setY(0).normalize() : a.forward(new THREE.Vector3());
    const yaw = Math.atan2(toO.x, toO.z);
    const facing = state.facing || hold.facing || 'out';
    pr.mesh.position.copy(hold.C);
    pr.mesh.rotation.set(0, yaw + (facing === 'in' ? Math.PI : 0), 0, 'YXZ');
    if (pr.kind === 'card') pr.mesh.rotateX(hold.hand ? 0.15 : facing === 'in' ? 1.0 : 1.15);
  }
}

// ---------- camera ---------------------------------------------------------

function framing() {
  const list = Object.values(actors);
  if (!list.length) return { c: new THREE.Vector3(0, 1, 0), w: 1 };
  const xs = list.map((a) => a.root.position.x);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const h = Math.max(...list.map((a) => a.m.height));
  return { c: new THREE.Vector3((minX + maxX) / 2, 0, 0), w: maxX - minX + 0.9, h };
}

function cameraFor(preset) {
  const { c, w, h } = framing();
  const aspect = window.innerWidth / window.innerHeight;
  const vfov = camera.fov * Math.PI / 180;
  const tight = preset === 'close' || preset === 'upper';
  const height = tight ? 1.05 : h + 0.35;
  const width = tight ? Math.min(w, 1.3) : w + 0.2;
  const dist = Math.max(height / 2 / Math.tan(vfov / 2), width / 2 / (Math.tan(vfov / 2) * aspect)) + 0.4;
  const cy = tight ? h - 0.42 : h * 0.5 + 0.02;
  const target = new THREE.Vector3(c.x, cy, 0);
  const list = Object.values(actors);
  let az = 0, el = 0.12;
  if (preset === 'three') az = list.length > 1 ? -0.62 : 0.45;
  if (preset === 'other') az = 0.62;
  if (preset === 'side') az = 0;
  if (preset === 'front') az = list.length > 1 ? 0 : 0.0;
  if (preset === 'close') { az = list.length > 1 ? -0.75 : 0.35; el = 0.05; }
  if (preset === 'local' || (preset === 'close' && list.length > 1)) {
    const who = list[list.length - 1];
    const chest = who.chest(new THREE.Vector3());
    const t = new THREE.Vector3(who.root.position.x, chest.y - 0.08, 0);
    const faceDir = who.forward(new THREE.Vector3());
    const side = new THREE.Vector3(0, 0, 1);
    const dir = faceDir.clone().multiplyScalar(1.5).add(side).normalize();
    const d = Math.max(1.15 / 2 / Math.tan(vfov / 2), 1.0 / 2 / (Math.tan(vfov / 2) * aspect)) + 0.2;
    t.addScaledVector(faceDir, 0.12);
    return { pos: t.clone().addScaledVector(dir, d).add(new THREE.Vector3(0, 0.12, 0)), target: t };
  }
  if (preset === 'portrait' && list.length) {
    const who = list[list.length - 1];
    const head = who.headPos(new THREE.Vector3());
    const t = head.clone().add(new THREE.Vector3(0, -0.13, 0));
    const fwd = who.forward(new THREE.Vector3());
    const dir = fwd.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.38).normalize();
    const d = Math.max(0.62 / 2 / Math.tan(vfov / 2), 0.5 / 2 / (Math.tan(vfov / 2) * aspect));
    return { pos: t.clone().addScaledVector(dir, d).add(new THREE.Vector3(0, 0.03, 0)), target: t };
  }
  if (preset === 'pov' && list.length > 1) {
    const you = list[0], other = list[1];
    // Over the shoulder: far enough back that the other person shows from head to knees.
    const gap = other.root.position.distanceTo(you.root.position);
    const want = 1.45 / 2 / Math.tan(vfov / 2);
    const back = Math.max(1.2, want - gap);
    const eye = you.headPos(new THREE.Vector3()).add(new THREE.Vector3(-back, 0.22, 0.62 + back * 0.22));
    const look = other.headPos(new THREE.Vector3()).add(new THREE.Vector3(0, -0.5, 0));
    return { pos: eye, target: look };
  }
  if (list.length === 1) target.x = list[0].root.position.x;
  const pos = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(dist).add(target);
  return { pos, target };
}

function setCamera(preset, instant) {
  camPreset = preset;
  const to = cameraFor(preset);
  if (instant) {
    camera.position.copy(to.pos); controls.target.copy(to.target); controls.update(); camAnim = null;
  } else {
    camAnim = { from: camera.position.clone(), fromT: controls.target.clone(), to, t: 0 };
  }
}

// ---------- loop -----------------------------------------------------------

let last = performance.now();
function tick(dt, silent) {
  runScript(paused || hold ? 0 : dt * speed);
  for (const id in actors) {
    const a = actors[id];
    a._lastHold = a.pose.hold || null;
    a.update(paused ? 0 : dt * speed);
  }
  placeProps();
  if (camAnim) {
    camAnim.t = Math.min(1, camAnim.t + dt / 0.9);
    const k = smooth(camAnim.t);
    camera.position.lerpVectors(camAnim.from, camAnim.to.pos, k);
    controls.target.lerpVectors(camAnim.fromT, camAnim.to.target, k);
    if (camAnim.t >= 1) camAnim = null;
  }
  controls.update();
  if (!silent) { renderer.render(scene, camera); placeBubbles(); }
}
let running = true;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (running) tick(dt);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

let timeTicker = 0;
setInterval(() => {
  if (!script || paused || !running) return;
  timeTicker++;
  send({ type: 't', t: clock, d: script.duration || 6 });
}, 250);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  setCamera(camPreset, true);
});

// ---------- bridge ---------------------------------------------------------

function handle(msg) {
  switch (msg.type) {
    case 'scene': loadScene(msg.scene).catch((e) => send({ type: 'error', message: String(e && e.message || e) })); break;
    case 'assets': receiveAssets(msg).catch((e) => send({ type: 'error', message: String(e && e.message || e) })); break;
    case 'camera': setCamera(msg.preset, false); break;
    case 'speed': speed = msg.value; break;
    case 'pause': paused = !!msg.value; break;
    case 'hold': hold = !!msg.value; break;
    case 'restart': clock = 0; lastBeat = -1; resetEvents(); break;
    case 'seek': clock = msg.t; lastBeat = -1; resetEvents(); break;
    case 'run': running = !!msg.value; last = performance.now(); break;
    case 'bg': document.body.style.background = msg.value; break;
  }
}
window.__stage = (m) => handle(typeof m === 'string' ? JSON.parse(m) : m);
document.addEventListener('message', (e) => handle(JSON.parse(e.data)));
window.addEventListener('message', (e) => { try { handle(typeof e.data === 'string' ? JSON.parse(e.data) : e.data); } catch (_) {} });
window.__debug = {
  actors: () => actors, camera, scene, setCamera, GESTURES,
  // Render the scene at script time t (used by the dev harness).
  capture(t, bg) {
    this.at(t);
    const src = renderer.domElement;
    const c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(c.width / 2, c.height * 0.3, 0, c.width / 2, c.height * 0.3, Math.max(c.width, c.height) * 0.9);
    gr.addColorStop(0, bg?.[0] || '#fbf7f1'); gr.addColorStop(0.55, bg?.[1] || '#efe7dc'); gr.addColorStop(1, bg?.[2] || '#e3d8ca');
    g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
    g.drawImage(src, 0, 0);
    return c.toDataURL('image/jpeg', 0.86);
  },
  at(t) { paused = false; clock = Math.max(0, t - 0.2); lastBeat = -1; resetEvents(); for (let i = 0; i < 12; i++) tick(1 / 60, true); paused = true; tick(0, false); },
};
send({ type: 'ready' });
