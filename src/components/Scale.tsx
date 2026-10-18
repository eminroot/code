import { StyleSheet, View } from 'react-native';
import { T } from '@/components/ui';
import type { Shift } from '@/lib/insights';
import { color, font, tint } from '@/theme';

// Two dots on a 1..5 track: blue for home, the destination colour for where you are going.
export function Scale({ s, fromCode, toCode, tone }: { s: Shift; fromCode: string; toCode: string; tone: string }) {
  const pos = (v: number) => `${((v - 1) / 4) * 100}%` as const;
  const lo = Math.min(s.from, s.to), hi = Math.max(s.from, s.to);
  const big = Math.abs(s.delta) >= 2;
  return (
    <View style={styles.row}>
      <View style={styles.head}>
        <T v="h3" style={{ fontSize: 17 }}>{s.label}</T>
        {big ? <View style={[styles.badge, { backgroundColor: color.redSoft }]}><T style={[styles.badgeT, { color: color.redDark }]}>BIG SHIFT</T></View> : null}
      </View>
      <View style={styles.trackWrap}>
        <View style={styles.track} />
        <View style={[styles.span, { left: pos(lo), width: `${((hi - lo) / 4) * 100}%`, backgroundColor: tint(tone, 0.45) }]} />
        <View style={[styles.dotWrap, { left: pos(s.from) }]}>
          <View style={[styles.dot, { backgroundColor: color.blue, borderColor: color.blueDark }]}><T style={styles.dotT}>{fromCode}</T></View>
        </View>
        <View style={[styles.dotWrap, { left: pos(s.to) }]}>
          <View style={[styles.dot, { backgroundColor: tone, borderColor: tint(tone, -0.2) }]}><T style={styles.dotT}>{toCode}</T></View>
        </View>
      </View>
      <View style={styles.ends}>
        <T style={styles.end}>{s.ends[0]}</T>
        <T style={styles.end}>{s.ends[1]}</T>
      </View>
      <T v="body" style={styles.text}>{s.text}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 14 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeT: { fontFamily: font.heavy, fontSize: 10.5, letterSpacing: 0.6 },
  trackWrap: { height: 40, marginTop: 8, marginHorizontal: 18, justifyContent: 'center' },
  track: { height: 12, backgroundColor: color.line, borderRadius: 6 },
  span: { position: 'absolute', height: 12, borderRadius: 6, top: 14 },
  dotWrap: { position: 'absolute', width: 40, marginLeft: -20, top: 2, alignItems: 'center' },
  dot: { width: 36, height: 36, borderRadius: 18, borderBottomWidth: 4, alignItems: 'center', justifyContent: 'center' },
  dotT: { fontFamily: font.black, fontSize: 11, color: color.white, letterSpacing: 0.3 },
  ends: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  end: { fontFamily: font.bold, fontSize: 12, color: color.faint },
  text: { marginTop: 8, fontSize: 14.5, lineHeight: 20 },
});
