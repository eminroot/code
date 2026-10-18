import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stage } from '@/components/Stage';
import { Button, T } from '@/components/ui';
import { findScene } from '@/data/guides';
import { preload } from '@/stage/assets';
import { stageScene } from '@/stage/scene';
import { color, font, onColor, shade } from '@/theme';

const REEL = [
  { id: 'jp-greet', word: 'こんにちは', place: 'Japan', how: 'A bow from the waist', you: 'm' as const },
  { id: 'in-namaste', word: 'नमस्ते', place: 'India', how: 'Palms together', you: 'f' as const },
  { id: 'az-greet', word: 'Salam', place: 'Azerbaijan', how: 'Handshake, then the heart', you: 'm' as const },
  { id: 'th-wai', word: 'สวัสดี', place: 'Thailand', how: 'The wai', you: 'f' as const },
  { id: 'fr-bise', word: 'Bonjour', place: 'France', how: 'La bise, two kisses', you: 'f' as const },
];

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => { preload(['trav_m', 'eastasia_m', 'trav_f', 'south_f']); }, []);

  const found = useMemo(() => findScene(REEL[i % REEL.length].id), [i]);
  const scene = useMemo(() => {
    const item = REEL[i % REEL.length];
    return found ? stageScene(found.scene, found.guide, item.you, 'do', { name: 'Alex', home: 'home' }) : null;
  }, [i, found]);

  const onLoaded = () => {
    setShown(i % REEL.length);
    fade.setValue(0);
    Animated.spring(fade, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
  };

  const cap = REEL[shown];
  const capGuide = findScene(cap.id)?.guide;
  const tone = capGuide?.color ?? color.blue;

  return (
    <View style={styles.root}>
      <View style={styles.stageArea}>
        <Stage scene={scene} style={StyleSheet.absoluteFillObject} onCycle={() => setI((x) => x + 1)} onLoaded={onLoaded} showLoader={false} />
        <View style={[styles.top, { paddingTop: insets.top + 8 }]} pointerEvents="none">
          <View style={styles.logo}><T style={styles.logoT}>adab</T></View>
        </View>
        <Animated.View style={[styles.caption, { backgroundColor: tone, borderColor: shade(tone), opacity: fade, transform: [{ scale: fade.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]} pointerEvents="none">
          <T style={[styles.word, { color: onColor(tone) }]}>{cap.word}</T>
          <T style={[styles.capT, { color: onColor(tone) }]}>{cap.place} · {cap.how}</T>
        </Animated.View>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]}>
        <T style={[styles.headline, height < 700 && { fontSize: 28, lineHeight: 32 }]}>Every country has its own hello.</T>
        <T v="body" style={styles.lede}>Watch real people greet, give and say no in 3D. Learn what to say, then ask your coach when a moment gets tricky.</T>
        <Button title="Get started" onPress={() => router.push('/onboarding')} style={{ marginTop: 20 }} />
        <T v="small" style={styles.fine}>No account needed. Takes about a minute.</T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.white },
  stageArea: { flex: 1 },
  top: { position: 'absolute', top: 0, left: 16, right: 16, flexDirection: 'row', justifyContent: 'center' },
  logo: { backgroundColor: color.green, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 14, borderBottomWidth: 4, borderBottomColor: color.greenDark },
  logoT: { fontFamily: font.black, fontSize: 24, color: color.white, letterSpacing: -0.3 },
  caption: { position: 'absolute', left: 16, bottom: 14, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18, borderBottomWidth: 5 },
  word: { fontFamily: font.black, fontSize: 28, lineHeight: 36, color: color.white },
  capT: { fontFamily: font.heavy, fontSize: 13.5, color: 'rgba(255,255,255,0.95)' },
  bottom: { paddingHorizontal: 20, paddingTop: 18, backgroundColor: color.white, borderTopWidth: 2, borderTopColor: color.line },
  headline: { fontFamily: font.black, fontSize: 32, lineHeight: 36, color: color.ink, textAlign: 'center' },
  lede: { marginTop: 10, color: color.muted, textAlign: 'center' },
  fine: { textAlign: 'center', marginTop: 12, color: color.faint },
});
