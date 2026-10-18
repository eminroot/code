import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Close } from '@/components/icons';
import { Face, moodColor, Week } from '@/components/Mood';
import { Button, T, Tap } from '@/components/ui';
import type { Mood, Struggle } from '@/data/types';
import { dayKey, dayLabel, MOODS, question, stageOf, stageText, STRUGGLES, struggling, tipsFor, tripDay, type Action } from '@/lib/journey';
import { useStore } from '@/lib/store';
import { useTrip } from '@/lib/useTrip';
import { color, font, radius, shade, tint } from '@/theme';

export default function CheckinScreen() {
  const ctx = useTrip();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mood?: string }>();
  const { checkins, addCheckin } = useStore();
  const today = checkins.find((c) => c.day === dayKey());
  const start = Number(params.mood) as Mood;
  const [mood, setMood] = useState<Mood | null>(start >= 1 && start <= 5 ? start : today?.mood ?? null);
  const [hard, setHard] = useState<Struggle[]>(today?.hard ?? []);
  // Opened from a face: go straight to what is hard. Opened after checking in: show the answer.
  const [step, setStep] = useState<'mood' | 'hard' | 'done'>(start >= 1 && start <= 5 ? 'hard' : today ? 'done' : 'mood');

  const tips = useMemo(() => (ctx && mood ? tipsFor({ mood, hard }, ctx.from, ctx.to) : []), [ctx, mood, hard]);
  if (!ctx) return null;
  const { trip, to } = ctx;
  const day = tripDay(trip);
  const stage = stageOf(trip, day);
  const st = stageText(stage, trip);

  const save = () => {
    if (!mood) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    addCheckin({ day: dayKey(), mood, hard, at: Date.now() });
    setStep('done');
  };
  const toggle = (k: Struggle) => setHard((h) => (h.includes(k) ? h.filter((x) => x !== k) : [...h, k]));
  const act = (a: Action) => {
    if (a.ask) router.dismissTo({ pathname: '/(tabs)/coach', params: { ask: a.ask } });
    else if (a.href === '/practice') router.replace('/practice');
    else if (a.href) router.dismissTo(a.href);
  };
  // Today's answer counts towards the warning straight away.
  const all = mood ? [...checkins.filter((c) => c.day !== dayKey()), { day: dayKey(), mood, hard, at: 0 }] : checkins;
  const low = step === 'done' && struggling(all);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 6 }]}>
      <View style={styles.head}>
        <Tap onPress={() => router.back()} style={styles.iconBtn}><Close size={26} color={color.faint} stroke={2.6} /></Tap>
        <T style={styles.headT}>{dayLabel(trip, day, to.name)}</T>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {step === 'mood' ? (
          <>
            <T v="h1">{question(stage)}</T>
            <View style={styles.moods}>
              {MOODS.map((m) => {
                const on = mood === m.v;
                return (
                  <Tap key={m.v} onPress={() => setMood(m.v)} style={[styles.mood, on && { borderColor: shade(moodColor(m.v)), backgroundColor: tint(moodColor(m.v), 0.8) }]}>
                    <Face mood={m.v} size={50} />
                    <T style={styles.moodT}>{m.t}</T>
                  </Tap>
                );
              })}
            </View>
          </>
        ) : null}

        {step === 'hard' && mood ? (
          <>
            <View style={styles.picked}>
              <Face mood={mood} size={40} />
              <Tap onPress={() => setStep('mood')}><T style={styles.change}>Feeling {MOODS[mood - 1].t.toLowerCase()}. Change</T></Tap>
            </View>
            <T v="h1" style={{ marginTop: 14 }}>{mood >= 4 ? 'Anything getting in the way?' : 'What is hardest right now?'}</T>
            <T v="body" style={{ marginTop: 4, color: color.muted }}>Pick any that fit, or none.</T>
            <View style={styles.chips}>
              {STRUGGLES.map((s) => {
                const on = hard.includes(s.k);
                return (
                  <Tap key={s.k} onPress={() => toggle(s.k)} style={[styles.chip, on && styles.chipOn]}>
                    {on ? <Check size={16} color={color.blueDark} stroke={3} /> : null}
                    <T style={[styles.chipT, on && { color: color.blueDark }]}>{s.t}</T>
                  </Tap>
                );
              })}
            </View>
          </>
        ) : null}

        {step === 'done' && mood ? (
          <>
            <View style={styles.picked}>
              <Face mood={mood} size={56} />
              <View style={{ flex: 1 }}>
                <T v="h2">Feeling {MOODS[mood - 1].t.toLowerCase()}</T>
                {hard.length ? <T v="small">{hard.map((k, n) => { const t = STRUGGLES.find((s) => s.k === k)?.t ?? ''; return n ? t.toLowerCase() : t; }).join(', ')}</T> : null}
              </View>
              <Tap onPress={() => setStep('mood')} style={styles.editBtn}><T style={styles.editT}>Edit</T></Tap>
            </View>

            <View style={styles.stage}>
              <T style={styles.stageLabel}>{st.title}</T>
              <T v="body" style={{ marginTop: 4, color: color.ink }}>{st.body}</T>
            </View>

            {low ? (
              <View style={styles.low}>
                <T v="h3" style={{ color: color.redDark }}>It has been a hard few days</T>
                <T v="body" style={{ marginTop: 6, color: color.ink }}>
                  That happens to a lot of people abroad, and it usually lifts. Talk to someone you trust, keep meals and sleep regular, and get outside in daylight. If it feels heavy or does not lift, speak to a doctor or counsellor. Universities and many employers offer free support.
                </T>
              </View>
            ) : null}

            <T v="h3" style={{ marginTop: 22, marginBottom: 10 }}>For today</T>
            {tips.map((t, i) => (
              <View key={i} style={[styles.tip, i > 0 && styles.tipLine]}>
                <T v="body" style={{ color: color.ink }}>{t.text}</T>
                {t.action ? (
                  <Tap onPress={() => act(t.action!)} style={styles.tipAct}>
                    <T style={styles.tipActT}>{t.action.label}</T>
                  </Tap>
                ) : null}
              </View>
            ))}

            <T v="h3" style={{ marginTop: 24, marginBottom: 12 }}>This week</T>
            <Week checkins={all} size={32} />
          </>
        ) : null}
      </ScrollView>

      <View style={[styles.foot, { paddingBottom: insets.bottom + 12 }]}>
        {step === 'mood' ? <Button title="Continue" disabled={!mood} onPress={() => setStep('hard')} /> : null}
        {step === 'hard' ? <Button title="Save" onPress={save} /> : null}
        {step === 'done' ? <Button title="Done" onPress={() => router.back()} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.white },
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 6 },
  headT: { flex: 1, textAlign: 'center', fontFamily: font.heavy, fontSize: 15, color: color.muted },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  moods: { marginTop: 22, gap: 10 },
  mood: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: radius.lg, borderWidth: 2, borderBottomWidth: 4, borderColor: color.line },
  moodT: { fontFamily: font.heavy, fontSize: 18, color: color.ink },
  picked: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  change: { fontFamily: font.heavy, fontSize: 15, color: color.blue },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, height: 46, borderRadius: 14, borderWidth: 2, borderBottomWidth: 4, borderColor: color.line },
  chipOn: { backgroundColor: color.blueSoft, borderColor: '#84D8FF' },
  chipT: { fontFamily: font.heavy, fontSize: 15, color: color.inkSoft },
  editBtn: { paddingHorizontal: 12, height: 34, borderRadius: 12, justifyContent: 'center', borderWidth: 2, borderColor: color.line },
  editT: { fontFamily: font.heavy, fontSize: 14, color: color.muted },
  stage: { marginTop: 20, paddingLeft: 14, borderLeftWidth: 4, borderLeftColor: color.purple },
  stageLabel: { fontFamily: font.heavy, fontSize: 14, color: color.purpleDark },
  low: { marginTop: 20, padding: 16, borderRadius: radius.lg, backgroundColor: color.redSoft },
  tip: { paddingVertical: 12 },
  tipLine: { borderTopWidth: 2, borderTopColor: color.line },
  tipAct: { alignSelf: 'flex-start', marginTop: 8 },
  tipActT: { fontFamily: font.heavy, fontSize: 15, color: color.blue },
  foot: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 2, borderTopColor: color.line, backgroundColor: color.white },
});
