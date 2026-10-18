import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Book, Check, Star, Trophy } from '@/components/icons';
import { TopBar } from '@/components/TopBar';
import { Bar, Button, T, Tap } from '@/components/ui';
import { PORTRAITS } from '@/data/images';
import type { Scene, SceneCat } from '@/data/types';
import { useStore } from '@/lib/store';
import { useTrip } from '@/lib/useTrip';
import { color, font, onColor, radius, shade, tint } from '@/theme';

const UNITS: { cat: SceneCat; color: string; title: string; sub: (c: string) => string }[] = [
  { cat: 'greet', color: color.green, title: 'Saying hello', sub: (c) => `Greet people the way they do in ${c}` },
  { cat: 'gesture', color: color.purple, title: 'Hands and gestures', sub: () => 'What your hands are really saying' },
  { cat: 'home', color: color.orange, title: 'Homes and gifts', sub: () => 'Visiting, giving and receiving' },
  { cat: 'business', color: color.blue, title: 'Doing business', sub: () => 'Meetings and first impressions' },
  { cat: 'out', color: color.red, title: 'Out and about', sub: () => 'Streets, shops and trains' },
];
// Nodes swing away from the side where the local person stands.
const ZIG = [0, -60, -86, -60, -20, -60, -86, -60];

export default function Learn() {
  const ctx = useTrip();
  const { seen } = useStore();
  const [open, setOpen] = useState<string | null>(null);

  const units = useMemo(() => {
    if (!ctx) return [];
    return UNITS.map((u) => ({ ...u, scenes: ctx.guide.scenes.filter((s) => s.cat === u.cat) })).filter((u) => u.scenes.length);
  }, [ctx]);
  if (!ctx) return null;
  const { guide, to, trip } = ctx;

  const all = units.flatMap((u) => u.scenes);
  const current = all.find((s) => !seen.includes(s.id))?.id ?? null;
  const done = all.filter((s) => seen.includes(s.id)).length;
  const face = (i: number) => PORTRAITS[i % 2 === 0 ? guide.avatars.m : guide.avatars.f] ?? PORTRAITS[guide.avatars.m];
  const greetTone = guide.color;

  const go = (s: Scene) => { setOpen(null); router.push({ pathname: '/scene/[id]', params: { id: s.id } }); };

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <TopBar />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.hello, { backgroundColor: greetTone, borderColor: shade(greetTone) }]}>
          <T style={[styles.helloSmall, { color: onColor(greetTone) }]}>{guide.hello.roman ? guide.hello.local : 'Say it like a local'}</T>
          <T style={[styles.helloBig, { color: onColor(greetTone) }]}>{guide.hello.roman ?? guide.hello.local}, {trip.name.split(' ')[0]}!</T>
          <T style={[styles.helloSub, { color: onColor(greetTone) }]}>{done === all.length ? `You know the ${to.name} basics. Brilliant.` : `${all.length - done} scenes left before you land in ${to.name}.`}</T>
          <View style={{ marginTop: 14 }}>
            <Bar value={done / Math.max(1, all.length)} tone={color.yellow} track="rgba(255,255,255,0.35)" height={14} />
          </View>
        </View>

        {units.map((u, ui) => (
          <View key={u.cat} style={{ marginTop: 26 }}>
            <View style={[styles.unit, { backgroundColor: u.color, borderColor: shade(u.color) }]}>
              <View style={{ flex: 1 }}>
                <T style={styles.unitLabel}>Unit {ui + 1}</T>
                <T style={styles.unitTitle}>{u.title}</T>
                <T style={styles.unitSub}>{u.sub(to.name)}</T>
              </View>
              <Tap onPress={() => router.push('/(tabs)/brief')} style={[styles.guideBtn, { borderColor: tint(u.color, 0.35) }]}>
                <Book size={22} />
              </Tap>
            </View>

            <View style={[styles.path, { minHeight: Math.max(186, u.scenes.length * 96 + 56) }]}>
              {u.scenes.map((s, i) => {
                const isDone = seen.includes(s.id);
                const isCur = s.id === current;
                const off = ZIG[i % ZIG.length] * (ui % 2 === 0 ? 1 : -1);
                const tone = isDone ? color.yellow : isCur ? u.color : '#E5E5E5';
                const isOpen = open === s.id;
                return (
                  <View key={s.id} style={{ alignItems: 'center', width: '100%' }}>
                    <View style={{ transform: [{ translateX: off }], alignItems: 'center', marginTop: i === 0 ? 8 : 16 }}>
                      {isCur && !isOpen ? (
                        <View style={styles.start}>
                          <T style={[styles.startT, { color: u.color }]}>START</T>
                          <View style={styles.startTail} />
                        </View>
                      ) : null}
                      <Tap haptic onPress={() => setOpen(isOpen ? null : s.id)} style={[styles.nodeLip, { backgroundColor: shade(tone) }]}>
                        <View style={[styles.node, { backgroundColor: tone }]}>
                          {isDone ? <Check size={34} color="#FFFFFF" stroke={3.4} /> : <Star size={34} color={isCur ? '#FFFFFF' : '#AFAFAF'} />}
                        </View>
                      </Tap>
                      {isCur ? <View style={[styles.ring, { borderColor: tint(u.color, 0.55) }]} pointerEvents="none" /> : null}
                    </View>
                    {isOpen ? (
                      <View style={[styles.pop, { backgroundColor: isDone ? color.yellow : isCur ? u.color : color.white, borderColor: isDone ? color.yellowDark : isCur ? shade(u.color) : color.line }]}>
                        <T style={[styles.popTitle, { color: isDone || isCur ? onColor(isDone ? color.yellow : u.color) : color.ink }]}>{s.title}</T>
                        <T style={[styles.popSub, { color: isDone || isCur ? onColor(isDone ? color.yellow : u.color) : color.muted }]}>{s.sub}{s.avoid ? ' · with what to avoid' : ''}</T>
                        <Button
                          title={isDone ? 'Watch again' : 'Start +10 XP'}
                          tone={color.white}
                          textColor={isDone ? color.yellowDark : isCur ? u.color : color.blue}
                          onPress={() => go(s)}
                          style={{ marginTop: 12 }}
                        />
                      </View>
                    ) : null}
                  </View>
                );
              })}
              <Image source={face(ui)} style={[styles.buddy, ui % 2 === 0 ? { right: 18 } : { left: 18 }]} />
            </View>
          </View>
        ))}

        <View style={{ alignItems: 'center', marginTop: 30 }}>
          <View style={[styles.nodeLip, { backgroundColor: done === all.length ? color.yellowDark : '#D0D0D0', width: 92, height: 88, borderRadius: 46 }]}>
            <View style={[styles.node, { backgroundColor: done === all.length ? color.yellow : '#E5E5E5', width: 92, height: 82, borderRadius: 46 }]}>
              <Trophy size={44} />
            </View>
          </View>
          <T v="h3" style={{ marginTop: 12 }}>{done === all.length ? 'Ready for the real thing' : 'Finish every scene'}</T>
          <T v="small" style={{ marginTop: 4, textAlign: 'center', paddingHorizontal: 40 }}>Then practise what to say in Talk, or ask your coach about any situation.</T>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16, paddingHorizontal: 22, alignSelf: 'stretch' }}>
            <Button title="Talk" tone={color.purple} onPress={() => router.push('/(tabs)/talk')} style={{ flex: 1 }} />
            <Button title="Coach" tone={color.green} onPress={() => router.push('/(tabs)/coach')} style={{ flex: 1 }} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hello: { marginHorizontal: 16, marginTop: 16, borderRadius: radius.xl, padding: 20, borderBottomWidth: 6, borderWidth: 0 },
  helloSmall: { fontFamily: font.heavy, fontSize: 15, opacity: 0.85 },
  helloBig: { fontFamily: font.black, fontSize: 30, lineHeight: 35, marginTop: 2 },
  helloSub: { fontFamily: font.bold, fontSize: 15, marginTop: 6, opacity: 0.92 },
  unit: { marginHorizontal: 16, borderRadius: radius.lg, padding: 16, paddingRight: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 5 },
  unitLabel: { fontFamily: font.heavy, fontSize: 13, color: 'rgba(255,255,255,0.85)', letterSpacing: 1, textTransform: 'uppercase' },
  unitTitle: { fontFamily: font.black, fontSize: 21, color: color.white, marginTop: 1 },
  unitSub: { fontFamily: font.bold, fontSize: 13.5, color: 'rgba(255,255,255,0.92)', marginTop: 2 },
  guideBtn: { width: 48, height: 48, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  path: { paddingTop: 56, paddingBottom: 10 },
  nodeLip: { width: 76, height: 72, borderRadius: 38 },
  node: { width: 76, height: 66, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', bottom: -8, width: 96, height: 92, borderRadius: 48, borderWidth: 6, opacity: 0.6 },
  start: { position: 'absolute', top: -44, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, backgroundColor: color.white, borderWidth: 2, borderColor: color.line, zIndex: 2 },
  startT: { fontFamily: font.heavy, fontSize: 14, letterSpacing: 0.8 },
  startTail: { position: 'absolute', bottom: -8, left: '50%', marginLeft: -6, width: 12, height: 12, backgroundColor: color.white, borderRightWidth: 2, borderBottomWidth: 2, borderColor: color.line, transform: [{ rotate: '45deg' }] },
  pop: { width: '86%', marginTop: 14, borderRadius: radius.lg, borderWidth: 2, borderBottomWidth: 5, padding: 16 },
  popTitle: { fontFamily: font.heavy, fontSize: 18 },
  popSub: { fontFamily: font.bold, fontSize: 14, marginTop: 2, opacity: 0.95 },
  buddy: { position: 'absolute', top: 44, width: 104, height: 130, borderRadius: 52, borderWidth: 4, borderColor: color.white, backgroundColor: color.blueSoft },
});
