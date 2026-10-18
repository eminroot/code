import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { T } from '@/components/ui';
import type { Checkin, Mood } from '@/data/types';
import { lastDays, weekdayLetter } from '@/lib/journey';
import { color, font, shade } from '@/theme';

export const moodColor = (m: Mood) => [color.red, color.orange, color.yellow, '#89E219', color.green][m - 1];

// Mouth curves from a deep frown (1) to a wide smile (5).
const MOUTH = ['M8 17.2q4-3.6 8 0', 'M8.5 16.6q3.5-2 7 0', 'M8.5 15.8h7', 'M8 14.8q4 3 8 0', 'M7.4 14.2q4.6 5.2 9.2 0z'];

export function Face({ mood, size = 44, dim }: { mood: Mood; size?: number; dim?: boolean }) {
  const fill = dim ? color.line : moodColor(mood);
  const ink = dim ? color.faint : '#4B3A2A';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={11} fill={fill} stroke={dim ? '#D0D0D0' : shade(fill)} strokeWidth={1.2} />
      <Circle cx={8.6} cy={9.6} r={1.25} fill={ink} />
      <Circle cx={15.4} cy={9.6} r={1.25} fill={ink} />
      <Path d={MOUTH[mood - 1]} stroke={ink} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill={mood === 5 && !dim ? ink : 'none'} />
    </Svg>
  );
}

// The last seven days, one dot per day, coloured by mood.
export function Week({ checkins, size = 26 }: { checkins: Checkin[]; size?: number }) {
  const days = lastDays(7);
  const by = new Map(checkins.map((c) => [c.day, c.mood]));
  return (
    <View style={styles.week}>
      {days.map((d) => {
        const m = by.get(d);
        return (
          <View key={d} style={styles.day}>
            {m ? <Face mood={m} size={size} /> : <View style={[styles.empty, { width: size, height: size, borderRadius: size / 2 }]} />}
            <T style={styles.letter}>{weekdayLetter(d)}</T>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 4 },
  empty: { borderWidth: 2, borderColor: color.line, borderStyle: 'dashed' },
  letter: { fontFamily: font.heavy, fontSize: 11.5, color: color.faint },
});
