import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Close } from '@/components/icons';
import { Stage } from '@/components/Stage';
import { Bar, Button, T, Tap } from '@/components/ui';
import { byCode } from '@/data/countries';
import { QUIZ } from '@/data/quiz';
import type { Guide, Scene, SceneCat } from '@/data/types';
import { useStore } from '@/lib/store';
import { useTrip } from '@/lib/useTrip';
import { stageScene } from '@/stage/scene';
import { color, font, radius } from '@/theme';

const ROUND = 5;

function shuffle<T>(list: T[], seed: number) {
  const out = [...list];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Scenes you have watched but not yet answered come first.
function pickRound(guide: Guide, seen: string[], practiced: string[], unit?: string) {
  const all = guide.scenes.filter((s) => QUIZ[s.id]);
  const rank = (s: Scene) => (practiced.includes(s.id) ? 2 : 0) + (seen.includes(s.id) ? 0 : 1);
  const order = (list: Scene[]) => list.map((s, i) => ({ s, i })).sort((a, b) => rank(a.s) - rank(b.s) || a.i - b.i).map((x) => x.s);
  const mine = order(all.filter((s) => !unit || s.cat === unit));
  // A unit with only one or two scenes borrows a few others so a round is worth starting.
  const extra = mine.length < 3 ? order(all.filter((s) => !mine.includes(s))).slice(0, 3 - mine.length) : [];
  return [...mine, ...extra].slice(0, ROUND);
}

const firstSentence = (s: string) => s.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? s;

export default function Practice() {
  const ctx = useTrip();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { unit } = useLocalSearchParams<{ unit?: SceneCat }>();
  const { seen, practiced, markPracticed } = useStore();
  const [round, setRound] = useState(() => ({ seed: Date.now() % 10000, list: ctx ? pickRound(ctx.guide, seen, practiced, unit) : [] }));
  const [before] = useState(() => new Set(practiced));
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const scene = round.list[i];
  const quiz = scene ? QUIZ[scene.id] : null;
  const options = useMemo(() => (quiz ? shuffle([quiz.right, ...quiz.wrong], round.seed + i * 17) : []), [quiz, round.seed, i]);
  const right = !!quiz && pick === quiz.right;
  // A wrong pick on a scene with an avoid version plays that mistake.
  const mode: 'do' | 'avoid' = checked && !right && scene?.avoid && pick === quiz?.wrong[0] ? 'avoid' : 'do';
  const who = useMemo(() => (ctx ? { name: ctx.trip.name.split(' ')[0], home: byCode(ctx.trip.from)?.name ?? 'home' } : undefined), [ctx]);
  const spec = useMemo(() => (ctx && scene ? stageScene(scene, ctx.guide, ctx.trip.avatar, mode, who) : null), [ctx, scene, mode, who]);

  if (!ctx) return null;
  const done = i >= round.list.length;

  const check = () => {
    if (!pick || !quiz || !scene) return;
    const ok = pick === quiz.right;
    Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
    if (ok) markPracticed([scene.id]);
    setResults((r) => [...r, ok]);
    setChecked(true);
  };
  const next = () => { setI(i + 1); setPick(null); setChecked(false); };
  const again = () => {
    setRound({ seed: Date.now() % 10000, list: pickRound(ctx.guide, seen, practiced, unit) });
    setI(0); setPick(null); setChecked(false); setResults([]);
  };

  if (!round.list.length) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top + 20 }]}>
        <T v="h2">Nothing to practise here yet</T>
        <Button title="Back" onPress={() => router.back()} style={{ marginTop: 20, alignSelf: 'stretch', marginHorizontal: 24 }} />
      </View>
    );
  }

  if (done) {
    const score = results.filter(Boolean).length;
    const earned = round.list.filter((s, k) => results[k] && !before.has(s.id)).length * 5;
    return (
      <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <T style={styles.big}>{score} of {round.list.length} right</T>
          <T v="body" style={{ textAlign: 'center', marginTop: 6 }}>
            {score === round.list.length ? 'Every one. You are ready for these.' : 'Watch the ones you missed once more, then try again.'}
          </T>
          {earned ? <View style={styles.xp}><T style={styles.xpT}>+{earned} XP</T></View> : null}
          <View style={{ marginTop: 24 }}>
            {round.list.map((s, k) => (
              <Tap key={s.id} onPress={() => router.push({ pathname: '/scene/[id]', params: { id: s.id } })} style={[styles.result, k > 0 && styles.resultLine]}>
                <View style={[styles.mark, { backgroundColor: results[k] ? color.green : color.red }]}>
                  {results[k] ? <Check size={16} color={color.white} stroke={3} /> : <Close size={16} color={color.white} stroke={3} />}
                </View>
                <View style={{ flex: 1 }}>
                  <T v="title">{s.title}</T>
                  <T v="small">{QUIZ[s.id].right}</T>
                </View>
              </Tap>
            ))}
          </View>
        </ScrollView>
        <View style={[styles.foot, { paddingBottom: insets.bottom + 12, flexDirection: 'row', gap: 10 }]}>
          <Button title="Again" outline tone={color.blue} onPress={again} style={{ flex: 1 }} />
          <Button title="Done" onPress={() => router.back()} style={{ flex: 1 }} />
        </View>
      </View>
    );
  }

  const tone = right ? color.green : color.red;
  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + 6 }]}>
        <Tap onPress={() => router.back()} style={styles.iconBtn}><Close size={26} color={color.faint} stroke={2.6} /></Tap>
        <View style={{ flex: 1 }}><Bar value={(i + (checked ? 1 : 0)) / round.list.length} /></View>
      </View>

      <View style={{ height: Math.round(height * 0.36) }}>
        <Stage scene={spec} hold={!checked} style={StyleSheet.absoluteFillObject} />
        {checked ? (
          <View style={[styles.playing, { backgroundColor: mode === 'avoid' ? color.red : color.green }]}>
            <T style={styles.playingT}>{mode === 'avoid' ? 'WHAT HAPPENS' : 'THE RIGHT WAY'}</T>
          </View>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <T v="small">{scene.title}</T>
        <T v="h2" style={{ marginTop: 4 }}>{quiz!.q}</T>
        <T v="body" style={{ marginTop: 2, color: color.muted }}>What do you do?</T>
        <View style={{ marginTop: 14, gap: 10 }}>
          {options.map((o) => {
            const isPick = pick === o;
            const isRight = o === quiz!.right;
            const show = checked && (isRight || isPick);
            const ring = show ? (isRight ? color.green : color.red) : isPick ? '#84D8FF' : color.line;
            const fill = show ? (isRight ? color.greenSoft : color.redSoft) : isPick ? color.blueSoft : color.white;
            return (
              <Tap key={o} disabled={checked} onPress={() => setPick(o)} style={[styles.option, { borderColor: ring, backgroundColor: fill }]}>
                <T style={[styles.optionT, show && { color: isRight ? color.greenDark : color.redDark }, !checked && isPick && { color: color.blueDark }]}>{o}</T>
              </Tap>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.foot, { paddingBottom: insets.bottom + 12 }, checked && { backgroundColor: right ? color.greenSoft : color.redSoft, borderTopColor: 'transparent' }]}>
        {checked ? (
          <View style={{ marginBottom: 12 }}>
            <T style={[styles.verdict, { color: right ? color.greenDark : color.redDark }]}>{right ? 'Correct' : 'Not quite'}</T>
            {!right ? <T style={[styles.feedback, { color: color.redDark }]}>Better: {quiz!.right}.</T> : null}
            <T style={[styles.feedback, { color: right ? color.greenDark : color.redDark }]}>{firstSentence(scene.why)}</T>
          </View>
        ) : null}
        {checked
          ? <Button title="Continue" tone={tone} onPress={next} />
          : <Button title="Check" disabled={!pick} onPress={check} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.white },
  center: { alignItems: 'center', justifyContent: 'center' },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingBottom: 10 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  playing: { position: 'absolute', bottom: 12, alignSelf: 'center', paddingHorizontal: 14, height: 30, borderRadius: 12, justifyContent: 'center' },
  playingT: { fontFamily: font.heavy, fontSize: 12.5, color: color.white, letterSpacing: 0.8 },
  option: { paddingHorizontal: 16, paddingVertical: 14, borderRadius: radius.md, borderWidth: 2, borderBottomWidth: 4 },
  optionT: { fontFamily: font.bold, fontSize: 16, lineHeight: 22, color: color.ink },
  foot: { paddingHorizontal: 16, paddingTop: 14, borderTopWidth: 2, borderTopColor: color.line, backgroundColor: color.white },
  verdict: { fontFamily: font.black, fontSize: 22 },
  feedback: { fontFamily: font.bold, fontSize: 15, lineHeight: 21, marginTop: 4 },
  big: { fontFamily: font.black, fontSize: 34, color: color.ink, textAlign: 'center', marginTop: 20 },
  xp: { alignSelf: 'center', marginTop: 16, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14, backgroundColor: color.blueSoft },
  xpT: { fontFamily: font.heavy, fontSize: 17, color: color.blueDark },
  result: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  resultLine: { borderTopWidth: 2, borderTopColor: color.line },
  mark: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
