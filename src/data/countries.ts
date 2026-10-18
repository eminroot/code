import type { Country, Dim } from './types';

// Rough social profiles on a 1..5 scale, used to explain what will feel different.
// space: 1 close .. 5 distant, touch: 1 rare .. 5 often, time: 1 relaxed .. 5 exact,
// direct: 1 indirect .. 5 blunt, formal: 1 casual .. 5 formal, volume: 1 quiet .. 5 lively,
// eye: 1 soft .. 5 steady. tip is the usual restaurant tip in percent.
const c = (code: string, name: string, flag: string, d: number[], tip: number, shoes: boolean, left: boolean): Country => ({
  code, name, flag, tip, shoes, left,
  dims: { space: d[0], touch: d[1], time: d[2], direct: d[3], formal: d[4], volume: d[5], eye: d[6] },
});

export const COUNTRIES: Country[] = [
  c('AZ', 'Azerbaijan', '🇦🇿', [2, 4, 2, 3, 4, 4, 4], 10, true, false),
  c('TR', 'Turkey', '🇹🇷', [2, 4, 2, 3, 3, 4, 4], 8, true, false),
  c('GE', 'Georgia', '🇬🇪', [2, 4, 2, 3, 3, 4, 4], 10, true, false),
  c('JP', 'Japan', '🇯🇵', [5, 1, 5, 1, 5, 1, 2], 0, true, false),
  c('KR', 'South Korea', '🇰🇷', [4, 2, 4, 2, 5, 2, 2], 0, true, false),
  c('CN', 'China', '🇨🇳', [3, 2, 4, 2, 4, 3, 3], 0, true, false),
  c('TH', 'Thailand', '🇹🇭', [4, 1, 2, 1, 4, 1, 2], 5, true, true),
  c('IN', 'India', '🇮🇳', [2, 2, 2, 2, 4, 3, 3], 10, true, true),
  c('AE', 'United Arab Emirates', '🇦🇪', [2, 2, 2, 2, 4, 3, 3], 10, true, true),
  c('FR', 'France', '🇫🇷', [3, 3, 3, 4, 4, 3, 4], 5, false, false),
  c('IT', 'Italy', '🇮🇹', [2, 4, 2, 3, 3, 5, 4], 5, false, false),
  c('DE', 'Germany', '🇩🇪', [4, 2, 5, 5, 4, 2, 5], 10, true, false),
  c('GB', 'United Kingdom', '🇬🇧', [4, 1, 4, 2, 3, 2, 3], 10, false, false),
  c('US', 'United States', '🇺🇸', [4, 2, 4, 4, 1, 4, 4], 20, false, false),
  c('BR', 'Brazil', '🇧🇷', [1, 5, 1, 3, 2, 5, 4], 10, false, false),
  c('RU', 'Russia', '🇷🇺', [3, 2, 3, 4, 3, 3, 4], 10, true, false),
  c('KZ', 'Kazakhstan', '🇰🇿', [2, 3, 2, 3, 4, 3, 3], 10, true, false),
  c('UZ', 'Uzbekistan', '🇺🇿', [2, 3, 2, 2, 4, 3, 3], 5, true, false),
  c('IR', 'Iran', '🇮🇷', [2, 3, 2, 1, 4, 3, 3], 10, true, true),
  c('PK', 'Pakistan', '🇵🇰', [2, 3, 2, 2, 4, 3, 3], 10, true, true),
  c('SA', 'Saudi Arabia', '🇸🇦', [2, 2, 2, 2, 4, 3, 3], 10, true, true),
  c('EG', 'Egypt', '🇪🇬', [2, 3, 1, 3, 3, 4, 4], 10, true, true),
  c('ES', 'Spain', '🇪🇸', [2, 4, 2, 4, 2, 5, 4], 5, false, false),
  c('NL', 'Netherlands', '🇳🇱', [4, 2, 4, 5, 1, 3, 4], 5, false, false),
  c('PL', 'Poland', '🇵🇱', [3, 2, 3, 4, 3, 3, 4], 10, true, false),
  c('UA', 'Ukraine', '🇺🇦', [3, 3, 3, 4, 3, 3, 4], 10, true, false),
  c('SE', 'Sweden', '🇸🇪', [4, 2, 5, 4, 1, 1, 4], 5, true, false),
  c('MX', 'Mexico', '🇲🇽', [2, 4, 1, 2, 3, 4, 3], 15, false, false),
  c('CA', 'Canada', '🇨🇦', [4, 2, 4, 3, 1, 3, 4], 18, true, false),
  c('AU', 'Australia', '🇦🇺', [4, 2, 3, 4, 1, 3, 4], 5, false, false),
  c('ID', 'Indonesia', '🇮🇩', [3, 2, 1, 1, 4, 2, 2], 5, true, true),
  c('NG', 'Nigeria', '🇳🇬', [2, 3, 1, 3, 4, 4, 2], 10, false, true),
  c('IL', 'Israel', '🇮🇱', [2, 3, 2, 5, 1, 4, 4], 12, false, false),
];

export const byCode = (code: string) => COUNTRIES.find((x) => x.code === code);

export const DIMS: { key: Dim; label: string; ends: [string, string] }[] = [
  { key: 'space', label: 'Personal space', ends: ['Close', 'Distant'] },
  { key: 'touch', label: 'Touch', ends: ['Rare', 'Often'] },
  { key: 'time', label: 'Punctuality', ends: ['Relaxed', 'Exact'] },
  { key: 'direct', label: 'Directness', ends: ['Indirect', 'Blunt'] },
  { key: 'formal', label: 'Formality', ends: ['Casual', 'Formal'] },
  { key: 'volume', label: 'Volume', ends: ['Quiet', 'Lively'] },
  { key: 'eye', label: 'Eye contact', ends: ['Soft', 'Steady'] },
];
