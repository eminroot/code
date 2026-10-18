import { byCode, DIMS } from '@/data/countries';
import type { Country, Dim, Guide, Phase, Rule, Trip } from '@/data/types';

// Short explanations for each direction of change.
const SHIFT: Record<Dim, { up: string; down: string }> = {
  space: {
    up: 'People keep more distance than you are used to. Leave about an arm’s length.',
    down: 'People stand closer than at home. Stepping back can read as cold.',
  },
  touch: {
    up: 'Touch is part of conversation: a hand on the arm, a pat on the back. It is friendly.',
    down: 'Touch is rare between people who are not close. Skip the hug and the shoulder pat.',
  },
  time: {
    up: 'Time is exact. Five minutes late needs a message.',
    down: 'Clocks are softer here. Plans often start late, and that is not personal.',
  },
  direct: {
    up: 'People say what they mean, even when it is a no. That is honesty, not rudeness.',
    down: 'A direct no is rare. Listen for maybe and that could be difficult.',
  },
  formal: {
    up: 'Titles, age and rank matter more. Use surnames until you are invited not to.',
    down: 'Things are more casual. First names come fast, even with seniors.',
  },
  volume: {
    up: 'Conversation is louder and more animated. Raised voices usually mean enthusiasm.',
    down: 'Public spaces are quieter. Keep your voice and your phone down.',
  },
  eye: {
    up: 'Hold eye contact when you talk. Looking away can seem evasive.',
    down: 'Steady eye contact can feel intense, especially with elders. Soften your gaze.',
  },
};

export type Shift = { key: Dim; label: string; ends: [string, string]; from: number; to: number; delta: number; text: string };

export function shifts(from: Country, to: Country): Shift[] {
  return DIMS.map((d) => {
    const a = from.dims[d.key], b = to.dims[d.key];
    const delta = b - a;
    return { key: d.key, label: d.label, ends: d.ends, from: a, to: b, delta, text: delta >= 0 ? SHIFT[d.key].up : SHIFT[d.key].down };
  }).sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));
}

// 0..100, how different daily social life will feel.
export function shockScore(from: Country, to: Country) {
  let sum = 0;
  for (const d of DIMS) sum += Math.abs(from.dims[d.key] - to.dims[d.key]);
  sum += Math.min(3, Math.abs(from.tip - to.tip) / 6);
  if (from.shoes !== to.shoes) sum += 1;
  if (from.left !== to.left) sum += 1.2;
  return Math.round(Math.min(100, (sum / 20) * 100));
}

export function shockLabel(score: number) {
  if (score < 20) return 'A gentle shift';
  if (score < 40) return 'Noticeable differences';
  if (score < 60) return 'A real culture shift';
  return 'A big culture shift';
}

// Extra notes that depend on where you come from.
export function originNotes(from: Country, to: Country): string[] {
  const out: string[] = [];
  if (from.tip >= 15 && to.tip <= 5) out.push(to.tip === 0 ? 'You can stop calculating tips. Here it is not expected, and can even confuse people.' : 'Tips are small here. Rounding up is plenty.');
  if (from.tip <= 5 && to.tip >= 15) out.push(`Tipping is part of the bill here. Budget about ${to.tip} percent on top.`);
  if (!from.shoes && to.shoes) out.push('Shoes come off at the door of homes. Wear socks you are happy to show.');
  if (!from.left && to.left) out.push('The left hand is kept for hygiene. Give, take and eat with your right.');
  return out;
}

export const PHASES: { key: Phase; label: string; hint: string }[] = [
  { key: 'before', label: 'Before you land', hint: 'Pack and plan' },
  { key: 'day1', label: 'Your first day', hint: 'Greetings and getting around' },
  { key: 'week', label: 'Your first week', hint: 'Meals, homes and gifts' },
  { key: 'long', label: 'Staying longer', hint: 'Work, friends and daily life' },
];

export function phasesFor(days: number): Phase[] {
  if (days <= 3) return ['before', 'day1'];
  if (days <= 21) return ['before', 'day1', 'week'];
  return ['before', 'day1', 'week', 'long'];
}

export function planFor(guide: Guide, trip: Trip): { phase: (typeof PHASES)[number]; rules: Rule[] }[] {
  const keep = phasesFor(trip.days);
  const sortBiz = (a: Rule, b: Rule) => {
    if (trip.purpose !== 'business') return 0;
    return (b.topic === 'business' ? 1 : 0) - (a.topic === 'business' ? 1 : 0);
  };
  const out = PHASES.filter((p) => keep.includes(p.key)).map((phase) => ({ phase, rules: guide.rules.filter((r) => r.phase === phase.key).sort(sortBiz) }));
  // Short business trips still need the business basics.
  if (trip.purpose === 'business' && !keep.includes('long')) {
    const biz = guide.rules.filter((r) => r.phase === 'long' && r.topic === 'business');
    if (biz.length && out.length) out[out.length - 1].rules.push(...biz);
  }
  return out;
}

export const countryName = (code: string) => byCode(code)?.name ?? code;
