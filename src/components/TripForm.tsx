import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Back, Check, Close, Search } from '@/components/icons';
import { Bar, Button, T, Tap } from '@/components/ui';
import { COUNTRIES, byCode } from '@/data/countries';
import { GUIDES } from '@/data/guides';
import { PORTRAITS } from '@/data/images';
import type { Purpose, Trip } from '@/data/types';
import { addDays, dayKey, daysBetween, shortDate } from '@/lib/journey';
import { color, font, onColor, radius, shade } from '@/theme';

const STAY = [
  { d: 3, t: 'A weekend' },
  { d: 7, t: 'A week' },
  { d: 14, t: 'Two weeks' },
  { d: 30, t: 'A month' },
  { d: 90, t: 'Three months' },
];
const PURPOSE: { k: Purpose; t: string; s: string; tone: string }[] = [
  { k: 'holiday', t: 'Holiday', s: 'Sights, food, people', tone: color.orange },
  { k: 'business', t: 'Business', s: 'Meetings and dinners', tone: color.blue },
  { k: 'study', t: 'Study', s: 'Campus and new friends', tone: color.purple },
  { k: 'family', t: 'Family visit', s: 'Homes and gatherings', tone: color.green },
];
const QUESTIONS = ['What should I call you?', 'Where are you from?', 'Where are you headed?', 'When do you arrive?', 'How long are you staying?'];
const LAST = QUESTIONS.length - 1;
const ARRIVE = [
  { d: 0, t: 'I am there now' },
  { d: 1, t: 'Tomorrow' },
  { d: 7, t: 'In a week' },
  { d: 30, t: 'In a month' },
];

// The guide asks each question in a speech bubble.
function Ask({ q }: { q: string }) {
  return (
    <View style={styles.ask}>
      <Image source={PORTRAITS.south_f} style={styles.askFace} />
      <View style={styles.askBubble}>
        <T style={styles.askT}>{q}</T>
        <View style={styles.askTail} />
      </View>
    </View>
  );
}

type Props = { initial?: Trip | null; onDone: (t: Trip) => void; onClose?: () => void; doneLabel?: string };

export function TripForm({ initial, onDone, onClose, doneLabel = 'Build my plan' }: Props) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initial?.name ?? '');
  const [avatar, setAvatar] = useState<'m' | 'f'>(initial?.avatar ?? 'f');
  const [from, setFrom] = useState(initial?.from ?? '');
  const [to, setTo] = useState(initial?.to ?? '');
  const [days, setDays] = useState(initial?.days ?? 7);
  const [purpose, setPurpose] = useState<Purpose>(initial?.purpose ?? 'holiday');
  // Days from today until arrival. Negative means already there.
  const [off, setOff] = useState(initial?.arrive ? daysBetween(dayKey(), initial.arrive) : 0);
  const [q, setQ] = useState('');
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
  }, [step, anim]);

  const valid = [name.trim().length > 0, !!from, !!to, true, days > 0][step];
  const next = () => {
    if (step < LAST) { setStep(step + 1); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onDone({ name: name.trim(), avatar, from, to, days, purpose, arrive: addDays(dayKey(), off), createdAt: initial?.createdAt ?? Date.now() });
  };
  const back = () => (step > 0 ? setStep(step - 1) : onClose?.());

  const countries = useMemo(() => {
    const s = q.trim().toLowerCase();
    return COUNTRIES.filter((c) => !s || c.name.toLowerCase().includes(s)).sort((a, b) => a.name.localeCompare(b.name));
  }, [q]);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: color.white }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.head, { paddingTop: insets.top + 6 }]}>
        <Tap onPress={back} style={styles.iconBtn} disabled={step === 0 && !onClose}>
          {step === 0 ? (onClose ? <Close size={26} color={color.faint} stroke={2.6} /> : null) : <Back size={26} color={color.faint} stroke={2.6} />}
        </Tap>
        <View style={{ flex: 1 }}><Bar value={(step + 1) / QUESTIONS.length} /></View>
      </View>

      <Animated.View style={{ flex: 1, opacity: anim, transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }}>
        {step === 0 && (
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            <Ask q={QUESTIONS[0]} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your first name"
              placeholderTextColor={color.faint}
              style={styles.input}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              maxLength={24}
            />
            <T v="h3" style={{ marginTop: 26 }}>Pick your stand-in</T>
            <T v="small" style={{ marginTop: 2 }}>They play you in every scene.</T>
            <View style={styles.avatars}>
              {(['f', 'm'] as const).map((g) => {
                const on = avatar === g;
                return (
                  <Tap key={g} onPress={() => setAvatar(g)} style={[styles.option, styles.avatarCard, on && styles.optionOn]}>
                    <View style={styles.avatarFrame}>
                      <Image source={PORTRAITS[g === 'm' ? 'trav_m' : 'trav_f']} style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]} resizeMode="cover" />
                    </View>
                    <View style={styles.avatarFoot}>
                      <T style={[styles.optT, on && { color: color.blueDark }]}>{g === 'm' ? 'Him' : 'Her'}</T>
                      {on ? <View style={styles.tick}><Check size={14} color={color.white} stroke={3} /></View> : null}
                    </View>
                  </Tap>
                );
              })}
            </View>
          </ScrollView>
        )}

        {step === 1 && (
          <View style={[styles.body, { flex: 1, paddingBottom: 0 }]}>
            <Ask q={QUESTIONS[1]} />
            <View style={styles.search}>
              <Search color={color.faint} />
              <TextInput value={q} onChangeText={setQ} placeholder="Search countries" placeholderTextColor={color.faint} style={styles.searchInput} autoCorrect={false} />
            </View>
            <FlatList
              data={countries}
              keyExtractor={(c) => c.code}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => {
                const on = from === item.code;
                return (
                  <Tap onPress={() => setFrom(item.code)} style={[styles.option, styles.row, on && styles.optionOn]}>
                    <T style={styles.flag}>{item.flag}</T>
                    <T style={[styles.optT, { flex: 1 }, on && { color: color.blueDark }]}>{item.name}</T>
                    {on ? <View style={styles.tick}><Check size={14} color={color.white} stroke={3} /></View> : null}
                  </Tap>
                );
              }}
            />
          </View>
        )}

        {step === 2 && (
          <ScrollView contentContainerStyle={styles.body}>
            <Ask q={QUESTIONS[2]} />
            <View style={styles.grid}>
              {GUIDES.map((g) => {
                const c = byCode(g.code)!;
                const on = to === g.code;
                const home = from === g.code;
                const ink = onColor(g.color);
                return (
                  <Tap key={g.code} disabled={home} onPress={() => setTo(g.code)} style={[styles.tile, { backgroundColor: on ? g.color : color.white, borderColor: on ? shade(g.color) : color.line }, home && { opacity: 0.35 }]}>
                    <View style={styles.tileTop}>
                      <T style={{ fontSize: 24 }}>{c.flag}</T>
                      {on ? <View style={[styles.tick, { backgroundColor: color.white }]}><Check size={14} color={g.color} stroke={3} /></View> : home ? <T v="label">Home</T> : null}
                    </View>
                    <T numberOfLines={1} adjustsFontSizeToFit style={[styles.tileWord, { color: on ? ink : g.color === color.yellow ? color.yellowDark : g.color }]}>{g.hello.local}</T>
                    <T numberOfLines={1} style={[styles.tileName, on && { color: ink }]}>{c.name === 'United Arab Emirates' ? 'UAE' : c.name}</T>
                  </Tap>
                );
              })}
            </View>
          </ScrollView>
        )}

        {step === 3 && (
          <ScrollView contentContainerStyle={styles.body}>
            <Ask q={QUESTIONS[3]} />
            <View style={styles.daysRow}>
              <Tap onPress={() => setOff(Math.max(-365, off - 1))} style={styles.round}><T style={styles.roundT}>−</T></Tap>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <T style={styles.date}>{off === 0 ? 'Today' : off === 1 ? 'Tomorrow' : shortDate(addDays(dayKey(), off))}</T>
                <T style={styles.daysLabel}>{off < 0 ? `ARRIVED ${-off} ${off === -1 ? 'DAY' : 'DAYS'} AGO` : off > 0 ? `IN ${off} ${off === 1 ? 'DAY' : 'DAYS'}` : 'ALREADY THERE'}</T>
              </View>
              <Tap onPress={() => setOff(Math.min(365, off + 1))} style={styles.round}><T style={styles.roundT}>+</T></Tap>
            </View>
            <View style={styles.chips}>
              {ARRIVE.map((a) => {
                const on = off === a.d;
                return (
                  <Tap key={a.d} onPress={() => setOff(a.d)} style={[styles.chip, on && styles.optionOn]}>
                    <T style={[styles.chipT, on && { color: color.blueDark }]}>{a.t}</T>
                  </Tap>
                );
              })}
            </View>
            <T v="small" style={{ marginTop: 22, textAlign: 'center' }}>We use this to check in with you during the trip.</T>
          </ScrollView>
        )}

        {step === 4 && (
          <ScrollView contentContainerStyle={styles.body}>
            <Ask q={QUESTIONS[4]} />
            <View style={styles.daysRow}>
              <Tap onPress={() => setDays(Math.max(1, days - 1))} style={styles.round}><T style={styles.roundT}>−</T></Tap>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <T style={styles.days}>{days}</T>
                <T style={styles.daysLabel}>{days === 1 ? 'DAY' : 'DAYS'}</T>
              </View>
              <Tap onPress={() => setDays(Math.min(365, days + 1))} style={styles.round}><T style={styles.roundT}>+</T></Tap>
            </View>
            <View style={styles.chips}>
              {STAY.map((s) => {
                const on = days === s.d;
                return (
                  <Tap key={s.d} onPress={() => setDays(s.d)} style={[styles.chip, on && styles.optionOn]}>
                    <T style={[styles.chipT, on && { color: color.blueDark }]}>{s.t}</T>
                  </Tap>
                );
              })}
            </View>
            <T v="h3" style={{ marginTop: 28 }}>What brings you there?</T>
            <View style={styles.purposeGrid}>
              {PURPOSE.map((p) => {
                const on = purpose === p.k;
                return (
                  <Tap key={p.k} onPress={() => setPurpose(p.k)} style={[styles.purpose, on ? { backgroundColor: p.tone, borderColor: shade(p.tone) } : null]}>
                    <T style={[styles.optT, on && { color: color.white }]}>{p.t}</T>
                    <T v="small" style={[{ marginTop: 2 }, on && { color: 'rgba(255,255,255,0.92)' }]}>{p.s}</T>
                  </Tap>
                );
              })}
            </View>
          </ScrollView>
        )}
      </Animated.View>

      <View style={[styles.foot, { paddingBottom: insets.bottom + 12 }]}>
        <Button title={step < LAST ? 'Continue' : doneLabel} onPress={next} disabled={!valid} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 8, gap: 10 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 30 },
  ask: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  askFace: { width: 72, height: 90, borderRadius: 18, backgroundColor: color.blueSoft },
  askBubble: { flex: 1, borderWidth: 2, borderColor: color.line, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: color.white },
  askT: { fontFamily: font.heavy, fontSize: 19, lineHeight: 24, color: color.ink },
  askTail: { position: 'absolute', left: -8, top: '50%', marginTop: -7, width: 14, height: 14, backgroundColor: color.white, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: color.line, transform: [{ rotate: '45deg' }] },
  input: { fontFamily: font.heavy, fontSize: 20, color: color.ink, borderWidth: 2, borderColor: color.line, borderRadius: radius.md, backgroundColor: color.bgSoft, paddingHorizontal: 16, height: 58 },
  option: { borderWidth: 2, borderBottomWidth: 4, borderColor: color.line, borderRadius: radius.md, backgroundColor: color.white },
  optionOn: { backgroundColor: color.blueSoft, borderColor: '#84D8FF' },
  optT: { fontFamily: font.heavy, fontSize: 16, color: color.inkSoft },
  avatars: { flexDirection: 'row', gap: 12, marginTop: 12 },
  avatarCard: { flex: 1, overflow: 'hidden' },
  avatarFrame: { width: '100%', aspectRatio: 0.85, backgroundColor: color.blueSoft },
  avatarFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10 },
  tick: { width: 24, height: 24, borderRadius: 12, backgroundColor: color.blue, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, backgroundColor: color.bgSoft, borderRadius: radius.md, paddingHorizontal: 14, height: 50, borderWidth: 2, borderColor: color.line },
  searchInput: { flex: 1, fontFamily: font.bold, fontSize: 16, color: color.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, height: 58, marginBottom: 8 },
  flag: { fontSize: 26, width: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '48.3%', borderRadius: radius.lg, padding: 14, borderWidth: 2, borderBottomWidth: 5, minHeight: 118, justifyContent: 'space-between' },
  tileTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tileWord: { fontFamily: font.black, fontSize: 24, lineHeight: 32, marginTop: 6 },
  tileName: { fontFamily: font.heavy, fontSize: 14.5, color: color.inkSoft },
  daysRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  round: { width: 58, height: 58, borderRadius: 18, borderWidth: 2, borderBottomWidth: 5, borderColor: color.line, alignItems: 'center', justifyContent: 'center', backgroundColor: color.white },
  roundT: { fontFamily: font.black, fontSize: 28, color: color.blue, lineHeight: 32 },
  days: { fontFamily: font.black, fontSize: 80, lineHeight: 88, color: color.ink },
  date: { fontFamily: font.black, fontSize: 34, lineHeight: 44, color: color.ink, textAlign: 'center' },
  daysLabel: { fontFamily: font.heavy, fontSize: 14, color: color.faint, letterSpacing: 1.2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18, justifyContent: 'center' },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14, borderWidth: 2, borderBottomWidth: 4, borderColor: color.line, backgroundColor: color.white },
  chipT: { fontFamily: font.heavy, fontSize: 14, color: color.inkSoft },
  purposeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  purpose: { width: '48.3%', padding: 14, borderRadius: radius.lg, borderWidth: 2, borderBottomWidth: 5, borderColor: color.line, backgroundColor: color.white },
  foot: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 2, borderTopColor: color.line, backgroundColor: color.white },
});
