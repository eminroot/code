import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Speaker } from '@/components/icons';
import { TopBar } from '@/components/TopBar';
import { Card, T, Tap } from '@/components/ui';
import { PORTRAITS } from '@/data/images';
import type { Phrase } from '@/data/types';
import { say } from '@/lib/speech';
import { useTrip } from '@/lib/useTrip';
import { color, font, radius, shade } from '@/theme';

const LANG: Record<string, string> = {
  'ja-JP': 'Japanese', 'ko-KR': 'Korean', 'zh-CN': 'Mandarin', 'th-TH': 'Thai', 'hi-IN': 'Hindi', 'ar-AE': 'Arabic', 'tr-TR': 'Turkish',
  'az-AZ': 'Azerbaijani', 'ka-GE': 'Georgian', 'fr-FR': 'French', 'it-IT': 'Italian', 'de-DE': 'German', 'en-GB': 'British English', 'en-US': 'American English', 'pt-BR': 'Portuguese',
};
const GROUPS: { k: NonNullable<Phrase['cat']>; t: string }[] = [
  { k: 'greet', t: 'Hello and goodbye' },
  { k: 'polite', t: 'Being polite' },
  { k: 'dining', t: 'At the table' },
  { k: 'help', t: 'Getting help' },
];
const CHIP_TONES = [
  [color.blueSoft, color.blueDark], [color.greenSoft, color.greenDark], [color.purpleSoft, color.purpleDark],
  [color.yellowSoft, color.yellowDark], [color.orangeSoft, color.orangeDark], [color.redSoft, color.redDark],
];

function SpeakBtn({ on, onPress, tone = color.blue }: { on: boolean; onPress: () => void; tone?: string }) {
  return (
    <Tap onPress={onPress} style={[styles.speak, { backgroundColor: on ? color.orange : tone, borderColor: shade(on ? color.orange : tone) }]}>
      <Speaker size={20} color="#FFFFFF" stroke={2.2} />
    </Tap>
  );
}

function Header({ title, sub, tone }: { title: string; sub?: string; tone: string }) {
  return (
    <View style={styles.secHead}>
      <View style={[styles.secBar, { backgroundColor: tone }]} />
      <View style={{ flex: 1 }}>
        <T v="h2">{title}</T>
        {sub ? <T v="small" style={{ marginTop: 2 }}>{sub}</T> : null}
      </View>
    </View>
  );
}

export default function Talk() {
  const ctx = useTrip();
  const [playing, setPlaying] = useState<string | null>(null);
  if (!ctx) return null;
  const { guide, to, from, trip } = ctx;
  const talk = guide.talk;
  const fill = (s: string) => s.replace(/\{home\}/g, from.name).replace(/\{name\}/g, trip.name.split(' ')[0]);
  const play = (p: { local: string; roman?: string }) => {
    setPlaying(p.local);
    say(p, guide.lang, () => setPlaying((cur) => (cur === p.local ? null : cur)));
  };
  const localFace = PORTRAITS[guide.avatars.f] ?? PORTRAITS[guide.avatars.m];
  const youFace = PORTRAITS[trip.avatar === 'f' ? 'trav_f' : 'trav_m'];

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <TopBar />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: color.purple, borderColor: color.purpleDark }]}>
          <T style={styles.heroLabel}>{LANG[guide.lang] ?? to.name}</T>
          <T style={styles.heroTitle}>Talk like you belong</T>
          <T style={styles.heroSub}>What to say, what to ask and what to skip in {to.name}.</T>
        </View>

        <View style={styles.pad}>
          <Header title="Break the ice" sub="Openers that work with people you just met" tone={color.green} />
          {talk.starters.map((s, i) => (
            <Card key={i} style={{ marginBottom: 12 }}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <T style={styles.quote}>“{fill(s.say)}”</T>
                  {s.local ? <T style={[styles.local, { color: guide.color === color.yellow ? color.yellowDark : guide.color }]}>{s.local}</T> : null}
                  {s.roman ? <T style={styles.roman}>{s.roman}</T> : null}
                </View>
                {s.local ? <SpeakBtn on={playing === s.local} onPress={() => play({ local: s.local!, roman: s.roman })} /> : null}
              </View>
              <View style={styles.why}>
                <T style={styles.whyLabel}>WHY IT WORKS</T>
                <T v="small" style={{ color: color.inkSoft, marginTop: 2 }}>{s.why}</T>
              </View>
            </Card>
          ))}

          <Header title="Great topics" sub="Safe ground for longer conversations" tone={color.blue} />
          <View style={styles.chips}>
            {talk.topics.map((t, i) => {
              const [bg, fg] = CHIP_TONES[i % CHIP_TONES.length];
              return <View key={t} style={[styles.chip, { backgroundColor: bg }]}><T style={[styles.chipT, { color: fg }]}>{t}</T></View>;
            })}
          </View>

          <Header title="Steer clear of" sub="Topics that can sour a good moment" tone={color.red} />
          {talk.avoid.map((a) => (
            <Card key={a.topic} tone={color.redSoft} style={{ marginBottom: 10, borderColor: '#FFB2B2' }}>
              <T style={styles.avoidTitle}>{a.topic}</T>
              <T v="body" style={{ marginTop: 2, fontSize: 14.5 }}>{a.why}</T>
            </Card>
          ))}

          <Header title="Questions you will hear" sub="And an easy way to answer" tone={color.orange} />
          {talk.asked.map((q, i) => (
            <View key={i} style={{ marginBottom: 16 }}>
              <View style={styles.chatRow}>
                <Image source={localFace} style={styles.face} />
                <View style={[styles.bubble, styles.bubbleThem]}><T v="bodyStrong">{fill(q.q)}</T></View>
              </View>
              <View style={[styles.chatRow, { justifyContent: 'flex-end' }]}>
                <View style={[styles.bubble, styles.bubbleMe]}><T v="bodyStrong" style={{ color: color.blueDark }}>{fill(q.a)}</T></View>
                <Image source={youFace} style={styles.face} />
              </View>
              {q.note ? <T v="small" style={styles.note}>{q.note}</T> : null}
            </View>
          ))}

          <Header title="Compliments that land" sub="Warm words people love to hear" tone={color.yellow} />
          {talk.compliments.map((c, i) => (
            <Card key={i} tone={color.yellowSoft} style={[styles.row, { marginBottom: 10, borderColor: '#FFE38A' }]}>
              <View style={{ flex: 1 }}>
                {c.local ? <T style={styles.compLocal}>{c.local}</T> : null}
                {c.roman ? <T style={styles.roman}>{c.roman}</T> : null}
                <T v={c.local ? 'small' : 'bodyStrong'} style={c.local ? { color: color.inkSoft, marginTop: 2 } : undefined}>{c.say}</T>
              </View>
              {c.local ? <SpeakBtn on={playing === c.local} onPress={() => play({ local: c.local!, roman: c.roman })} tone={color.yellowDark} /> : null}
            </Card>
          ))}

          <Header title="Useful phrases" sub="Tap the speaker to hear them" tone={color.purple} />
          {GROUPS.map((g) => {
            const items = guide.phrases.filter((p) => (p.cat ?? 'polite') === g.k);
            if (!items.length) return null;
            return (
              <View key={g.k} style={{ marginBottom: 14 }}>
                <T v="label" style={{ marginBottom: 8 }}>{g.t}</T>
                <Card style={{ paddingVertical: 4 }}>
                  {items.map((p, i) => (
                    <View key={p.local + i} style={[styles.phrase, i > 0 && styles.hair]}>
                      <View style={{ flex: 1 }}>
                        <T v="small">{p.en}</T>
                        <T style={styles.phraseLocal}>{p.local}</T>
                        {p.roman ? <T style={styles.roman}>{p.roman}</T> : null}
                        {p.note ? <T v="small" style={{ marginTop: 4 }}>{p.note}</T> : null}
                      </View>
                      <SpeakBtn on={playing === p.local} onPress={() => play(p)} />
                    </View>
                  ))}
                </Card>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 16 },
  hero: { marginHorizontal: 16, marginTop: 16, borderRadius: radius.xl, padding: 20, borderBottomWidth: 6 },
  heroLabel: { fontFamily: font.heavy, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.88)' },
  heroTitle: { fontFamily: font.black, fontSize: 30, lineHeight: 34, color: color.white, marginTop: 2 },
  heroSub: { fontFamily: font.bold, fontSize: 15, color: 'rgba(255,255,255,0.95)', marginTop: 4 },
  secHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 28, marginBottom: 12 },
  secBar: { width: 6, alignSelf: 'stretch', borderRadius: 3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  quote: { fontFamily: font.heavy, fontSize: 18, lineHeight: 24, color: color.ink },
  local: { fontFamily: font.heavy, fontSize: 19, lineHeight: 26, marginTop: 6 },
  roman: { fontFamily: font.bold, fontSize: 14, color: color.muted, fontStyle: 'italic' },
  why: { marginTop: 12, paddingTop: 10, borderTopWidth: 2, borderTopColor: color.line },
  whyLabel: { fontFamily: font.heavy, fontSize: 11, letterSpacing: 0.8, color: color.green },
  speak: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14 },
  chipT: { fontFamily: font.heavy, fontSize: 14 },
  avoidTitle: { fontFamily: font.heavy, fontSize: 16.5, color: color.redDark },
  chatRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 6 },
  face: { width: 36, height: 36, borderRadius: 18, backgroundColor: color.blueSoft, borderWidth: 2, borderColor: color.white },
  bubble: { maxWidth: '76%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderWidth: 2, borderBottomWidth: 4 },
  bubbleThem: { backgroundColor: color.white, borderColor: color.line, borderBottomLeftRadius: 6 },
  bubbleMe: { backgroundColor: color.blueSoft, borderColor: '#84D8FF', borderBottomRightRadius: 6 },
  note: { marginTop: 6, marginLeft: 44 },
  compLocal: { fontFamily: font.heavy, fontSize: 19, color: color.ink },
  phrase: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  phraseLocal: { fontFamily: font.heavy, fontSize: 20, lineHeight: 27, color: color.ink, marginTop: 2 },
  hair: { borderTopWidth: 2, borderTopColor: color.line },
});
