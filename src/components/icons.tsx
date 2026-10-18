import Svg, { Circle, Path, Rect } from 'react-native-svg';

type P = { size?: number; color?: string; stroke?: number };
const base = (size = 22) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const });

export const Back = ({ size, color = '#1B1713', stroke = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M15 5l-7 7 7 7" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" /></Svg>
);
export const Chevron = ({ size, color = '#1B1713', stroke = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M9 5l7 7-7 7" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" /></Svg>
);
export const Close = ({ size, color = '#1B1713', stroke = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={stroke} strokeLinecap="round" /></Svg>
);
export const Play = ({ size, color = '#1B1713' }: P) => (
  <Svg {...base(size)}><Path d="M8 5.5v13a.6.6 0 00.9.5l10.4-6.5a.6.6 0 000-1L8.9 5a.6.6 0 00-.9.5z" fill={color} /></Svg>
);
export const Pause = ({ size, color = '#1B1713' }: P) => (
  <Svg {...base(size)}><Rect x={6.5} y={5} width={3.6} height={14} rx={1} fill={color} /><Rect x={13.9} y={5} width={3.6} height={14} rx={1} fill={color} /></Svg>
);
export const Replay = ({ size, color = '#1B1713', stroke = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M4 12a8 8 0 108-8H8.5M8.5 4L11 1.5M8.5 4L11 6.5" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" /></Svg>
);
export const Speaker = ({ size, color = '#1B1713', stroke = 1.8 }: P) => (
  <Svg {...base(size)}>
    <Path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
    <Path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
  </Svg>
);
export const Send = ({ size, color = '#FFFFFF', stroke = 2 }: P) => (
  <Svg {...base(size)}><Path d="M12 19V5M6 11l6-6 6 6" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" /></Svg>
);
export const Edit = ({ size, color = '#1B1713', stroke = 1.7 }: P) => (
  <Svg {...base(size)}><Path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" stroke={color} strokeWidth={stroke} strokeLinejoin="round" /></Svg>
);
export const Check = ({ size, color = '#1B1713', stroke = 2 }: P) => (
  <Svg {...base(size)}><Path d="M5 12.5l4.5 4.5L19 7" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" /></Svg>
);
export const Target = ({ size, color = '#1B1713', stroke = 2 }: P) => (
  <Svg {...base(size)}>
    <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={stroke} />
    <Circle cx={12} cy={12} r={4.6} stroke={color} strokeWidth={stroke} />
    <Circle cx={12} cy={12} r={1.4} fill={color} />
  </Svg>
);
export const Search = ({ size, color = '#7A7064', stroke = 1.8 }: P) => (
  <Svg {...base(size)}><Circle cx={11} cy={11} r={6.5} stroke={color} strokeWidth={stroke} /><Path d="M16 16l4 4" stroke={color} strokeWidth={stroke} strokeLinecap="round" /></Svg>
);
export const Bookmark = ({ size, color = '#1B1713', stroke = 1.7, filled }: P & { filled?: boolean }) => (
  <Svg {...base(size)}><Path d="M7 4h10v16l-5-3.5L7 20V4z" stroke={color} strokeWidth={stroke} strokeLinejoin="round" fill={filled ? color : 'none'} /></Svg>
);

// Two-tone icons for the tab bar and the path. Grey when inactive.
type Duo = { size?: number; active?: boolean };
const g = (on: boolean | undefined, a: string, b: string) => (on ? [a, b] : ['#AFAFAF', '#CFCFCF']);

export const TabLearn = ({ size = 30, active }: Duo) => {
  const [a, b] = g(active, '#FF9600', '#FFC800');
  return (
    <Svg {...base(size)}>
      <Path d="M3 11.2L12 4l9 7.2V20a1 1 0 01-1 1h-5.2v-5.6H9.2V21H4a1 1 0 01-1-1v-8.8z" fill={b} />
      <Path d="M1.8 11.6L12 3.4l10.2 8.2" stroke={a} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      <Rect x={9.2} y={15.4} width={5.6} height={5.6} rx={1} fill={a} />
    </Svg>
  );
};
export const TabBrief = ({ size = 30, active }: Duo) => {
  const [a, b] = g(active, '#1CB0F6', '#84D8FF');
  return (
    <Svg {...base(size)}>
      <Circle cx={12} cy={12} r={9.5} fill={b} />
      <Path d="M15.6 8.4l-2 5.2-5.2 2 2-5.2 5.2-2z" fill={active ? '#FFFFFF' : '#F2F2F2'} />
      <Path d="M15.6 8.4l-2 5.2L12 12l3.6-3.6z" fill={a} />
      <Path d="M8.4 15.6l2-5.2L12 12l-3.6 3.6z" fill={a} />
    </Svg>
  );
};
export const TabTalk = ({ size = 30, active }: Duo) => {
  const [a, b] = g(active, '#CE82FF', '#E7C2FF');
  return (
    <Svg {...base(size)}>
      <Path d="M9 15.5c0-3 2.9-5.5 6.5-5.5S22 12.5 22 15.5c0 1.5-.7 2.8-1.9 3.8l.4 2.7-2.9-1.4c-.7.2-1.4.4-2.1.4-3.6 0-6.5-2.5-6.5-5.5z" fill={b} />
      <Path d="M2 9.5C2 5.9 5.4 3 9.5 3S17 5.9 17 9.5 13.6 16 9.5 16c-.9 0-1.7-.1-2.5-.4L3.7 17.2l.6-3.2C2.8 12.8 2 11.2 2 9.5z" fill={a} />
      <Circle cx={6.5} cy={9.5} r={1.1} fill="#FFFFFF" /><Circle cx={9.5} cy={9.5} r={1.1} fill="#FFFFFF" /><Circle cx={12.5} cy={9.5} r={1.1} fill="#FFFFFF" />
    </Svg>
  );
};
export const TabCoach = ({ size = 30, active }: Duo) => {
  const [a, b] = g(active, '#58CC02', '#A5ED6E');
  return (
    <Svg {...base(size)}>
      <Circle cx={12} cy={8.5} r={4.8} fill={a} />
      <Path d="M3.5 21c.6-4.4 4.2-7.2 8.5-7.2s7.9 2.8 8.5 7.2H3.5z" fill={b} />
      <Path d="M18.8 2.2l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7.7-1.6z" fill={active ? '#FFC800' : '#CFCFCF'} />
    </Svg>
  );
};

export const Flame = ({ size = 22, active = true }: Duo) => (
  <Svg {...base(size)}>
    <Path d="M12 2c.6 3.2 4.8 5.3 5.6 9.4.9 4.6-2.1 9.6-5.6 9.6s-6.8-3.3-6.2-8c.4-3 2.3-4.3 2.9-6.6.8 1.4 1.1 2.6 1 3.9C11.8 8.4 12.6 5.1 12 2z" fill={active ? '#FF9600' : '#CFCFCF'} />
    <Path d="M12 21c-1.9 0-3.3-1.6-3.1-3.8.2-1.9 1.7-2.6 2.2-4.4 1.6 1.4 4.3 3.1 3.9 5.4-.3 1.7-1.5 2.8-3 2.8z" fill={active ? '#FFC800' : '#E5E5E5'} />
  </Svg>
);
export const Gem = ({ size = 22 }: { size?: number }) => (
  <Svg {...base(size)}>
    <Path d="M6 3h12l4 6-10 12L2 9l4-6z" fill="#1CB0F6" />
    <Path d="M2 9h20L12 21 2 9z" fill="#1899D6" />
    <Path d="M8 9l4-6 4 6-4 12-4-12z" fill="#84D8FF" opacity={0.9} />
  </Svg>
);
export const Star = ({ size = 30, color = '#FFFFFF' }: P) => (
  <Svg {...base(size)}><Path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2 6.4 20.2l1.1-6.3L2.9 9.5l6.3-.9L12 2.8z" fill={color} /></Svg>
);
export const Trophy = ({ size = 30 }: { size?: number }) => (
  <Svg {...base(size)}>
    <Path d="M7 3h10v6a5 5 0 01-10 0V3z" fill="#FFC800" />
    <Path d="M7 5H3.5c0 3 1.5 5 4 5.2M17 5h3.5c0 3-1.5 5-4 5.2" stroke="#E5A500" strokeWidth={1.8} fill="none" />
    <Rect x={10.6} y={13.5} width={2.8} height={4} fill="#E5A500" />
    <Rect x={7} y={17.5} width={10} height={3.5} rx={1} fill="#FF9600" />
  </Svg>
);
export const Book = ({ size = 22, color = '#FFFFFF' }: P) => (
  <Svg {...base(size)}>
    <Path d="M12 6.2C9.6 4.6 6.4 4.2 3 5v13.6c3.4-.8 6.6-.4 9 1.2V6.2z" fill={color} />
    <Path d="M12 6.2c2.4-1.6 5.6-2 9-1.2v13.6c-3.4-.8-6.6-.4-9 1.2V6.2z" fill={color} opacity={0.82} />
  </Svg>
);
