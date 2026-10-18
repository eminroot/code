import type { Guide, Line, Performance, Scene, SceneCat } from '@/data/types';
import { stageBackdrop } from '@/theme';

export type StageActor = { id: 'you' | 'local'; avatar: string; gender: 'm' | 'f'; yaw?: number };
export type StageLine = { t: number; who: 'you' | 'local'; en: string; local?: string; roman?: string; dur?: number };
export type StageSet = 'home' | 'office' | 'lobby' | 'street' | 'shop' | 'cafe' | 'train';
export type StageScene = {
  key: string;
  set?: StageSet;
  accent?: string;
  gap: number;
  camera: string;
  bg?: string;
  actors: StageActor[];
  props?: Performance['props'];
  script: { duration: number; loop: boolean; events: Performance['events']; beats: { t: number; i: number }[]; lines?: StageLine[] };
};

// Where each scene takes place. Most follow their category; the rest are set by id.
const SET_BY_CAT: Record<SceneCat, StageSet> = { greet: 'lobby', business: 'office', home: 'home', gesture: 'street', out: 'street' };
const SET_BY_ID: Record<string, StageSet> = {
  'tr-greet': 'street', 'ge-greet': 'street', 'fr-bise': 'street', 'it-bise': 'street', 'br-greet': 'street',
  'kr-greet': 'home', 'az-women': 'home', 'th-head': 'home',
  'jp-train': 'train',
  'fr-shop': 'shop', 'kr-thanks': 'shop', 'in-hand': 'shop', 'tr-no': 'shop',
  'jp-beckon': 'cafe', 'kr-beckon': 'cafe', 'th-beckon': 'cafe', 'ae-hand': 'cafe', 'tr-ok': 'cafe', 'br-ok': 'cafe', 'gb-v': 'cafe',
  'de-wave': 'office', 'us-wave': 'office', 'it-talk': 'office',
};
export const setFor = (scene: Scene): StageSet => SET_BY_ID[scene.id] ?? SET_BY_CAT[scene.cat];

export const genderOf = (avatar: string): 'm' | 'f' => (avatar.endsWith('_f') ? 'f' : 'm');

const fill = (s: string | undefined, name: string, home: string) => s?.replace(/\{name\}/g, name).replace(/\{home\}/g, home);

export function personalLines(lines: Line[] | undefined, name: string, home: string): StageLine[] | undefined {
  return lines?.map((l) => ({ ...l, en: fill(l.en, name, home) ?? l.en, local: fill(l.local, name, home), roman: fill(l.roman, name, home) }));
}

export function stageScene(scene: Scene, guide: Guide, you: 'm' | 'f', mode: 'do' | 'avoid', who?: { name: string; home: string }): StageScene {
  const perf = mode === 'avoid' && scene.avoid ? scene.avoid : scene.do;
  const youG = scene.you ?? you;
  const localAvatar = guide.avatars[scene.local];
  const lines = mode === 'avoid' && scene.avoid ? scene.avoidLines : scene.lines;
  const s = fromPerformance(`${scene.id}:${mode}:${youG}`, perf, youG === 'f' ? 'trav_f' : 'trav_m', localAvatar);
  s.bg = stageBackdrop(guide.color);
  s.set = setFor(scene);
  s.accent = guide.color;
  s.script.lines = personalLines(lines, who?.name ?? 'Alex', who?.home ?? 'home');
  return s;
}

export function fromPerformance(key: string, perf: Performance, youAvatar: string, localAvatar: string): StageScene {
  return {
    key,
    gap: perf.gap,
    camera: perf.camera ?? 'three',
    actors: [
      { id: 'you', avatar: youAvatar, gender: genderOf(youAvatar) },
      { id: 'local', avatar: localAvatar, gender: genderOf(localAvatar) },
    ],
    props: perf.props,
    script: { duration: perf.duration, loop: true, events: perf.events, beats: perf.beats.map((t, i) => ({ t, i })) },
  };
}
