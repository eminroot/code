// Bright, playful palette in the spirit of language-learning apps.
export const color = {
  bg: '#FFFFFF',
  bgSoft: '#F7F7F7',
  ink: '#3C3C3C',
  inkSoft: '#4B4B4B',
  muted: '#777777',
  faint: '#AFAFAF',
  line: '#E5E5E5',
  white: '#FFFFFF',

  green: '#58CC02',
  greenDark: '#58A700',
  greenSoft: '#D7FFB8',
  blue: '#1CB0F6',
  blueDark: '#1899D6',
  blueSoft: '#DDF4FF',
  red: '#FF4B4B',
  redDark: '#EA2B2B',
  redSoft: '#FFDFE0',
  yellow: '#FFC800',
  yellowDark: '#E5A500',
  yellowSoft: '#FFF4CC',
  orange: '#FF9600',
  orangeDark: '#E08600',
  orangeSoft: '#FFE9CC',
  purple: '#CE82FF',
  purpleDark: '#A568CC',
  purpleSoft: '#F3E5FF',
  navy: '#2B70C9',
};

export const font = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  heavy: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
};

export const radius = { sm: 10, md: 16, lg: 20, xl: 26, pill: 999 };

// ---- colour helpers --------------------------------------------------------

function hex(c: string) {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function toHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}
// Blend a colour towards white (k=1 is white) or black (k=-1 is black).
export function tint(c: string, k: number) {
  const [r, g, b] = hex(c);
  const t = k >= 0 ? 255 : 0;
  const a = Math.abs(k);
  return toHex(r + (t - r) * a, g + (t - g) * a, b + (t - b) * a);
}
export const shade = (c: string) => tint(c, -0.18);
export function onColor(c: string) {
  const [r, g, b] = hex(c);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.72 ? '#4B4B4B' : '#FFFFFF';
}

// CSS gradient for the 3D stage behind people.
export function stageBackdrop(c: string) {
  return `radial-gradient(120% 90% at 50% 25%, ${tint(c, 0.93)} 0%, ${tint(c, 0.82)} 55%, ${tint(c, 0.7)} 100%)`;
}
