import * as THREE from 'three';

// Simple rooms and streets built from boxes and canvas textures, so every scene
// happens somewhere. People stand around x = ±0.8, z = 0, and the camera looks
// from +z, so everything here sits behind them (z < -1) or off to the sides.

const R = 3.6;   // half width of a room
const D = -2.8;  // back wall
const FRONT = 7; // how far the side walls reach towards the camera

// ---------- helpers --------------------------------------------------------

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: o.r ?? 0.85, metalness: o.m ?? 0, map: o.map ?? null, transparent: !!o.op, opacity: o.op ?? 1 });
const flat = (map, o = {}) => new THREE.MeshBasicMaterial({ map, transparent: !!o.t, depthWrite: !o.t, toneMapped: false });

// A box whose y is its bottom edge.
function box(g, w, h, d, m, x, y, z, ry = 0) {
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  b.position.set(x, y + h / 2, z); b.rotation.y = ry;
  g.add(b); return b;
}
function cyl(g, r1, r2, h, m, x, y, z, seg = 20) {
  const c = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m);
  c.position.set(x, y + h / 2, z);
  g.add(c); return c;
}

function hexA(c, a) {
  const n = new THREE.Color(c);
  return `rgba(${Math.round(n.r * 255)},${Math.round(n.g * 255)},${Math.round(n.b * 255)},${a})`;
}
function mix(a, b, k) { return '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString(); }
// Country colours are bright; big surfaces get a calmer version of them.
const calm = (accent, k = 0.62) => mix(accent, '#8a8178', k);

// ---------- surfaces -------------------------------------------------------

function planks(base, seed) {
  const r = rng(seed);
  return tex(512, 512, (g, w, h) => {
    const rows = 11, rh = h / rows;
    for (let i = 0; i < rows; i++) {
      let x = -r() * 200;
      while (x < w) {
        const len = 160 + r() * 260;
        g.fillStyle = mix(base, r() > 0.5 ? '#000000' : '#ffffff', r() * 0.12);
        g.fillRect(x, i * rh, len, rh);
        for (let k = 0; k < 7; k++) {
          g.strokeStyle = `rgba(60,35,15,${0.04 + r() * 0.06})`; g.lineWidth = 1;
          const yy = i * rh + 3 + r() * (rh - 6);
          g.beginPath(); g.moveTo(x, yy); g.bezierCurveTo(x + len * 0.3, yy + r() * 4 - 2, x + len * 0.7, yy + r() * 4 - 2, x + len, yy); g.stroke();
        }
        g.fillStyle = 'rgba(40,25,10,0.35)'; g.fillRect(x + len - 1.5, i * rh, 1.5, rh);
        x += len;
      }
      g.fillStyle = 'rgba(40,25,10,0.3)'; g.fillRect(0, i * rh, w, 1.5);
    }
  }, [3.5, 5]);
}

function tiles(a, b, grout, n, seed, checker) {
  const r = rng(seed);
  return tex(512, 512, (g, w) => {
    const s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      g.fillStyle = mix(checker && (i + j) % 2 ? b : a, '#808080', r() * 0.05);
      g.fillRect(i * s, j * s, s, s);
      for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(0,0,0,${r() * 0.03})`; g.fillRect(i * s + r() * s, j * s + r() * s, 2 + r() * 6, 2 + r() * 6); }
    }
    g.strokeStyle = grout; g.lineWidth = 3;
    for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, w); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke(); }
  }, [3, 4.5]);
}

function paving(seed) {
  const r = rng(seed);
  return tex(512, 512, (g, w, h) => {
    const rows = 8, rh = h / rows, bw = rh * 2;
    g.fillStyle = '#9d978f'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < rows; i++) for (let x = (i % 2) * -bw / 2; x < w; x += bw) {
      g.fillStyle = mix('#b8b2a9', r() > 0.5 ? '#8f8a83' : '#d2cdc5', r() * 0.6);
      g.fillRect(x + 2, i * rh + 2, bw - 4, rh - 4);
      for (let k = 0; k < 18; k++) { g.fillStyle = `rgba(0,0,0,${r() * 0.05})`; g.fillRect(x + r() * bw, i * rh + r() * rh, 3, 3); }
    }
  }, [5, 7]);
}

// Wall colour with soft shading near the floor and at the corners.
function wallTex(color, w, h, extra) {
  return tex(1024, Math.round(1024 * h / w), (g, cw, ch) => {
    g.fillStyle = color; g.fillRect(0, 0, cw, ch);
    if (extra) extra(g, cw, ch);
    let gr = g.createLinearGradient(0, ch, 0, ch * 0.72);
    gr.addColorStop(0, 'rgba(30,20,10,0.22)'); gr.addColorStop(1, 'rgba(30,20,10,0)');
    g.fillStyle = gr; g.fillRect(0, 0, cw, ch);
    gr = g.createLinearGradient(0, 0, 0, ch * 0.25);
    gr.addColorStop(0, 'rgba(30,20,10,0.1)'); gr.addColorStop(1, 'rgba(30,20,10,0)');
    g.fillStyle = gr; g.fillRect(0, 0, cw, ch);
    for (const side of [0, 1]) {
      gr = g.createLinearGradient(side ? cw : 0, 0, side ? cw * 0.93 : cw * 0.07, 0);
      gr.addColorStop(0, 'rgba(30,20,10,0.16)'); gr.addColorStop(1, 'rgba(30,20,10,0)');
      g.fillStyle = gr; g.fillRect(0, 0, cw, ch);
    }
  });
}

// Floor darkening where it meets a wall.
let aoTex = null;
function floorShade(g, w, x, z, ry) {
  if (!aoTex) aoTex = tex(8, 128, (c, cw, ch) => {
    const gr = c.createLinearGradient(0, 0, 0, ch);
    gr.addColorStop(0, 'rgba(20,12,5,0.32)'); gr.addColorStop(1, 'rgba(20,12,5,0)');
    c.fillStyle = gr; c.fillRect(0, 0, cw, ch);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.7), flat(aoTex, { t: true }));
  m.rotation.set(-Math.PI / 2, 0, ry);
  m.position.set(x, 0.003, z);
  g.add(m);
}

function room(g, { floor, back, side, height = 3.2, base = '#ffffff' }) {
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(R * 2, FRONT - D), mat(0xffffff, { map: floor, r: 0.7 }));
  fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0, (FRONT + D) / 2); fl.receiveShadow = true;
  g.add(fl);
  const bw = new THREE.Mesh(new THREE.PlaneGeometry(R * 2, height), mat(0xffffff, { map: back, r: 0.95 }));
  bw.position.set(0, height / 2, D); g.add(bw);
  const len = FRONT - D;
  for (const s of [1, -1]) {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(len, height), mat(0xffffff, { map: side, r: 0.95 }));
    sw.rotation.y = -s * Math.PI / 2; sw.position.set(s * R, height / 2, (FRONT + D) / 2); g.add(sw);
    box(g, 0.02, 0.1, len, mat(base, { r: 0.6 }), s * (R - 0.01), 0, (FRONT + D) / 2);
    floorShade(g, len, s * (R - 0.35), (FRONT + D) / 2, s * Math.PI / 2);
  }
  box(g, R * 2, 0.1, 0.02, mat(base, { r: 0.6 }), 0, 0, D + 0.01);
  floorShade(g, R * 2, 0, D + 0.35, 0);
}

// ---------- outside views ---------------------------------------------------

function skyline(seed) {
  const r = rng(seed);
  return tex(512, 384, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#a9d4f2'); gr.addColorStop(1, '#eaf5fc');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (const [tone, top] of [['#cfdde8', 0.35], ['#b9cbd9', 0.5]]) {
      let x = -20;
      while (x < w) {
        const bw = 30 + r() * 70, bh = h * (top + r() * 0.3);
        g.fillStyle = tone; g.fillRect(x, h - bh, bw, bh);
        g.fillStyle = 'rgba(255,255,255,0.35)';
        for (let yy = h - bh + 8; yy < h - 6; yy += 12) for (let xx = x + 5; xx < x + bw - 6; xx += 10) if (r() > 0.4) g.fillRect(xx, yy, 4, 6);
        x += bw + 4;
      }
    }
  });
}

function garden(seed) {
  const r = rng(seed);
  return tex(512, 384, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#b6dbf3'); gr.addColorStop(1, '#f1f8fc');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) {
      g.fillStyle = mix('#7fae6a', i % 2 ? '#4f7f45' : '#a7cf8e', r() * 0.6);
      g.beginPath(); g.arc(r() * w, h * 0.55 + r() * h * 0.5, 40 + r() * 60, 0, Math.PI * 2); g.fill();
    }
  });
}

function motion(seed) {
  const r = rng(seed);
  return tex(512, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#cfe6f5'); gr.addColorStop(0.5, '#e8f1ea'); gr.addColorStop(1, '#a8b9a0');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      g.fillStyle = hexA(r() > 0.5 ? '#6f8f68' : '#9aa7b2', 0.15 + r() * 0.3);
      g.fillRect(r() * w - 100, h * 0.35 + r() * h * 0.65, 80 + r() * 260, 2 + r() * 10);
    }
  });
}

// A window: frame, sill and a bright view that ignores lighting.
function windowOn(g, view, w, h, x, y, z, ry = 0, frame = '#f7f5f0') {
  const grp = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), flat(view));
  grp.add(glass);
  const fm = mat(frame, { r: 0.5 });
  const t = 0.06;
  box(grp, w + t * 2, t, 0.08, fm, 0, h / 2, 0);
  box(grp, w + t * 2, t, 0.08, fm, 0, -h / 2 - t, 0);
  box(grp, t, h, 0.08, fm, -w / 2 - t / 2, -h / 2, 0);
  box(grp, t, h, 0.08, fm, w / 2 + t / 2, -h / 2, 0);
  box(grp, t * 0.6, h, 0.05, fm, 0, -h / 2, 0);
  box(grp, w + 0.2, 0.04, 0.18, fm, 0, -h / 2 - t - 0.04, 0.06);
  grp.position.set(x, y, z); grp.rotation.y = ry;
  g.add(grp);
  return grp;
}

// ---------- furniture ------------------------------------------------------

function plant(g, x, z, s = 1, potColor = '#efe9df') {
  const r = rng(Math.round(x * 100 + z * 10));
  cyl(g, 0.19 * s, 0.14 * s, 0.38 * s, mat(potColor, { r: 0.55 }), x, 0, z, 28);
  cyl(g, 0.17 * s, 0.17 * s, 0.02, mat('#4a3626'), x, 0.37 * s, z, 20);
  const leaf = [mat('#4e7a3a', { r: 0.7 }), mat('#3d6630', { r: 0.7 }), mat('#64904a', { r: 0.7 })];
  cyl(g, 0.012, 0.016, 0.9 * s, mat('#5b4632'), x, 0.38 * s, z, 8);
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.11 * s, 12, 10), leaf[i % 3]);
    const a = r() * Math.PI * 2, rad = (0.08 + r() * 0.2) * s;
    m.position.set(x + Math.cos(a) * rad, (0.6 + r() * 0.75) * s, z + Math.sin(a) * rad);
    m.scale.set(1.2, 0.35, 0.75); m.rotation.set(r() - 0.5, a, r() * 0.8 - 0.4);
    g.add(m);
  }
}

function picture(g, x, y, z, w, h, accent, seed, ry = 0) {
  const r = rng(seed);
  const art = tex(256, Math.round(256 * h / w), (c, cw, ch) => {
    c.fillStyle = '#f6f1e8'; c.fillRect(0, 0, cw, ch);
    for (let i = 0; i < 5; i++) {
      c.fillStyle = hexA(i % 2 ? accent : mix(accent, '#2b2b2b', 0.4), 0.25 + r() * 0.5);
      c.beginPath(); c.arc(r() * cw, r() * ch, 20 + r() * 60, 0, Math.PI * 2); c.fill();
    }
  });
  const grp = new THREE.Group();
  box(grp, w + 0.06, h + 0.06, 0.03, mat('#2e2a26', { r: 0.4 }), 0, -h / 2 - 0.03, 0);
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat(0xffffff, { map: art, r: 0.9 }));
  p.position.z = 0.016; grp.add(p);
  grp.position.set(x, y, z); grp.rotation.y = ry;
  g.add(grp);
}

function sofa(g, x, z, color, w = 2.1) {
  const fab = mat(color, { r: 0.95 });
  const fab2 = mat(mix(color, '#ffffff', 0.1), { r: 0.95 });
  box(g, w, 0.3, 0.88, fab, x, 0.1, z);
  box(g, w, 0.5, 0.2, fab, x, 0.4, z - 0.34);
  box(g, 0.18, 0.55, 0.88, fab, x - w / 2 + 0.09, 0.1, z);
  box(g, 0.18, 0.55, 0.88, fab, x + w / 2 - 0.09, 0.1, z);
  const cw = (w - 0.4) / 2;
  box(g, cw - 0.02, 0.14, 0.62, fab2, x - cw / 2, 0.4, z + 0.08);
  box(g, cw - 0.02, 0.14, 0.62, fab2, x + cw / 2, 0.4, z + 0.08);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 0.05, 0.1, 0.05, mat('#3a2a1e'), x + sx * (w / 2 - 0.1), 0, z + sz * 0.36);
}

function table(g, x, z, w, d, h, top, legs = '#3a2a1e') {
  box(g, w, 0.04, d, mat(top, { r: 0.45 }), x, h - 0.04, z);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 0.05, h - 0.04, 0.05, mat(legs, { r: 0.5 }), x + sx * (w / 2 - 0.06), 0, z + sz * (d / 2 - 0.06));
}

function chair(g, x, z, ry, color) {
  const grp = new THREE.Group();
  const m = mat(color, { r: 0.7 });
  box(grp, 0.44, 0.05, 0.44, m, 0, 0.45, 0);
  box(grp, 0.44, 0.45, 0.04, m, 0, 0.5, -0.2);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(grp, 0.035, 0.45, 0.035, mat('#2f2f2f', { r: 0.4, m: 0.5 }), sx * 0.19, 0, sz * 0.19);
  grp.position.set(x, 0, z); grp.rotation.y = ry; g.add(grp);
}

function teaGlass(g, x, y, z) {
  const pts = [[0, 0], [0.02, 0], [0.022, 0.006], [0.015, 0.03], [0.014, 0.05], [0.022, 0.085], [0.024, 0.095]].map(([a, b]) => new THREE.Vector2(a, b));
  const gl = new THREE.Mesh(new THREE.LatheGeometry(pts, 18), mat('#b04a1c', { r: 0.15, op: 0.88 }));
  gl.position.set(x, y + 0.01, z); g.add(gl);
  cyl(g, 0.045, 0.04, 0.01, mat('#f4f1ec', { r: 0.3 }), x, y, z, 24);
}

function lamp(g, x, z, h = 1.6) {
  cyl(g, 0.16, 0.18, 0.03, mat('#2e2e2e', { r: 0.4, m: 0.6 }), x, 0, z);
  cyl(g, 0.012, 0.012, h, mat('#2e2e2e', { r: 0.4, m: 0.6 }), x, 0.03, z, 8);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.3, 24, 1, true), new THREE.MeshStandardMaterial({ color: '#f6ead2', emissive: '#ffdca0', emissiveIntensity: 0.55, side: THREE.DoubleSide, roughness: 0.9 }));
  shade.position.set(x, h + 0.1, z); g.add(shade);
}

function pendant(g, x, y, z, color) {
  cyl(g, 0.004, 0.004, 3.2 - y, mat('#222'), x, y, z, 6);
  const sh = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.2, 24, 1, true), new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.5 }));
  sh.position.set(x, y, z); g.add(sh);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), new THREE.MeshBasicMaterial({ color: '#fff3d6' }));
  bulb.position.set(x, y - 0.08, z); g.add(bulb);
}

function rug(g, accent, w, d) {
  const t = tex(512, Math.round(512 * d / w), (c, cw, ch) => {
    c.fillStyle = mix(accent, '#f3ece0', 0.72); c.fillRect(0, 0, cw, ch);
    c.strokeStyle = mix(accent, '#3a2a1e', 0.25); c.lineWidth = 14; c.strokeRect(18, 18, cw - 36, ch - 36);
    c.strokeStyle = mix(accent, '#f3ece0', 0.35); c.lineWidth = 6; c.strokeRect(42, 42, cw - 84, ch - 84);
    c.fillStyle = mix(accent, '#3a2a1e', 0.15);
    for (let i = 0; i < 5; i++) {
      const cx = cw * (0.2 + i * 0.15), cy = ch / 2;
      c.beginPath(); c.moveTo(cx, cy - 34); c.lineTo(cx + 22, cy); c.lineTo(cx, cy + 34); c.lineTo(cx - 22, cy); c.closePath(); c.fill();
    }
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat(0xffffff, { map: t, r: 1 }));
  m.rotation.x = -Math.PI / 2; m.position.set(0, 0.0015, -0.1); m.receiveShadow = true;
  g.add(m);
}

function shoes(g, x, z) {
  const colors = ['#2b2b2b', '#7a4b2a', '#e9e6e0', '#3d4f6b'];
  colors.forEach((c, i) => {
    for (const s of [-1, 1]) {
      const sh = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.16, 4, 10), mat(c, { r: 0.6 }));
      sh.rotation.x = Math.PI / 2; sh.scale.set(1, 1, 0.75);
      sh.position.set(x + (i % 2) * 0.3 + s * 0.055, 0.035 + Math.floor(i / 2) * 0.32, z - i * 0.02);
      g.add(sh);
    }
  });
}

// ---------- sets -----------------------------------------------------------

function home(accent) {
  const g = new THREE.Group();
  const wall = '#f1e5d3';
  room(g, {
    floor: planks('#9b6a45', 11),
    back: wallTex(wall, R * 2, 3.2, (c, w, h) => { c.fillStyle = '#e4d3bb'; c.fillRect(0, h * 0.7, w, h * 0.3); c.fillStyle = '#d8c4a8'; c.fillRect(0, h * 0.7, w, 4); }),
    side: wallTex(wall, FRONT - D, 3.2),
  });
  rug(g, calm(accent, 0.35), 3.2, 2.2);
  sofa(g, 0.4, D + 0.5, calm(accent, 0.7));
  table(g, 0.4, D + 1.45, 1.1, 0.5, 0.4, '#6b4a33');
  [-0.05, 0.12, 0.3].forEach((dx, i) => teaGlass(g, 0.2 + dx * 1.4, 0.4, D + 1.4 + (i % 2) * 0.08));
  windowOn(g, garden(5), 1.1, 1.3, -2.3, 1.75, D + 0.02);
  box(g, 0.5, 2.3, 0.06, mat(mix(calm(accent, 0.4), '#ffffff', 0.45), { r: 1 }), -3.0, 0.5, D + 0.06);
  box(g, 0.5, 2.3, 0.06, mat(mix(calm(accent, 0.4), '#ffffff', 0.45), { r: 1 }), -1.6, 0.5, D + 0.06);
  picture(g, -0.05, 1.95, D + 0.02, 0.55, 0.7, accent, 3);
  picture(g, 0.85, 1.85, D + 0.02, 0.45, 0.45, accent, 7);
  lamp(g, 2.0, D + 0.4);
  plant(g, -3.15, D + 0.4, 1.1, '#c98b62');
  // A doorway on the right wall, with shoes left by it.
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.15), mat('#5a3e2b', { r: 0.6 }));
  door.rotation.y = -Math.PI / 2; door.position.set(R - 0.01, 1.075, -0.6); g.add(door);
  box(g, 0.06, 2.2, 1.12, mat('#efe6d8', { r: 0.6 }), R - 0.03, 0, -0.6);
  box(g, 0.32, 0.42, 0.9, mat('#7b5538', { r: 0.6 }), R - 0.2, 0, -2.0);
  shoes(g, R - 0.42, -2.25);
  return g;
}

function office(accent) {
  const g = new THREE.Group();
  room(g, {
    floor: planks('#c8a982', 21),
    back: wallTex('#eef0f1', R * 2, 3.2),
    side: wallTex('#e7eaec', FRONT - D, 3.2),
  });
  const city = skyline(9);
  windowOn(g, city, 1.5, 1.7, -1.6, 1.65, D + 0.02, 0, '#3a3f45');
  windowOn(g, city, 1.5, 1.7, 0.35, 1.65, D + 0.02, 0, '#3a3f45');
  table(g, -0.6, D + 1.05, 2.4, 0.95, 0.75, '#ece7df', '#3a3f45');
  [-1.4, -0.6, 0.2].forEach((x) => chair(g, x, D + 0.4, 0, '#3b4148'));
  // Screen on the right wall.
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.85), new THREE.MeshBasicMaterial({ color: mix(accent, '#1b2430', 0.75) }));
  screen.rotation.y = -Math.PI / 2; screen.position.set(R - 0.03, 1.55, -1.2); g.add(screen);
  box(g, 0.04, 0.95, 1.6, mat('#1f2328', { r: 0.4 }), R - 0.05, 1.07, -1.2);
  plant(g, 2.9, D + 0.4, 1.25);
  box(g, 0.6, 0.9, 0.45, mat('#e9e4dc', { r: 0.6 }), 2.0, 0, D + 0.25);
  return g;
}

function lobby(accent) {
  const g = new THREE.Group();
  room(g, {
    floor: tiles('#e7e2da', '#e7e2da', '#d3ccc1', 4, 31),
    back: wallTex('#efe9e1', R * 2, 3.2, (c, w, h) => {
      const x0 = w * 0.22, x1 = w * 0.78;
      for (let x = x0; x < x1; x += 22) { c.fillStyle = mix('#a77d55', '#6e4b2f', ((x / 22) % 3) / 6); c.fillRect(x, 0, 16, h); c.fillStyle = '#3f2a1a'; c.fillRect(x + 16, 0, 6, h); }
    }),
    side: wallTex('#ebe4da', FRONT - D, 3.2),
  });
  box(g, 2.6, 0.42, 0.5, mat(calm(accent, 0.75), { r: 0.95 }), 0, 0.06, D + 0.4);
  box(g, 2.6, 0.06, 0.5, mat('#3a2a1e', { r: 0.5 }), 0, 0, D + 0.4);
  plant(g, -2.95, D + 0.45, 1.3, '#f2efe9');
  plant(g, 2.95, D + 0.45, 1.3, '#f2efe9');
  // Reception desk along the right wall.
  box(g, 0.75, 1.05, 2.0, mat('#f4f1ec', { r: 0.4 }), R - 0.6, 0, -0.9);
  box(g, 0.85, 0.05, 2.1, mat('#5b3f2b', { r: 0.4 }), R - 0.6, 1.05, -0.9);
  box(g, 0.05, 0.3, 2.0, mat(calm(accent, 0.45), { r: 0.5 }), R - 0.99, 0.5, -0.9);
  [-1.6, 0, 1.6].forEach((x) => pendant(g, x, 2.6, D + 0.9, '#2f2f2f'));
  return g;
}

function street(accent) {
  const g = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 12), mat(0xffffff, { map: paving(41), r: 0.9 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 2); floor.receiveShadow = true; g.add(floor);
  const r = rng(43);
  const walls = ['#e8d5b5', '#d9a68a', '#cfd8dc', '#efe6d8', '#c9b79c'];
  const fronts = [[-4.2, 3.0], [-1.1, 3.2], [2.0, 3.0], [5.0, 3.0]];
  fronts.forEach(([x, w], i) => {
    const wall = walls[i % walls.length];
    const shop = i % 2 === 0 ? calm(accent, 0.4) : mix(accent, '#2f5d62', 0.7);
    const t = tex(512, 1024, (c, cw, ch) => {
      c.fillStyle = wall; c.fillRect(0, 0, cw, ch);
      for (let k = 0; k < 400; k++) { c.fillStyle = `rgba(0,0,0,${r() * 0.035})`; c.fillRect(r() * cw, r() * ch, 3, 3); }
      for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
        const wx = 50 + col * 150, wy = 70 + row * 180;
        c.fillStyle = '#f4efe6'; c.fillRect(wx - 8, wy - 8, 108, 146);
        c.fillStyle = mix('#5d7387', '#9fb6c8', r()); c.fillRect(wx, wy, 92, 130);
        c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(wx, wy, 92, 40);
        c.fillStyle = '#f4efe6'; c.fillRect(wx + 43, wy, 6, 130); c.fillRect(wx - 12, wy + 134, 116, 12);
      }
      c.fillStyle = mix(wall, '#3a2a1e', 0.2); c.fillRect(0, ch * 0.62, cw, 10);
      c.fillStyle = shop; c.fillRect(20, ch * 0.66, cw - 40, ch * 0.34);
      c.fillStyle = '#8fb0c4'; c.fillRect(44, ch * 0.7, cw * 0.55, ch * 0.28);
      c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(44, ch * 0.7, cw * 0.55, 40);
      c.fillStyle = '#3a2a1e'; c.fillRect(cw * 0.68, ch * 0.72, cw * 0.22, ch * 0.28);
      c.fillStyle = mix('#3a2a1e', '#ffffff', 0.15); c.fillRect(cw * 0.7, ch * 0.74, cw * 0.18, ch * 0.26);
    });
    box(g, w, 6.2, 0.4, [mat(wall), mat(wall), mat(wall), mat(wall), mat(0xffffff, { map: t, r: 0.95 }), mat(wall)], x, 0, D - 0.6);
    // Awning over the shop window.
    const aw = box(g, w * 0.62, 0.05, 0.75, mat(shop, { r: 0.8 }), x - w * 0.12, 2.55, D - 0.25);
    aw.rotation.x = 0.32;
  });
  box(g, 14, 0.12, 0.5, mat('#9a958e', { r: 0.9 }), 0, 0, D - 0.1);
  floorShade(g, 14, 0, D + 0.25, 0);
  // Building on the right, side on.
  const sideT = tex(512, 512, (c, cw, ch) => {
    c.fillStyle = '#e3d2bb'; c.fillRect(0, 0, cw, ch);
    for (let row = 0; row < 2; row++) for (let col = 0; col < 4; col++) { c.fillStyle = '#6f8597'; c.fillRect(30 + col * 120, 40 + row * 160, 70, 100); c.fillStyle = '#f4efe6'; c.fillRect(25 + col * 120, 145 + row * 160, 80, 8); }
  });
  const side = new THREE.Mesh(new THREE.PlaneGeometry(8, 6.2), mat(0xffffff, { map: sideT }));
  side.rotation.y = -Math.PI / 2; side.position.set(4.4, 3.1, 0.2); g.add(side);
  // Street furniture.
  const iron = mat('#2c3330', { r: 0.5, m: 0.4 });
  cyl(g, 0.05, 0.07, 3.4, iron, 3.5, 0, D + 0.15, 12);
  box(g, 0.5, 0.05, 0.05, iron, 3.35, 3.3, D + 0.15);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.22, 4), iron); head.position.set(3.15, 3.25, D + 0.15); head.rotation.y = Math.PI / 4; g.add(head);
  // Tree in a planter.
  box(g, 0.8, 0.45, 0.8, mat('#8c857c', { r: 0.9 }), -2.6, 0, D + 0.45);
  cyl(g, 0.06, 0.09, 2.0, mat('#5a4430'), -2.6, 0.45, D + 0.45, 10);
  const leaf = [mat('#5f8a45', { r: 0.8 }), mat('#4b7638', { r: 0.8 })];
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45 + r() * 0.2, 2), leaf[i % 2]);
    m.position.set(-2.6 + (r() - 0.5) * 1.0, 2.6 + r() * 0.8, D + 0.45 + (r() - 0.5) * 0.7); g.add(m);
  }
  // Bench.
  const wood = mat('#8a5b3a', { r: 0.7 });
  for (let k = 0; k < 3; k++) box(g, 1.5, 0.04, 0.1, wood, 0.6, 0.42, D + 0.35 + k * 0.13);
  box(g, 1.5, 0.3, 0.04, wood, 0.6, 0.5, D + 0.27);
  for (const sx of [-1, 1]) box(g, 0.06, 0.42, 0.42, iron, 0.6 + sx * 0.65, 0, D + 0.48);
  return g;
}

function shop(accent) {
  const g = new THREE.Group();
  room(g, {
    floor: tiles('#efeae2', '#d6cfc3', '#cbc3b6', 6, 51, true),
    back: wallTex('#f4efe7', R * 2, 3.2),
    side: wallTex('#efe9e0', FRONT - D, 3.2),
  });
  const r = rng(53);
  const palette = [calm(accent, 0.2), '#e9c46a', '#2a9d8f', '#e76f51', '#f4f1de', '#8ab17d', '#264653', '#f2a65a'];
  const wood = mat('#c9a77c', { r: 0.6 });
  [-1.75, -0.45, 0.85].forEach((x) => {
    box(g, 1.25, 2.1, 0.04, mat('#e8dfd1', { r: 0.8 }), x, 0, D + 0.04);
    for (const sx of [-1, 1]) box(g, 0.04, 2.1, 0.42, wood, x + sx * 0.6, 0, D + 0.25);
    for (let s = 0; s < 4; s++) {
      const y = 0.15 + s * 0.5;
      box(g, 1.2, 0.03, 0.42, wood, x, y, D + 0.25);
      let px = x - 0.55;
      while (px < x + 0.5) {
        const w = 0.07 + r() * 0.12, h = 0.12 + r() * 0.24;
        const m = mat(palette[Math.floor(r() * palette.length)], { r: 0.6 });
        if (r() > 0.7) cyl(g, w / 2, w / 2, h, m, px + w / 2, y + 0.03, D + 0.22, 14);
        else box(g, w, h, 0.18 + r() * 0.1, m, px + w / 2, y + 0.03, D + 0.25);
        px += w + 0.015;
      }
    }
  });
  // Counter with a till on the right.
  box(g, 0.7, 0.95, 2.0, mat(calm(accent, 0.7), { r: 0.6 }), R - 0.75, 0, -1.0);
  box(g, 0.78, 0.04, 2.08, mat('#d9d2c7', { r: 0.3 }), R - 0.75, 0.95, -1.0);
  box(g, 0.32, 0.18, 0.3, mat('#2c2c2c', { r: 0.4 }), R - 0.75, 0.99, -0.6);
  box(g, 0.26, 0.16, 0.03, mat('#9fc4d6', { r: 0.2 }), R - 0.75, 1.17, -0.62).rotation.x = -0.3;
  plant(g, 2.7, D + 0.45, 1.0);
  [-1.2, 0.6].forEach((x) => pendant(g, x, 2.65, D + 1.1, calm(accent, 0.3)));
  return g;
}

function cafe(accent) {
  const g = new THREE.Group();
  room(g, {
    floor: tiles('#c98d65', '#b97c56', '#9e6a4a', 8, 61),
    back: wallTex('#ead9c2', R * 2, 3.2, (c, w, h) => { c.fillStyle = '#d6bf9f'; c.fillRect(0, h * 0.68, w, h * 0.32); }),
    side: wallTex('#e6d4bc', FRONT - D, 3.2),
  });
  // Counter along the back with a coffee machine.
  box(g, 3.4, 1.0, 0.6, mat('#7a5a42', { r: 0.7 }), 0.3, 0, D + 0.32);
  box(g, 3.4, 0.08, 0.02, mat(calm(accent, 0.3), { r: 0.6 }), 0.3, 0.8, D + 0.63);
  box(g, 3.5, 0.05, 0.66, mat('#f1ece4', { r: 0.25 }), 0.3, 1.0, D + 0.32);
  box(g, 0.5, 0.42, 0.35, mat('#c9ccd0', { r: 0.25, m: 0.8 }), 1.3, 1.05, D + 0.25);
  for (let k = 0; k < 4; k++) cyl(g, 0.04, 0.035, 0.09, mat('#fbfaf7', { r: 0.3 }), -0.6 + k * 0.12, 1.05, D + 0.4, 14);
  // Chalk menu board.
  const board = tex(512, 320, (c, cw, ch) => {
    c.fillStyle = '#2d3330'; c.fillRect(0, 0, cw, ch);
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 3;
    for (let i = 0; i < 6; i++) { const y = 50 + i * 42; c.beginPath(); c.moveTo(40, y); c.lineTo(40 + 140 + (i * 37) % 120, y); c.stroke(); c.beginPath(); c.moveTo(cw - 90, y); c.lineTo(cw - 40, y); c.stroke(); }
  });
  box(g, 1.7, 1.06, 0.04, mat('#6b4a33', { r: 0.5 }), 0.3, 1.62, D + 0.02);
  const bm = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.96), mat(0xffffff, { map: board, r: 0.95 }));
  bm.position.set(0.3, 2.15, D + 0.045); g.add(bm);
  [-0.8, 0.3, 1.4].forEach((x) => pendant(g, x, 2.3, D + 0.6, calm(accent, 0.3)));
  // Small tables on both sides.
  for (const [x, z] of [[-2.7, -0.9], [2.75, -0.5]]) {
    cyl(g, 0.32, 0.32, 0.03, mat('#f1ece4', { r: 0.3 }), x, 0.72, z, 28);
    cyl(g, 0.03, 0.03, 0.72, mat('#2f2f2f', { r: 0.4, m: 0.6 }), x, 0, z, 10);
    cyl(g, 0.2, 0.2, 0.02, mat('#2f2f2f', { r: 0.4, m: 0.6 }), x, 0, z, 20);
    chair(g, x, z - 0.55, 0, '#6b4a33');
    teaGlass(g, x + 0.08, 0.75, z);
  }
  plant(g, -3.1, D + 0.4, 1.0, '#c98b62');
  return g;
}

function train(accent) {
  const g = new THREE.Group();
  const H = 2.45;
  const floorT = tex(256, 256, (c, w) => {
    const r = rng(71);
    c.fillStyle = '#8b9096'; c.fillRect(0, 0, w, w);
    for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},0.06)`; c.fillRect(r() * w, r() * w, 2, 2); }
  }, [8, 10]);
  room(g, {
    floor: floorT,
    height: H,
    back: wallTex('#e9ecef', R * 2, H, (c, w, h) => { c.fillStyle = '#d5dade'; c.fillRect(0, h * 0.62, w, h * 0.38); }),
    side: wallTex('#e4e8eb', FRONT - D, H),
    base: '#9aa1a8',
  });
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(R * 2, FRONT - D), mat('#f3f4f5', { r: 0.9 }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, H, (FRONT + D) / 2); g.add(ceil);
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(R * 2, 0.16), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
  strip.rotation.x = Math.PI / 2; strip.position.set(0, H - 0.01, -1.0); g.add(strip);
  // Yellow safety line and the long seat.
  const line = new THREE.Mesh(new THREE.PlaneGeometry(R * 2, 0.08), new THREE.MeshBasicMaterial({ color: '#f2c230' }));
  line.rotation.x = -Math.PI / 2; line.position.set(0, 0.004, D + 1.05); g.add(line);
  const seat = mat(mix(accent, '#3c5a8a', 0.78), { r: 0.95 });
  box(g, R * 2 - 0.4, 0.42, 0.5, mat('#b9c0c7', { r: 0.4, m: 0.4 }), 0, 0, D + 0.3);
  box(g, R * 2 - 0.4, 0.1, 0.5, seat, 0, 0.42, D + 0.3);
  box(g, R * 2 - 0.4, 0.5, 0.08, seat, 0, 0.52, D + 0.08);
  // Windows with the view sliding past.
  const view = motion(73);
  [-2.2, 0, 2.2].forEach((x) => windowOn(g, view, 1.6, 0.75, x, 1.62, D + 0.02, 0, '#b9c0c7'));
  // Ad strip above the windows.
  [-2.2, 0, 2.2].forEach((x, i) => box(g, 1.3, 0.22, 0.02, mat(i === 1 ? calm(accent, 0.3) : mix(calm(accent, 0.3), '#ffffff', 0.5), { r: 0.6 }), x, 2.12, D + 0.02));
  // Poles and hand straps.
  const chrome = mat('#d7dbe0', { r: 0.2, m: 0.9 });
  for (const x of [-1.9, 1.9]) cyl(g, 0.02, 0.02, H, chrome, x, 0, D + 0.75, 12);
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, R * 2, 8), chrome);
  rail.rotation.z = Math.PI / 2; rail.position.set(0, 2.15, D + 0.85); g.add(rail);
  for (let x = -3.0; x <= 3.0; x += 0.5) {
    box(g, 0.025, 0.2, 0.008, mat('#ffffff', { r: 0.6 }), x, 1.92, D + 0.85);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 20), mat('#f4f4f4', { r: 0.5 }));
    ring.position.set(x, 1.86, D + 0.85); g.add(ring);
  }
  // Doors on the right.
  const doorT = tex(256, 512, (c, w, h) => {
    c.fillStyle = '#c5ccd2'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#9fb7c6'; c.fillRect(30, 50, w / 2 - 45, h * 0.45); c.fillRect(w / 2 + 15, 50, w / 2 - 45, h * 0.45);
    c.fillStyle = '#6d757d'; c.fillRect(w / 2 - 3, 0, 6, h);
  });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.0), mat(0xffffff, { map: doorT, r: 0.4 }));
  door.rotation.y = -Math.PI / 2; door.position.set(R - 0.01, 1.0, -0.3); g.add(door);
  return g;
}

const BUILDERS = { home, office, lobby, street, shop, cafe, train };
const cache = new Map();

export function buildSet(name, accent) {
  const make = BUILDERS[name];
  if (!make) return null;
  const key = name + accent;
  if (!cache.has(key)) {
    if (cache.size > 4) cache.delete(cache.keys().next().value);
    cache.set(key, make(accent || '#58CC02'));
  }
  return cache.get(key);
}
