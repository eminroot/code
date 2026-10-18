import * as THREE from 'three';

const UP = new THREE.Vector3(0, 1, 0);
const DEG = Math.PI / 180;

export function smooth(x) { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); }
export function env(u, dur, a = 0.5, b = 0.5) { return Math.min(smooth(u / a), smooth((dur - u) / b)); }
const v = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

// Shared frame for an actor: forward, right, left, up, and the direction to the partner.
function frame(a, o) {
  const f = a.forward(v()), r = a.right(v());
  const toO = o ? o.root.position.clone().sub(a.root.position).setY(0).normalize() : f.clone();
  return { f, r, l: r.clone().negate(), toO };
}

function relaxed(curl = 0.25) { return [0.15, curl, curl + 0.05, curl + 0.1, curl + 0.15]; }

// Palms together in front of the chest (namaste, wai).
function palmsTogether(a, pose, w, height, fwd) {
  const { f, r } = frame(a);
  const chest = a.chest(v());
  const C = chest.clone().addScaledVector(f, fwd).add(v(0, height, 0));
  const tilt = f.clone().multiplyScalar(0.18).add(UP).normalize();
  for (const s of ['R', 'L']) {
    const side = s === 'R' ? 1 : -1;
    const palm = a.m[s].palm;
    const N = r.clone().multiplyScalar(-side);
    const target = C.clone().addScaledVector(tilt, -palm * 0.95).addScaledVector(r, side * 0.013);
    const pole = r.clone().multiplyScalar(side).add(v(0, -0.9, 0)).addScaledVector(f, -0.3).normalize();
    pose.arms[s] = { target, pole, F: tilt, N, w };
    pose.fingers[s] = { curls: [0.05, 0, 0, 0, 0.02], thumbOut: -0.15, w };
  }
}

export const GESTURES = {
  // Bow from the waist. p.deg sets depth, p.hands 'front' clasps hands.
  bow({ a, u, dur, p, pose }) {
    const deg = (p.deg ?? 30) * DEG;
    const e = env(u, dur, p.down ?? 0.8, p.up ?? 0.9);
    pose.bend = deg * e;
    pose.neck = deg * 0.18 * e;
    pose.lookW *= 1 - e;
    if (p.hands === 'front') GESTURES.clasp({ a, u, dur, p: {}, pose, w: e });
  },

  // Hands clasped low in front, a polite standing posture.
  clasp({ a, u, dur, pose, w }) {
    const e = w ?? env(u, dur, 0.6, 0.6);
    const { f, r } = frame(a);
    const hipY = a.root.position.y + a.m.hipY;
    const C = a.root.position.clone().setY(hipY - 0.1).addScaledVector(f, 0.15);
    pose.arms.R = { target: C.clone().addScaledVector(r, 0.03), pole: r.clone().add(v(0, -0.6, 0)).normalize(), F: r.clone().negate().add(v(0, -0.6, 0)).normalize(), N: f.clone().negate(), w: e };
    pose.arms.L = { target: C.clone().addScaledVector(r, -0.04).addScaledVector(f, 0.025), pole: r.clone().negate().add(v(0, -0.6, 0)).normalize(), F: r.clone().add(v(0, -0.6, 0)).normalize(), N: f.clone().negate(), w: e };
    pose.fingers.R = { curls: relaxed(0.35), w: e };
    pose.fingers.L = { curls: relaxed(0.2), w: e };
  },

  handshake({ a, o, u, dur, p, pose }) {
    const e = env(u, dur, 0.75, 0.7);
    const { f, r, toO } = frame(a, o);
    const meetY = Math.min(a.m.hipY + a.root.position.y, o.m.hipY + o.root.position.y) + 0.1;
    const M = a.root.position.clone().lerp(o.root.position, 0.5).setY(meetY);
    const hold = smooth((u - 0.7) / 0.25) * smooth((dur - 0.7 - u) / 0.2);
    M.y += Math.sin((u - 0.7) * Math.PI * 2 * (p.pump ?? 2.2)) * 0.022 * hold;
    const F = toO.clone().add(v(0, -0.28, 0)).normalize();
    const N = r.clone().negate();
    const palm = a.m.R.palm;
    const target = M.clone().addScaledVector(r, 0.03).addScaledVector(F, -palm * 0.42);
    const pole = r.clone().multiplyScalar(0.5).add(v(0, -1, 0)).addScaledVector(f, -0.25).normalize();
    pose.arms.R = { target, pole, F, N, w: e };
    pose.fingers.R = p.limp ? { curls: [0.1, 0.15, 0.18, 0.2, 0.22], w: e } : { curls: [0.25, 0.45, 0.5, 0.55, 0.6], w: e * hold * 0.9 + e * 0.1 };
    pose.bend = (p.lean ?? 0.07) * e;
    if (p.support) {
      // Korean style: the left hand supports the right forearm.
      const mid = target.clone().addScaledVector(toO, -0.11).add(v(0, -0.045, 0)).addScaledVector(r, -0.01);
      pose.arms.L = { target: mid.addScaledVector(r, -0.05).addScaledVector(toO, -a.m.L.palm * 0.5), pole: r.clone().multiplyScalar(-0.7).add(v(0, -1, 0)).normalize(), F: r.clone().addScaledVector(f, 0.4).normalize(), N: v(0, 1, 0), w: e };
      pose.fingers.L = { curls: relaxed(0.35), w: e };
    }
    if (p.twoHanded) {
      const Lt = M.clone().addScaledVector(r, 0.02).add(v(0, 0.06, 0)).addScaledVector(F, -0.02);
      pose.arms.L = { target: Lt.addScaledVector(F, -a.m.L.palm * 0.6), pole: r.clone().multiplyScalar(-0.6).add(v(0, -1, 0)).normalize(), F: F.clone().add(r.clone().multiplyScalar(0.6)).normalize(), N: v(0, -1, 0), w: e * hold };
      pose.fingers.L = { curls: relaxed(0.3), w: e * hold };
    }
    pose.smile = e;
  },

  // La bise. p.count kisses, starting on the right cheek.
  cheekKiss({ a, o, u, dur, p, pose }) {
    const count = p.count ?? 2;
    const e = env(u, dur, 0.5, 0.5);
    const seg = (dur - 0.6) / count;
    const k = Math.min(count - 1, Math.max(0, Math.floor((u - 0.3) / seg)));
    const local = (u - 0.3 - k * seg) / seg;
    const start = p.first === 'left' ? -1 : 1;
    const dirSign = (k % 2 === 0 ? 1 : -1) * start; // 1: head to own left, right cheeks meet
    const pulse = Math.sin(Math.min(1, Math.max(0, local)) * Math.PI);
    const inPhase = e;
    pose.bend = (0.17 + 0.15 * pulse) * inPhase;
    pose.side = -0.2 * dirSign * inPhase * (0.3 + 0.7 * pulse);
    pose.headYaw = 0.6 * dirSign * inPhase * (0.3 + 0.7 * pulse);
    pose.headRoll = 0.14 * dirSign * inPhase * pulse;
    pose.lookW = 0.2 * (1 - pulse);
    // Right hand rests lightly on the partner's upper arm.
    const { f, r } = frame(a, o);
    if (p.touch) {
      const arm = o.b('R UpperArm').getWorldPosition(v()).add(v(0, -0.1, 0));
      pose.arms.L = { target: arm.addScaledVector(f, -a.m.L.palm * 0.9), pole: r.clone().negate().add(v(0, -1.2, 0)).normalize(), F: f.clone().add(v(0, -0.3, 0)).normalize(), N: r.clone().add(f.clone().multiplyScalar(0.3)).normalize(), w: e * 0.7 };
      pose.fingers.L = { curls: relaxed(0.2), w: e };
    }
    pose.smile = e;
  },

  handOnHeart({ a, u, dur, p, pose }) {
    const e = env(u, dur, 0.7, 0.7);
    const { f, r, l } = frame(a);
    const chest = a.chest(v());
    const palm = a.m.R.palm;
    const F = l.clone().multiplyScalar(0.75).add(v(0, 0.45, 0)).normalize();
    const C = chest.clone().addScaledVector(l, 0.085).addScaledVector(f, 0.13).add(v(0, 0.02, 0));
    const target = C.addScaledVector(F, -palm * 0.85);
    pose.arms.R = { target, pole: r.clone().add(v(0, -1.2, 0)).addScaledVector(f, -0.2).normalize(), F, N: f.clone().negate(), w: e };
    pose.fingers.R = { curls: [0.1, 0.05, 0.05, 0.08, 0.1], w: e };
    const nod = p.bow === false ? 0 : smooth((u - 0.6) / 0.4) * smooth((dur - 0.7 - u) / 0.4);
    pose.neck = 0.22 * nod;
    pose.bend = 0.07 * nod;
    pose.smile = e;
  },

  namaste({ a, u, dur, p, pose }) {
    const e = env(u, dur, 0.7, 0.7);
    palmsTogether(a, pose, e, p.high ? 0.12 : -0.02, 0.17);
    const b = smooth((u - 0.7) / 0.45) * smooth((dur - 0.8 - u) / 0.4);
    pose.bend = (p.bendDeg ?? 8) * DEG * b;
    pose.neck = (p.neckDeg ?? 14) * DEG * b;
    pose.lookW *= 1 - b * 0.6;
    pose.smile = e;
  },

  // Thai wai: palms high, head bows to meet the thumbs. p.level 1..3.
  wai({ a, u, dur, p, pose }) {
    const lvl = p.level ?? 2;
    const e = env(u, dur, 0.7, 0.75);
    palmsTogether(a, pose, e, [-0.02, 0.05, 0.11][lvl - 1], 0.16);
    const b = smooth((u - 0.7) / 0.45) * smooth((dur - 0.85 - u) / 0.4);
    pose.bend = [8, 12, 18][lvl - 1] * DEG * b;
    pose.neck = [10, 16, 22][lvl - 1] * DEG * b;
    pose.lookW *= 1 - b;
    pose.smile = e;
  },

  // Small bow of the head only.
  nod({ u, dur, p, pose }) {
    const times = p.times ?? 1;
    const e = env(u, dur, 0.3, 0.3);
    const ph = Math.sin(Math.min(1, u / dur) * Math.PI * times);
    pose.neck = (p.deg ?? 14) * DEG * Math.abs(ph) * e;
    pose.headPitch = (p.deg ?? 14) * 0.5 * DEG * Math.abs(ph) * e;
  },

  // Indian head wobble.
  wobble({ u, dur, pose }) {
    const e = env(u, dur, 0.3, 0.3);
    pose.headRoll = Math.sin(u * Math.PI * 2 * 1.7) * 0.17 * e;
    pose.smile = e;
  },

  // Hold an item out with both hands (business card or gift). p.item 'card' | 'gift'.
  offer({ a, o, u, dur, p, pose }) {
    const e = env(u, dur, p.in ?? 0.8, p.out ?? 0.7);
    const { f, r, toO } = frame(a, o);
    const gift = p.item === 'gift';
    let reach = p.reach ?? (gift ? 0.4 : 0.42);
    if (p.retract != null) reach -= smooth((u - p.retract) / 0.6) * (gift ? 0.16 : 0.2);
    const chest = a.chest(v());
    const C = chest.clone().addScaledVector(toO, reach).add(v(0, gift ? -0.24 : -0.1 - (p.retract != null ? smooth((u - p.retract) / 0.6) * 0.05 : 0), 0));
    const half = gift ? 0.075 : 0.05;
    for (const s of ['R', 'L']) {
      const side = s === 'R' ? 1 : -1;
      const palm = a.m[s].palm;
      const medial = r.clone().multiplyScalar(-side);
      let F, N, target;
      if (gift) {
        // Palms up under the box.
        N = v(0, 1, 0).addScaledVector(medial, 0.4).normalize();
        F = toO.clone().addScaledVector(medial, 0.25).normalize();
        target = C.clone().addScaledVector(r, side * half).add(v(0, -0.065, 0)).addScaledVector(F, -palm * 0.6);
      } else {
        // Card held at its corners between thumb and fingers.
        F = toO.clone().addScaledVector(medial, 0.55).add(v(0, 0.15, 0)).normalize();
        N = toO.clone().multiplyScalar(0.5).addScaledVector(medial, 0.6).add(v(0, -0.6, 0)).normalize();
        target = C.clone().addScaledVector(r, side * (half + 0.035)).addScaledVector(F, -palm * 1.05).add(v(0, -0.01, 0));
      }
      const pole = r.clone().multiplyScalar(side * 0.6).add(v(0, -1, 0)).addScaledVector(f, -0.3).normalize();
      pose.arms[s] = { target, pole, F, N, w: e };
      pose.fingers[s] = { curls: gift ? relaxed(0.12) : [0.3, 0.35, 0.45, 0.55, 0.6], w: e };
    }
    pose.bend = (p.bendDeg ?? 12) * DEG * e;
    pose.neck = (p.neckDeg ?? 10) * DEG * e;
    if (p.lookAtItem) pose.lookW *= 0.3;
    pose.smile = e * 0.8;
    pose.hold = { C, e, facing: p.facing };
  },

  // Pass something with one hand. p.hand 'L' | 'R'.
  giveOne({ a, o, u, dur, p, pose }) {
    const e = env(u, dur, 0.7, 0.6);
    const s = p.hand ?? 'R';
    const side = s === 'R' ? 1 : -1;
    const { f, r, toO } = frame(a, o);
    const chest = a.chest(v());
    const C = chest.clone().addScaledVector(toO, 0.4).addScaledVector(r, side * 0.1).add(v(0, -0.2, 0));
    const medial = r.clone().multiplyScalar(-side);
    const F = toO.clone().addScaledVector(medial, 0.3).normalize();
    const N = v(0, 1, 0);
    pose.arms[s] = { target: C.clone().addScaledVector(F, -a.m[s].palm * 0.55), pole: r.clone().multiplyScalar(side * 0.4).add(v(0, -1, 0)).normalize(), F, N, w: e };
    pose.fingers[s] = { curls: relaxed(0.18), w: e };
    pose.bend = 0.05 * e;
    pose.hold = { C: p.item === 'gift' ? C.clone().add(v(0, 0.07, 0)) : C.clone().add(v(0, 0.02, 0)), e, hand: s, facing: 'out' };
  },

  // Index finger pointing at the partner.
  pointFinger({ a, o, u, dur, pose }) {
    const e = env(u, dur, 0.45, 0.5);
    const { r } = frame(a, o);
    const S = a.b('R UpperArm').getWorldPosition(v());
    const aim = o ? o.headPos(v()).add(v(0, -0.15, 0)) : a.local(0.2, 1.4, 1, v());
    const dir = aim.sub(S).normalize();
    const jab = Math.max(0, Math.sin((u - 0.5) * Math.PI * 2 * 2.4)) * 0.03 * smooth((u - 0.45) / 0.2);
    const reach = (a.m.R.a + a.m.R.b) * 0.86 + jab;
    pose.arms.R = { target: S.clone().addScaledVector(dir, reach - a.m.R.palm * 0.3), pole: r.clone().add(v(0, -1, 0)).normalize(), F: dir, N: v(0, -1, 0), w: e };
    pose.fingers.R = { curls: [0.55, 0, 1, 1, 1], w: e };
  },

  // Open palm, the polite way to indicate something or someone.
  openHand({ a, o, u, dur, pose }) {
    const e = env(u, dur, 0.55, 0.55);
    const { r } = frame(a, o);
    const S = a.b('R UpperArm').getWorldPosition(v());
    const aim = o ? o.chest(v()).add(v(0, -0.2, 0)) : a.local(0.3, 1.1, 1, v());
    const dir = aim.sub(S).normalize();
    const reach = (a.m.R.a + a.m.R.b) * 0.72;
    pose.arms.R = { target: S.clone().addScaledVector(dir, reach - a.m.R.palm * 0.3), pole: r.clone().add(v(0, -1.4, 0)).normalize(), F: dir.clone().add(v(0, -0.1, 0)).normalize(), N: v(0, 1, 0).addScaledVector(r, -0.45).normalize(), w: e };
    pose.fingers.R = { curls: [0.05, 0, 0.02, 0.04, 0.06], w: e };
    pose.bend = 0.05 * e;
  },

  thumbsUp({ a, u, dur, pose }) {
    const e = env(u, dur, 0.5, 0.5);
    const { f, r } = frame(a);
    const chestY = a.chest(v()).y;
    const target = a.local(0.17, chestY - 0.16, 0.3, v());
    pose.arms.R = { target, pole: r.clone().add(v(0, -1, 0)).normalize(), F: f.clone(), N: r.clone().negate(), w: e };
    pose.fingers.R = { curls: [0, 1, 1, 1, 1], thumbOut: 0.25, w: e };
    pose.smile = e;
  },

  okSign({ a, u, dur, pose }) {
    const e = env(u, dur, 0.5, 0.5);
    const { f, r } = frame(a);
    const chestY = a.chest(v()).y;
    const target = a.local(0.2, chestY - 0.12, 0.27, v());
    pose.arms.R = { target, pole: r.clone().add(v(0, -1, 0)).normalize(), F: v(0, 1, 0).addScaledVector(f, 0.15).normalize(), N: f.clone(), w: e };
    pose.fingers.R = { curls: [0.75, 0.72, 0.05, 0.1, 0.15], w: e };
  },

  // Calling someone over. p.style 'finger' (rude in much of Asia) | 'palmDown'.
  beckon({ a, u, dur, p, pose }) {
    const e = env(u, dur, 0.5, 0.5);
    const { f, r } = frame(a);
    const chestY = a.chest(v()).y;
    const palmDown = p.style === 'palmDown';
    const target = a.local(0.18, chestY - (palmDown ? 0.05 : 0.15), 0.34, v());
    pose.arms.R = { target, pole: r.clone().add(v(0, -1, 0)).normalize(), F: f.clone().add(v(0, palmDown ? 0.1 : 0.2, 0)).normalize(), N: v(0, palmDown ? -1 : 1, 0), w: e };
    const c = (Math.sin(u * Math.PI * 2 * 1.8) * 0.5 + 0.5) * smooth((u - 0.4) / 0.2);
    pose.fingers.R = palmDown
      ? { curls: [0.2, 0.15 + c * 0.8, 0.15 + c * 0.85, 0.2 + c * 0.8, 0.25 + c * 0.75], w: e }
      : { curls: [0.6, c * 1.0, 1, 1, 1], w: e };
  },

  // Patting the partner's head.
  touchHead({ a, o, u, dur, pose }) {
    const e = env(u, dur, 0.6, 0.6);
    const { f, r, toO } = frame(a, o);
    const top = o.headPos(v()).add(v(0, 0.06, 0));
    top.y += Math.max(0, Math.sin((u - 0.6) * Math.PI * 2 * 2)) * 0.03 * smooth((u - 0.6) / 0.2);
    const F = toO.clone().add(v(0, -0.2, 0)).normalize();
    pose.arms.R = { target: top.addScaledVector(F, -a.m.R.palm * 0.9).addScaledVector(r, 0.02), pole: r.clone().add(v(0, -0.6, 0)).normalize(), F, N: v(0, -1, 0), w: e };
    pose.fingers.R = { curls: relaxed(0.15), w: e };
    pose.smile = e * 0.6;
  },

  // Turning away slightly with the head down, e.g. receiving a compliment modestly.
  look({ u, dur, p, pose }) {
    const e = env(u, dur, 0.5, 0.5);
    pose.headYaw = (p.yaw ?? 0) * e;
    pose.neck = (p.down ?? 0) * e;
    pose.lookW *= 1 - e;
  },

  smile({ u, dur, pose }) { pose.smile = env(u, dur, 0.3, 0.4); },

  // Two fingers up. p.palm 'in' faces the back of the hand outwards (rude in the UK).
  vSign({ a, u, dur, p, pose }) {
    const e = env(u, dur, 0.5, 0.5);
    const { f, r } = frame(a);
    const chestY = a.chest(v()).y;
    const target = a.local(0.2, chestY - 0.02, 0.24, v());
    const palmIn = p.palm === 'in';
    pose.arms.R = { target, pole: r.clone().add(v(0, -1, 0)).normalize(), F: v(0, 1, 0).addScaledVector(f, 0.12).normalize(), N: palmIn ? f.clone().negate() : f.clone(), w: e };
    pose.fingers.R = { curls: [0.85, 0, 0, 1, 1], w: e };
  },

  // Turkish "no": chin up, eyebrows raised, often with a click of the tongue.
  tiltNo({ u, dur, pose }) {
    const e = env(u, dur, 0.25, 0.45);
    pose.neck = -0.18 * e;
    pose.headPitch = -0.22 * e;
    pose.lookW *= 1 - e * 0.5;
  },
};
