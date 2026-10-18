import { LINES } from '../lines';
import { TALK } from '../talk';
import type { Guide, GuideSource, Scene } from '../types';
import { CN, IN, JP, KR, TH } from './asia';
import { AE, AZ, GE, TR } from './mideast';
import { BR, DE, FR, GB, IT, US } from './west';

// Each destination gets its own colour for banners and the 3D backdrop.
const COLORS: Record<string, string> = {
  AZ: '#1CB0F6', TR: '#FF4B4B', GE: '#CE82FF', JP: '#FF6BA6', KR: '#2B70C9', CN: '#FF4B4B', TH: '#FFC800', IN: '#FF9600',
  AE: '#00C2A8', FR: '#2B70C9', IT: '#58CC02', DE: '#FFC800', GB: '#1CB0F6', US: '#FF4B4B', BR: '#58CC02',
};

const build = (g: GuideSource): Guide => ({
  ...g,
  color: COLORS[g.code] ?? '#1CB0F6',
  talk: TALK[g.code],
  scenes: g.scenes.map((s): Scene => ({ ...s, lines: LINES[s.id]?.do, avoidLines: LINES[s.id]?.avoid })),
});

export const GUIDES: Guide[] = [AZ, TR, GE, JP, KR, CN, TH, IN, AE, FR, IT, DE, GB, US, BR].map(build);

export const guideFor = (code: string) => GUIDES.find((g) => g.code === code);

export function findScene(id: string): { guide: Guide; scene: Scene } | null {
  for (const guide of GUIDES) {
    const scene = guide.scenes.find((s) => s.id === id);
    if (scene) return { guide, scene };
  }
  return null;
}
