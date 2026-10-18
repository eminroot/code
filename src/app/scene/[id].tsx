import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bookmark, Close, Pause, Play, Replay, Speaker } from '@/components/icons';
import { Stage, type StageHandle } from '@/components/Stage';
import { Bar, Button, Card, T, Tap } from '@/components/ui';
import { byCode } from '@/data/countries';
import { findScene } from '@/data/guides';
import { explain } from '@/lib/coach';
import { say } from '@/lib/speech';
import { useStore } from '@/lib/store';
import { stageScene } from '@/stage/scene';
import { color, font, radius, shade } from '@/theme';

const CAMS = [
  { k: 'three', t: 'Wide' },
  { k: 'side', t: 'Side' },
  { k: 'close', t: 'Close' },
  { k: 'pov', t: 'Your eyes' },
];

export default function ScenePlayer() {
  const { id, mode: startMode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { trip, seen, markSeen, saved, toggleSaved } = useStore();
  const found = useMemo(() => (id ? findScene(id) : null), [id]);
  const [mode, setMode] = useState<'do' | 'avoid'>(startMode === 'avoid' ? 'avoid' : 'do');
  const [cam, setCam] = useState('three');
  const [slow, setSlow] = useState(false);
  const [paused, setPaused] = useState(false);
  const [beat, setBeat] = useState(0);
  const [story, setStory] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [won, setWon] = useState(false);
  const sheet = useRef(new Animated.Value(0)).current;
  const stage = useRef<StageHandle>(null);

  const scene = found?.scene;
  const guide = found?.guide;
  const who = useMemo(() => (trip ? { name: trip.name.split(' ')[0], home: byCode(trip.from)?.name ?? 'home' } : undefined), [trip]);
  const stageSpec = useMemo(() => (scene && guide && trip ? stageScene(scene, guide, trip.avatar, mode, who) : null), [scene, guide, trip, mode, who]);

  useEffect(() => {
    if (won) Animated.spring(sheet, { toValue: 1, useNativeDriver: true, friction: 7 }).start();
  }, [won, sheet]);

  if (!scene || !guide || !trip) {
    return <View style={[styles.root, { paddingTop: insets.top + 20, paddingHorizontal: 22 }]}><T v="h2">Scene not found</T></View>;
  }

  const steps = mode === 'avoid' && scene.avoidSteps ? scene.avoidSteps : scene.steps;
  const stageH = Math.round(height * 0.5);
  const isSaved = saved.includes(scene.id);
  const avoid = mode === 'avoid';
  const already = seen.includes(scene.id);
  const cur = Math.min(beat, steps.length - 1);

  const tell = async () => {
    setBusy(true);
    const text = await explain(trip, guide, { title: scene.title, sub: scene.sub, body: scene.why });
    setStory(text);
    setBusy(false);
  };

  const seekStep = (i: number) => {
    const perf = avoid && scene.avoid ? scene.avoid : scene.do;
    stage.current?.seek(perf.beats[Math.min(i, perf.beats.length - 1)] ?? 0);
    setBeat(i);
    setPaused(false);
  };

  const finish = () => {
    if (already) { router.back(); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    markSeen(scene.id);
    setWon(true);
  };

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + 6 }]}>
        <Tap onPress={() => router.back()} style={styles.iconBtn}><Close size={26} color={color.faint} stroke={2.6} /></Tap>
        <View style={{ flex: 1 }}><Bar value={(cur + 1) / steps.length} tone={avoid ? color.red : color.green} /></View>
        <Tap onPress={() => toggleSaved(scene.id)} style={styles.iconBtn}><Bookmark size={24} color={isSaved ? color.yellow : color.faint} stroke={2.2} filled={isSaved} /></Tap>
      </View>

      <View style={{ height: stageH }}>
        <Stage ref={stage} scene={stageSpec} camera={cam} speed={slow ? 0.5 : 1} paused={paused} style={StyleSheet.absoluteFillObject} onBeat={setBeat} onCycle={() => setBeat(0)} />
        {avoid ? <View style={styles.avoidPill}><T style={styles.avoidPillT}>WHAT NOT TO DO</T></View> : null}
        <View style={styles.camRow}>
          {CAMS.map((c) => (
            <Tap key={c.k} onPress={() => setCam(c.k)} style={[styles.cam, cam === c.k && styles.camOn]}>
              <T style={[styles.camT, cam === c.k && { color: color.blueDark }]}>{c.t}</T>
            </Tap>
          ))}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.controls}>
          {scene.avoid ? (
            <View style={{ flexDirection: 'row', gap: 8, flex: 1 }}>
              <Button small title="Do" tone={color.green} outline={mode !== 'do'} onPress={() => { setMode('do'); setBeat(0); setPaused(false); }} style={{ flex: 1 }} />
              <Button small title="Avoid" tone={color.red} outline={mode !== 'avoid'} onPress={() => { setMode('avoid'); setBeat(0); setPaused(false); }} style={{ flex: 1 }} />
            </View>
          ) : <View style={{ flex: 1 }} />}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Tap onPress={() => setSlow(!slow)} style={[styles.ctrl, slow && styles.ctrlOn]}><T style={[styles.ctrlT, slow && { color: color.blueDark }]}>{slow ? '½×' : '1×'}</T></Tap>
            <Tap onPress={() => { stage.current?.restart(); setBeat(0); setPaused(false); }} style={styles.ctrl}><Replay size={20} color={color.muted} stroke={2.2} /></Tap>
            <Tap onPress={() => setPaused(!paused)} style={styles.ctrl}>{paused ? <Play size={18} color={color.muted} /> : <Pause size={18} color={color.muted} />}</Tap>
          </View>
        </View>

        <View style={styles.pad}>
          <T v="h1" style={{ marginTop: 16 }}>{scene.title}</T>
          <T v="body" style={{ marginTop: 2, color: color.muted }}>{scene.sub}</T>

          <View style={{ marginTop: 14 }}>
            {steps.map((s, i) => {
              const on = i === cur;
              const tone = avoid ? color.red : color.blue;
              return (
                <Tap key={i} onPress={() => seekStep(i)} style={[styles.step, on && { backgroundColor: avoid ? color.redSoft : color.blueSoft, borderColor: avoid ? '#FFB2B2' : '#84D8FF' }]}>
                  <View style={[styles.stepNum, on ? { backgroundColor: tone, borderColor: shade(tone) } : null]}>
                    <T style={[styles.stepNumT, on && { color: color.white }]}>{i + 1}</T>
                  </View>
                  <T style={[styles.stepT, on && { color: avoid ? color.redDark : color.blueDark }]}>{s}</T>
                </Tap>
              );
            })}
          </View>

          {scene.say ? (
            <Card tone={color.blueSoft} style={[styles.sayCard, { borderColor: '#84D8FF' }]}>
              <View style={{ flex: 1 }}>
                <T style={styles.cardLabel}>SAY IT</T>
                <T style={styles.sayLocal}>{scene.say.local}</T>
                {scene.say.roman ? <T style={styles.sayRoman}>{scene.say.roman}</T> : null}
                <T v="small" style={{ marginTop: 2 }}>{scene.say.en}</T>
              </View>
              <Tap onPress={() => { setSpeaking(true); say(scene.say!, guide.lang, () => setSpeaking(false)); }} style={[styles.speak, speaking && { backgroundColor: color.orange, borderColor: color.orangeDark }]}>
                <Speaker size={24} color={color.white} stroke={2.2} />
              </Tap>
            </Card>
          ) : null}

          <Card tone={color.yellowSoft} style={{ marginTop: 14, borderColor: '#FFE38A' }}>
            <T style={[styles.cardLabel, { color: color.yellowDark }]}>WHY IT MATTERS</T>
            <T v="body" style={{ marginTop: 6, color: color.ink }}>{story ?? scene.why}</T>
            {story ? null : busy ? (
              <View style={styles.busy}><ActivityIndicator color={color.yellowDark} /><T v="small">Writing your story</T></View>
            ) : (
              <Button small outline title="Tell me the story" tone={color.yellowDark} onPress={tell} style={{ marginTop: 12 }} />
            )}
          </Card>

          <Tap onPress={() => router.push({ pathname: '/(tabs)/coach', params: { ask: `About "${scene.title}": ` } })} style={styles.coachLink}>
            <T v="bodyStrong" style={{ flex: 1, color: color.green }}>Ask the coach about this moment</T>
            <T style={{ fontSize: 20, color: color.green, fontFamily: font.heavy }}>›</T>
          </Tap>
        </View>
      </ScrollView>

      <View style={[styles.foot, { paddingBottom: insets.bottom + 10 }]}>
        <Button title={already ? 'Done' : 'I got it  +10 XP'} onPress={finish} />
      </View>

      {won ? (
        <Animated.View style={[styles.win, { paddingBottom: insets.bottom + 14, transform: [{ translateY: sheet.interpolate({ inputRange: [0, 1], outputRange: [260, 0] }) }] }]}>
          <View style={styles.winRow}>
            <View style={styles.winBadge}><T style={styles.winBadgeT}>✓</T></View>
            <View style={{ flex: 1 }}>
              <T style={styles.winTitle}>Nice work!</T>
              <T style={styles.winSub}>+10 XP · {scene.title}</T>
            </View>
          </View>
          <Button title="Continue" onPress={() => router.back()} style={{ marginTop: 14 }} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingBottom: 10, backgroundColor: color.white },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  avoidPill: { position: 'absolute', bottom: 54, alignSelf: 'center', backgroundColor: color.red, paddingHorizontal: 14, height: 30, borderRadius: 12, justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: color.redDark },
  avoidPillT: { fontFamily: font.heavy, fontSize: 12.5, color: color.white, letterSpacing: 0.8 },
  camRow: { position: 'absolute', left: 0, right: 0, bottom: 12, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  cam: { paddingHorizontal: 12, height: 32, borderRadius: 12, justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 2, borderColor: color.line },
  camOn: { backgroundColor: color.blueSoft, borderColor: '#84D8FF' },
  camT: { fontFamily: font.heavy, fontSize: 12.5, color: color.muted },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 14 },
  ctrl: { width: 44, height: 44, borderRadius: 14, borderWidth: 2, borderBottomWidth: 4, borderColor: color.line, alignItems: 'center', justifyContent: 'center', backgroundColor: color.white },
  ctrlOn: { backgroundColor: color.blueSoft, borderColor: '#84D8FF' },
  ctrlT: { fontFamily: font.heavy, fontSize: 15, color: color.muted },
  pad: { paddingHorizontal: 16 },
  step: { flexDirection: 'row', gap: 12, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center', borderRadius: radius.md, borderWidth: 2, borderColor: 'transparent', marginBottom: 6 },
  stepNum: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: color.line, alignItems: 'center', justifyContent: 'center' },
  stepNumT: { fontFamily: font.heavy, fontSize: 13, color: color.faint },
  stepT: { flex: 1, fontFamily: font.bold, fontSize: 15.5, lineHeight: 22, color: color.muted },
  sayCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  cardLabel: { fontFamily: font.heavy, fontSize: 12, letterSpacing: 0.8, color: color.blueDark },
  sayLocal: { fontFamily: font.black, fontSize: 26, lineHeight: 34, color: color.ink, marginTop: 4 },
  sayRoman: { fontFamily: font.bold, fontSize: 15, color: color.blueDark },
  speak: { width: 58, height: 58, borderRadius: 29, backgroundColor: color.blue, borderBottomWidth: 5, borderColor: color.blueDark, alignItems: 'center', justifyContent: 'center' },
  busy: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  coachLink: { flexDirection: 'row', alignItems: 'center', marginTop: 16, padding: 16, borderRadius: radius.lg, borderWidth: 2, borderBottomWidth: 4, borderColor: color.line },
  foot: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 2, borderTopColor: color.line, backgroundColor: color.white },
  win: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: color.greenSoft, paddingHorizontal: 16, paddingTop: 18, borderTopWidth: 2, borderTopColor: '#A5ED6E' },
  winRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  winBadge: { width: 52, height: 52, borderRadius: 26, backgroundColor: color.white, alignItems: 'center', justifyContent: 'center' },
  winBadgeT: { fontFamily: font.black, fontSize: 26, color: color.green },
  winTitle: { fontFamily: font.black, fontSize: 24, color: color.greenDark },
  winSub: { fontFamily: font.heavy, fontSize: 15, color: color.greenDark, opacity: 0.85 },
});
