import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Flame, Gem } from '@/components/icons';
import { T, Tap } from '@/components/ui';
import { useStore } from '@/lib/store';
import { useTrip } from '@/lib/useTrip';
import { color, font } from '@/theme';

export function TopBar() {
  const ctx = useTrip();
  const { streak, xp } = useStore();
  const insets = useSafeAreaInsets();
  if (!ctx) return null;
  return (
    <View style={[styles.top, { paddingTop: insets.top + 6 }]}>
      <Tap onPress={() => router.push('/trip')} style={styles.flagPill}>
        <T style={{ fontSize: 22 }}>{ctx.to.flag}</T>
        <T style={styles.flagCode}>{ctx.to.code}</T>
      </Tap>
      <View style={styles.stat}><Flame size={24} /><T style={[styles.statT, { color: color.orange }]}>{streak}</T></View>
      <View style={styles.stat}><Gem size={22} /><T style={[styles.statT, { color: color.blue }]}>{xp}</T></View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: color.line, backgroundColor: color.white },
  flagPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, height: 38, borderRadius: 12, borderWidth: 2, borderColor: color.line },
  flagCode: { fontFamily: font.heavy, fontSize: 14, color: color.muted, letterSpacing: 0.5 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statT: { fontFamily: font.heavy, fontSize: 17 },
});
