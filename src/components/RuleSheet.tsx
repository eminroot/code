import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Close, Play } from '@/components/icons';
import { Button, Card, Kind, T, Tap } from '@/components/ui';
import { THUMBS } from '@/data/images';
import type { Guide, Rule, Trip } from '@/data/types';
import { explain } from '@/lib/coach';
import { color, font, radius } from '@/theme';

export function RuleSheet({ rule, guide, trip, onClose }: { rule: Rule | null; guide: Guide; trip: Trip; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [story, setStory] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setStory(null); setBusy(false); }, [rule?.id]);
  const scene = rule?.scene ? guide.scenes.find((s) => s.id === rule.scene) : null;

  const tell = async () => {
    if (!rule) return;
    setBusy(true);
    setStory(await explain(trip, guide, { title: rule.title, body: rule.body }));
    setBusy(false);
  };

  return (
    <Modal visible={!!rule} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.grab} />
        {rule ? (
          <ScrollView contentContainerStyle={{ paddingHorizontal: 18 }} showsVerticalScrollIndicator={false}>
            <View style={styles.top}>
              <Kind kind={rule.kind} />
              <Tap onPress={onClose} style={styles.close}><Close size={20} color={color.muted} stroke={2.4} /></Tap>
            </View>
            <T v="h1" style={{ marginTop: 10 }}>{rule.title}</T>
            <T v="body" style={{ marginTop: 8, fontSize: 16.5, lineHeight: 24 }}>{rule.body}</T>

            {scene ? (
              <Card onPress={() => { onClose(); router.push({ pathname: '/scene/[id]', params: { id: scene.id } }); }} tone={color.blueSoft} style={[styles.scene, { borderColor: '#84D8FF' }]}>
                <Image source={THUMBS[scene.id]} style={styles.thumb} />
                <View style={{ flex: 1 }}>
                  <T style={styles.label}>WATCH</T>
                  <T v="title" style={{ marginTop: 2 }}>{scene.title}</T>
                  <T v="small" numberOfLines={1}>{scene.sub}</T>
                </View>
                <View style={styles.play}><Play size={16} color={color.white} /></View>
              </Card>
            ) : null}

            <View style={{ marginTop: 16, marginBottom: 24 }}>
              {story ? (
                <T v="body" style={{ color: color.ink }}>{story}</T>
              ) : busy ? (
                <View style={styles.busy}><ActivityIndicator color={color.muted} /><T v="small">Loading</T></View>
              ) : (
                <Button small outline title="Why do people do this?" tone={color.blue} onPress={tell} />
              )}
            </View>
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { backgroundColor: color.white, borderTopLeftRadius: 26, borderTopRightRadius: 26, maxHeight: '86%', paddingTop: 10 },
  grab: { alignSelf: 'center', width: 44, height: 6, borderRadius: 3, backgroundColor: color.line, marginBottom: 8 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  close: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: color.bgSoft },
  scene: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18, padding: 10 },
  thumb: { width: 60, height: 74, borderRadius: radius.sm, backgroundColor: color.white },
  label: { fontFamily: font.heavy, fontSize: 12, letterSpacing: 0.8, color: color.blueDark },
  play: { width: 40, height: 40, borderRadius: 20, backgroundColor: color.blue, borderBottomWidth: 4, borderBottomColor: color.blueDark, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  busy: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
});
