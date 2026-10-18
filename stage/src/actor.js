import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';

const UP = new THREE.Vector3(0, 1, 0);
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _q1 = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _q3 = new THREE.Quaternion();
const _m1 = new THREE.Matrix4();
const _m2 = new THREE.Matrix4();

export const FINGERS = ['0', '1', '2', '3', '4']; // thumb, index, middle, ring, pinky
const SEG = ['', '1', '2'];

function worldPos(o, out) { return o.getWorldPosition(out); }
function worldQuat(o, out) { return o.getWorldQuaternion(out); }

// Set a bone's world rotation, expressed through its local quaternion.
function setWorldQuat(bone, qWorld) {
  bone.parent.getWorldQuaternion(_q3).invert();
  bone.quaternion.copy(_q3.multiply(qWorld));
}

// Rotate a bone around a world-space axis.
function rotateWorld(bone, axis, angle) {
  if (!angle) return;
  worldQuat(bone, _q1);
  _q2.setFromAxisAngle(axis, angle);
  setWorldQuat(bone, _q2.multiply(_q1));
  bone.updateMatrixWorld(true);
}

function basis(f, n, out) {
  const b = _v3.crossVectors(f, n).normalize();
  return out.makeBasis(f, n, b);
}

export class Actor {
  constructor(gltf, { id, avatar, gender }) {
    this.id = id;
    this.avatar = avatar;
    this.gender = gender || 'm';
    this.root = new THREE.Group();
    this.model = cloneSkinned(gltf.scene);
    this.root.add(this.model);

    this.model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = false;
        o.frustumCulled = false;
        const m = o.material;
        if (m) {
          m.envMapIntensity = 0.75;
          if (m.name === 'opacity') { m.alphaToCoverage = true; m.alphaTest = 0.35; }
          if (m.name === 'head') { m.roughness = 1; }
        }
      }
    });

    this.bones = {};
    this.model.traverse((o) => { if (o.isBone || /^Bip01/.test(o.name)) this.bones[o.name] = o; });
    this.b = (n) => this.bones['Bip01_' + n.replace(/ /g, '_')] || this.bones['Bip01 ' + n];

    this.mixer = new THREE.AnimationMixer(this.model);
    this.clips = {};
    this.current = null;
    this.bind = new Map();
    for (const k in this.bones) this.bind.set(this.bones[k], this.bones[k].quaternion.clone());
    this.hip = this.bones['Bip01'];
    this.hipRest = this.hip ? this.hip.position.clone() : new THREE.Vector3();

    this._faceForwardZ();
    this._measure();
    this.pose = this._emptyPose();
    this.blink = { next: 1 + Math.random() * 3, t: -1 };
  }

  // Rotate the model inside its root so that it faces +Z.
  _faceForwardZ() {
    this.model.updateMatrixWorld(true);
    const foot = worldPos(this.b('L Foot'), new THREE.Vector3());
    const toe = worldPos(this.b('L Toe0'), new THREE.Vector3());
    const fwd = toe.sub(foot).setY(0).normalize();
    const yaw = Math.atan2(fwd.x, fwd.z);
    this.model.rotation.y = -yaw;
    this.model.updateMatrixWorld(true);
  }

  _measure() {
    this.root.updateMatrixWorld(true);
    const m = {};
    for (const s of ['L', 'R']) {
      const up = this.b(s + ' UpperArm'), fo = this.b(s + ' Forearm'), ha = this.b(s + ' Hand');
      const S = worldPos(up, new THREE.Vector3()), E = worldPos(fo, new THREE.Vector3()), W = worldPos(ha, new THREE.Vector3());
      const mid = worldPos(this.b(s + ' Finger2'), new THREE.Vector3());
      const idx = worldPos(this.b(s + ' Finger1'), new THREE.Vector3());
      const pin = worldPos(this.b(s + ' Finger4'), new THREE.Vector3());
      const f = mid.clone().sub(W).normalize();
      const lat = idx.clone().sub(pin).normalize();
      const n = (s === 'R' ? new THREE.Vector3().crossVectors(lat, f) : new THREE.Vector3().crossVectors(f, lat)).normalize();
      lat.crossVectors(n, f).normalize().multiplyScalar(s === 'R' ? 1 : -1); // thumb-side lateral, orthonormal
      const hq = worldQuat(ha, new THREE.Quaternion()).invert();
      const fingers = {};
      for (const k of FINGERS) {
        const segs = [];
        for (const sg of SEG) {
          const bone = this.b(s + ' Finger' + k + sg);
          if (!bone) continue;
          const bq = worldQuat(bone, new THREE.Quaternion()).invert();
          const curlAxisW = k === '0'
            ? new THREE.Vector3().crossVectors(lat, n).normalize()
            : new THREE.Vector3().crossVectors(f, n).normalize();
          const spreadAxisW = n.clone();
          segs.push({ bone, curl: curlAxisW.applyQuaternion(bq).normalize(), spread: spreadAxisW.applyQuaternion(bq).normalize() });
        }
        fingers[k] = segs;
      }
      m[s] = {
        up, fo, ha, a: S.distanceTo(E), b: E.distanceTo(W),
        fLocal: f.clone().applyQuaternion(hq).normalize(),
        nLocal: n.clone().applyQuaternion(hq).normalize(),
        palm: mid.distanceTo(W),
        fingers,
      };
    }
    const head = this.b('Head');
    const hq = worldQuat(head, new THREE.Quaternion()).invert();
    m.headFwd = new THREE.Vector3(0, 0, 1).applyQuaternion(hq).normalize();
    m.height = worldPos(head, new THREE.Vector3()).y + 0.1;
    m.shoulderY = worldPos(this.b('R UpperArm'), new THREE.Vector3()).y;
    m.hipY = this.hipRest.y;
    this.m = m;
  }

  _emptyPose() {
    return {
      bend: 0, side: 0, twist: 0,
      neck: 0, headPitch: 0, headYaw: 0, headRoll: 0,
      look: null, lookW: 0,
      arms: { L: null, R: null },
      fingers: { L: null, R: null },
      smile: 0,
    };
  }

  // ----- clips -------------------------------------------------------------

  addClip(name, data) {
    if (this.clips[name]) return this.clips[name];
    const tracks = [];
    const n = data.frames, fps = data.fps;
    const times = new Float32Array(n);
    for (let i = 0; i < n; i++) times[i] = i / fps;
    for (const bone in data.bones) {
      if (!this.bones[bone]) continue;
      const raw = data.bones[bone];
      const count = raw.length / 4;
      const vals = new Float32Array(raw.length);
      for (let i = 0; i < raw.length; i++) vals[i] = raw[i] / 32767;
      const t = count === 1 ? new Float32Array([0]) : times.subarray(0, count);
      tracks.push(new THREE.QuaternionKeyframeTrack(bone + '.quaternion', t, vals));
    }
    if (data.root && this.hip) {
      const d = data.root, vals = new Float32Array(d.length);
      for (let i = 0; i < d.length; i += 3) {
        vals[i] = this.hipRest.x + d[i];
        vals[i + 1] = this.hipRest.y + d[i + 1];
        vals[i + 2] = this.hipRest.z + d[i + 2];
      }
      tracks.push(new THREE.VectorKeyframeTrack(this.hip.name + '.position', times.subarray(0, d.length / 3), vals));
    }
    const clip = new THREE.AnimationClip(name, n / fps, tracks);
    this.clips[name] = clip;
    return clip;
  }

  play(name, { fade = 0.45, once = false, then = null, speed = 1 } = {}) {
    const clip = this.clips[name];
    if (!clip) return;
    const action = this.mixer.clipAction(clip);
    if (this.current === action && !once) return;
    action.reset();
    action.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = true;
    action.timeScale = speed;
    action.enabled = true;
    action.setEffectiveWeight(1);
    if (this.current && this.current !== action) action.crossFadeFrom(this.current, fade, false);
    else action.fadeIn(fade);
    action.play();
    this.current = action;
    this.onceThen = once ? { action, then, fade } : null;
  }

  // ----- per frame ---------------------------------------------------------

  update(dt, scene) {
    // The mixer only writes values that changed, so undo last frame's procedural
    // layer first or it would stack on itself.
    if (this._saved) {
      for (const [bone, q] of this._saved) bone.quaternion.copy(q);
      if (this.hip) this.hip.position.copy(this._savedHip);
    }
    this.mixer.update(dt);
    if (!this._saved) { this._saved = new Map(); this._savedHip = new THREE.Vector3(); }
    for (const k in this.bones) {
      const bone = this.bones[k];
      let q = this._saved.get(bone);
      if (!q) { q = new THREE.Quaternion(); this._saved.set(bone, q); }
      q.copy(bone.quaternion);
    }
    if (this.hip) this._savedHip.copy(this.hip.position);
    if (this.onceThen) {
      const { action, then, fade } = this.onceThen;
      if (then && action.time >= action.getClip().duration - fade - 0.05) {
        this.onceThen = null;
        this.play(then, { fade });
      }
    }
    this.root.updateMatrixWorld(true);
    this._applyPose(this.pose, dt);
    this.pose = this._emptyPose();
  }

  forward(out) { return out.set(0, 0, 1).applyQuaternion(this.root.quaternion); }
  right(out) { return out.set(-1, 0, 0).applyQuaternion(this.root.quaternion); }
  // A point in the actor's local frame (x right, y up, z forward) as world.
  local(x, y, z, out) {
    const f = this.forward(_v1), r = this.right(_v2);
    return out.copy(this.root.position).addScaledVector(r, x).addScaledVector(f, z).add(_v3.set(0, y, 0));
  }
  headPos(out) { return worldPos(this.b('Head'), out).add(_v1.set(0, 0.07, 0)); }
  chest(out) { return worldPos(this.b('Spine2'), out); }

  _applyPose(p, dt) {
    const fwd = this.forward(new THREE.Vector3());
    const bendAxis = new THREE.Vector3().crossVectors(UP, fwd).normalize();

    // Torso: bow from the hips, keep legs planted.
    if (p.bend || p.side || p.twist) {
      const spine = this.b('Spine'), s1 = this.b('Spine1'), s2 = this.b('Spine2');
      const thighs = [this.b('L Thigh'), this.b('R Thigh')];
      const tq = thighs.map((t) => worldQuat(t, new THREE.Quaternion()));
      rotateWorld(spine, bendAxis, p.bend * 0.55);
      if (p.side) rotateWorld(spine, fwd, p.side * 0.4);
      thighs.forEach((t, i) => { setWorldQuat(t, tq[i]); t.updateMatrixWorld(true); });
      rotateWorld(s1, bendAxis, p.bend * 0.25);
      rotateWorld(s2, bendAxis, p.bend * 0.2);
      if (p.side) rotateWorld(s1, fwd, p.side * 0.6);
      if (p.twist) { rotateWorld(s1, UP, p.twist * 0.5); rotateWorld(s2, UP, p.twist * 0.5); }
    }

    // Head and neck.
    const neck = this.b('Neck'), head = this.b('Head');
    if (p.look && p.lookW > 0) this._lookAt(p.look, p.lookW);
    if (p.neck) rotateWorld(neck, bendAxis, p.neck);
    if (p.headPitch) rotateWorld(head, bendAxis, p.headPitch);
    if (p.headYaw) rotateWorld(head, UP, p.headYaw);
    if (p.headRoll) rotateWorld(head, fwd, p.headRoll);

    for (const s of ['L', 'R']) {
      const arm = p.arms[s];
      if (arm && arm.w > 0) this._solveArm(s, arm);
      const fp = p.fingers[s];
      if (fp && fp.w > 0) this._fingers(s, fp);
    }

    this._face(p, dt);
  }

  _lookAt(target, w) {
    const head = this.b('Head'), neck = this.b('Neck');
    const hp = worldPos(head, _v1);
    const want = _v2.copy(target).sub(hp).normalize();
    const cur = this.m.headFwd.clone().applyQuaternion(worldQuat(head, _q1)).normalize();
    // Limit how far the head turns.
    const ang = cur.angleTo(want);
    const max = 1.0;
    const k = ang > max ? max / ang : 1;
    const q = new THREE.Quaternion().setFromUnitVectors(cur, want);
    const full = new THREE.Quaternion().slerp(q, k * w);
    const part = new THREE.Quaternion().slerp(full, 0.4);
    worldQuat(neck, _q2); setWorldQuat(neck, part.clone().multiply(_q2)); neck.updateMatrixWorld(true);
    const rest = new THREE.Quaternion().slerp(full, 0.6);
    worldQuat(head, _q2); setWorldQuat(head, rest.multiply(_q2)); head.updateMatrixWorld(true);
  }

  // Two-bone IK in world space, then blend with the animated pose.
  _solveArm(s, arm) {
    const m = this.m[s];
    const { up, fo, ha } = m;
    const animUp = up.quaternion.clone(), animFo = fo.quaternion.clone(), animHa = ha.quaternion.clone();
    if (arm.target) {
      const S = worldPos(up, new THREE.Vector3());
      const E = worldPos(fo, new THREE.Vector3());
      const W = worldPos(ha, new THREE.Vector3());
      const T = arm.target.clone();
      const a = m.a, b = m.b;
      let d = T.distanceTo(S);
      const dir = T.clone().sub(S).normalize();
      d = Math.min(Math.max(d, Math.abs(a - b) + 0.01), a + b - 0.002);
      const x = (a * a - b * b + d * d) / (2 * d);
      const h = Math.sqrt(Math.max(a * a - x * x, 0));
      const pole = (arm.pole || new THREE.Vector3(0, -1, 0)).clone();
      const perp = pole.sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
      const Et = S.clone().addScaledVector(dir, x).addScaledVector(perp, h);
      const Tt = S.clone().addScaledVector(dir, d);

      // Upper arm: swing to the new elbow, then twist so the bend plane matches.
      const uCur = E.clone().sub(S).normalize();
      const uTgt = Et.clone().sub(S).normalize();
      const q1 = new THREE.Quaternion().setFromUnitVectors(uCur, uTgt);
      const w1 = W.clone().sub(E).normalize().applyQuaternion(q1);
      const wT = Tt.clone().sub(Et).normalize();
      const p1 = w1.clone().sub(uTgt.clone().multiplyScalar(w1.dot(uTgt)));
      const p2 = wT.clone().sub(uTgt.clone().multiplyScalar(wT.dot(uTgt)));
      let qt = new THREE.Quaternion();
      if (p1.lengthSq() > 1e-6 && p2.lengthSq() > 1e-6) {
        p1.normalize(); p2.normalize();
        qt.setFromUnitVectors(p1, p2);
      }
      const upW = worldQuat(up, new THREE.Quaternion());
      setWorldQuat(up, qt.multiply(q1).multiply(upW));
      up.updateMatrixWorld(true);

      // Forearm: hinge to reach the target.
      const E2 = worldPos(fo, new THREE.Vector3());
      const W2 = worldPos(ha, new THREE.Vector3());
      const q2 = new THREE.Quaternion().setFromUnitVectors(W2.sub(E2).normalize(), Tt.clone().sub(E2).normalize());
      const foW = worldQuat(fo, new THREE.Quaternion());
      setWorldQuat(fo, q2.multiply(foW));
      fo.updateMatrixWorld(true);
    }
    if (arm.F && arm.N) this._orientHand(s, arm.F, arm.N);

    // Blend IK result with animation.
    const w = arm.w;
    if (w < 1) {
      up.quaternion.copy(animUp.slerp(up.quaternion, w));
      fo.quaternion.copy(animFo.slerp(fo.quaternion, w));
      ha.quaternion.copy(animHa.slerp(ha.quaternion, arm.hw != null ? arm.hw * w : w));
    }
    up.updateMatrixWorld(true);
  }

  _orientHand(s, F, N) {
    const m = this.m[s];
    const hq = worldQuat(m.ha, new THREE.Quaternion());
    const f = m.fLocal.clone().applyQuaternion(hq);
    const n = m.nLocal.clone().applyQuaternion(hq);
    n.sub(f.clone().multiplyScalar(n.dot(f))).normalize();
    const Ft = F.clone().normalize();
    const Nt = N.clone().sub(Ft.clone().multiplyScalar(N.dot(Ft))).normalize();
    basis(f, n, _m1);
    basis(Ft, Nt, _m2);
    const R = new THREE.Quaternion().setFromRotationMatrix(_m2.multiply(_m1.transpose()));
    setWorldQuat(m.ha, R.multiply(hq));
    m.ha.updateMatrixWorld(true);
  }

  // curls: [thumb, index, middle, ring, pinky] in 0..1 (1 = closed); spread optional.
  _fingers(s, fp) {
    const fingers = this.m[s].fingers;
    const max = [0.9, 1.45, 1.55, 1.55, 1.5];
    FINGERS.forEach((k, i) => {
      const c = fp.curls[i];
      if (c == null) return;
      const segs = fingers[k];
      segs.forEach((sg, j) => {
        const bindQ = this.bind.get(sg.bone);
        let ang = c * max[i] * (k === '0' ? [0.55, 0.6, 0.7][j] : [0.85, 1.05, 0.75][j]);
        const target = bindQ.clone().multiply(_q1.setFromAxisAngle(sg.curl, ang));
        if (k === '0' && j === 0 && fp.thumbOut != null) target.multiply(_q2.setFromAxisAngle(sg.spread, fp.thumbOut));
        sg.bone.quaternion.slerp(target, fp.w);
      });
    });
    this.m[s].ha.updateMatrixWorld(true);
  }

  _face(p, dt) {
    // Blink every few seconds.
    const bl = this.blink;
    bl.next -= dt;
    if (bl.next <= 0 && bl.t < 0) { bl.t = 0; bl.next = 2 + Math.random() * 3.5; }
    let close = 0;
    if (bl.t >= 0) {
      bl.t += dt;
      close = bl.t < 0.07 ? bl.t / 0.07 : Math.max(0, 1 - (bl.t - 0.07) / 0.1);
      if (bl.t > 0.17) bl.t = -1;
    }
    for (const s of ['R', 'L']) {
      const top = this.b(s + 'EyeBlinkTop');
      const bot = this.b(s + 'EyeBlinkBottom');
      if (top) { const q = this.bind.get(top); top.quaternion.copy(q).multiply(_q1.setFromAxisAngle(_v1.set(0, 0, 1), -close * 0.5)); }
      if (bot) { const q = this.bind.get(bot); bot.quaternion.copy(q).multiply(_q1.setFromAxisAngle(_v1.set(0, 0, 1), close * 0.12)); }
    }
  }
}
