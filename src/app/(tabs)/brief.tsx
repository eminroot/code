import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Chevron, Play } from '@/components/icons';
import { RuleSheet } from '@/components/RuleSheet';
import { Scale } from '@/components/Scale';
import { TopBar } from '@/components/TopBar';
import { Button, Card, T, Tap } from '@/components/ui';
import type { Rule } from '@/data/types';
import { originNotes, planFor, shifts, shockLabel, shockScore } from '@/lib/insights';
import { useTrip } from '@/lib/useTrip';
import { color, font, onColor, radius, shade } from '@/theme';

const PURPOSE = { holiday: 'Holiday', business: 'Business', study: 'Study', family: 'Family visit' } as const;
const PHASE_TONES = [color.blue, color.green, color.orange, color.purple];
const FACT_TONES = [color.blueSoft, color.greenSoft, color.yellowSoft, color.purpleSoft, color.redSoft, color.orangeSoft];
const FACT_INK = [color.blueDark, color.greenDark, color.yellowDark, color.purpleDark, color.redDark, color.orangeDark];

function KindIcon({ kind }: { kind: Rule['kind'] }) {
  const tone = kind === 'do' ? color.green : kind === 'avoid' ? color.red : color.blue;
  return (
    <View style={[styles.kindIcon, { backgroundColor: tone, borderColor: shade(tone) }]}>
      <Svg width={18} height={18} viewBox="0 0 24 24">
        {kind === 'do' ? <Path d="M5 12.5l4.5 4.5L19 7" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
        {kind === 'avoid' ? <Path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" /> : null}
        {kind === 'know' ? <Path d="M12 10.5v7M12 6.6v.2" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" /> : null}
      </Svg>
    </View>
  );
}

export default function Brief() {
  const ctx = useTrip();
  const [open, setOpen] = useState<Rule | null>(null);

  const data = useMemo(() => {
    if (!ctx) return null;
    const { trip, guide, from, to } = ctx;
    return { score: shockScore(from, to), top: shifts(from, to).slice(0, 4), notes: originNotes(from, to), plan: planFor(guide, trip) };
  }, [ctx]);

  if (!ctx || !data) return null;
  const { trip, guide, from, to } = ctx;
  const tone = guide.color;
  const ink = onColor(tone);
  const scoreTone = data.score >= 60 ? color.red : data.score >= 40 ? color.orange : data.score >= 20 ? color.yellow : color.green;

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <TopBar />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: tone, borderColor: shade(tone) }]}>
          <T style={[styles.heroLabel, { color: ink }]}>Your briefing</T>
          <T style={[styles.heroTitle, { color: ink }]}>{to.name}</T>
          <T style={[styles.heroTag, { color: ink }]}>{guide.tagline}</T>
          <View style={styles.chips}>
            {[`${trip.days} ${trip.days === 1 ? 'day' : 'days'}`, PURPOSE[trip.purpose], `${from.flag} from ${from.name}`].map((c) => (
              <View key={c} style={styles.chip}><T style={styles.chipT}>{c}</T></View>
            ))}
          </View>
        </View>

        <View style={styles.pad}>
          <T v="h2" style={{ marginTop: 26 }}>What will feel different</T>
          <Card style={{ marginTop: 12, paddingVertical: 10 }}>
            <View style={styles.scoreRow}>
              <View style={[styles.score, { backgroundColor: scoreTone, borderColor: shade(scoreTone) }]}>
                <T style={[styles.scoreT, { color: onColor(scoreTone) }]}>{data.score}</T>
              </View>
              <View style={{ flex: 1 }}>
                <T v="h3">{shockLabel(data.score)}</T>
                <T v="small" style={{ marginTop: 2 }}>Coming from {from.name}, these change the most.</T>
              </View>
            </View>
            {data.top.map((s, i) => (
              <View key={s.key} style={i > 0 ? styles.hair : undefined}>
                <Scale s={s} fromCode={from.code} toCode={to.code} tone={tone} />
              </View>
            ))}
          </Card>
          {data.notes.map((n) => (
            <Card key={n} tone={color.yellowSoft} style={{ marginTop: 12, borderColor: '#FFE38A' }}>
              <T v="label" style={{ color: color.yellowDark }}>From where you live</T>
              <T v="bodyStrong" style={{ marginTop: 4 }}>{n}</T>
            </Card>
          ))}

          <T v="h2" style={{ marginTop: 30 }}>Your {trip.days}-day plan</T>
          {data.plan.map(({ phase, rules }, pi) => {
            const pt = PHASE_TONES[pi % PHASE_TONES.length];
            return (
              <View key={phase.key} style={{ marginTop: 18 }}>
                <View style={styles.phase}>
                  <View style={[styles.phaseNum, { backgroundColor: pt, borderColor: shade(pt) }]}><T style={styles.phaseNumT}>{pi + 1}</T></View>
                  <View style={{ flex: 1 }}>
                    <T v="h3">{phase.label}</T>
                    <T v="small">{phase.hint}</T>
                  </View>
                </View>
                {rules.map((r) => (
                  <Card key={r.id} onPress={() => setOpen(r)} style={styles.rule}>
                    <KindIcon kind={r.kind} />
                    <View style={{ flex: 1 }}>
                      <T v="title">{r.title}</T>
                      <T v="small" numberOfLines={2} style={{ marginTop: 2 }}>{r.body}</T>
                      {r.scene ? <View style={styles.watch}><Play size={11} color={color.blue} /><T style={styles.watchT}>WATCH THE SCENE</T></View> : null}
                    </View>
                    <Chevron size={18} color={color.faint} />
                  </Card>
                ))}
              </View>
            );
          })}

          <T v="h2" style={{ marginTop: 30 }}>The essentials</T>
          <View style={styles.facts}>
            {guide.facts.map((f, i) => (
              <View key={f.label} style={[styles.fact, { backgroundColor: FACT_TONES[i % 6] }]}>
                <T style={[styles.factLabel, { color: FACT_INK[i % 6] }]}>{f.label.toUpperCase()}</T>
                <T v="bodyStrong" style={{ marginTop: 4, fontSize: 14.5, lineHeight: 20 }}>{f.value}</T>
              </View>
            ))}
          </View>

          <Card tone={color.greenSoft} style={{ marginTop: 26, borderColor: '#A5ED6E' }}>
            <T v="h3">Stuck in a moment?</T>
            <T v="body" style={{ marginTop: 4 }}>Describe what is happening and your coach tells you what to do and say.</T>
            <Button title="Ask the coach" tone={color.green} onPress={() => router.push('/(tabs)/coach')} style={{ marginTop: 14 }} />
          </Card>
        </View>
      </ScrollView>
      <RuleSheet rule={open} guide={guide} trip={trip} onClose={() => setOpen(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 16 },
  hero: { marginHorizontal: 16, marginTop: 16, borderRadius: radius.xl, padding: 20, borderBottomWidth: 6 },
  heroLabel: { fontFamily: font.heavy, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.85 },
  heroTitle: { fontFamily: font.black, fontSize: 34, lineHeight: 38, marginTop: 2 },
  heroTag: { fontFamily: font.bold, fontSize: 16, marginTop: 4, opacity: 0.95 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip: { backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  chipT: { fontFamily: font.heavy, fontSize: 13, color: color.inkSoft },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8 },
  score: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 5 },
  scoreT: { fontFamily: font.black, fontSize: 28 },
  hair: { borderTopWidth: 2, borderTopColor: color.line },
  phase: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  phaseNum: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 4 },
  phaseNumT: { fontFamily: font.black, fontSize: 18, color: color.white },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10, paddingVertical: 14 },
  kindIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 3 },
  watch: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  watchT: { fontFamily: font.heavy, fontSize: 11.5, color: color.blue, letterSpacing: 0.6 },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  fact: { width: '48.5%', borderRadius: radius.lg, padding: 14 },
  factLabel: { fontFamily: font.heavy, fontSize: 12, letterSpacing: 0.8 },
});
