import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Chevron } from '@/components/icons';
import { Face, Week } from '@/components/Mood';
import { T, Tap } from '@/components/ui';
import { dayKey, dayLabel, MOODS, question, stageOf, tripDay } from '@/lib/journey';
import { useStore } from '@/lib/store';
import { useTrip } from '@/lib/useTrip';
import { color, font, radius } from '@/theme';

export function CheckinCard() {
  const ctx = useTrip();
  const { checkins } = useStore();
  if (!ctx) return null;
  const { trip, to } = ctx;
  const day = tripDay(trip);
  const stage = stageOf(trip, day);
  const today = checkins.find((c) => c.day === dayKey());

  if (today) {
    const mood = MOODS[today.mood - 1];
    return (
      <Tap onPress={() => router.push('/checkin')} style={styles.card}>
        <View style={styles.row}>
          <Face mood={today.mood} size={40} />
          <View style={{ flex: 1 }}>
            <T style={styles.label}>{dayLabel(trip, day, to.name)}</T>
            <T v="h3">Feeling {mood.t.toLowerCase()} today</T>
          </View>
          <Chevron size={20} color={color.faint} stroke={2.2} />
        </View>
        <View style={{ marginTop: 14 }}><Week checkins={checkins} size={24} /></View>
      </Tap>
    );
  }

  return (
    <View style={styles.card}>
      <T style={styles.label}>{dayLabel(trip, day, to.name)}</T>
      <T v="h3" style={{ marginTop: 2 }}>{question(stage)}</T>
      <View style={styles.faces}>
        {MOODS.map((m) => (
          <Tap key={m.v} onPress={() => router.push({ pathname: '/checkin', params: { mood: String(m.v) } })} style={styles.face} accessibilityLabel={m.t}>
            <Face mood={m.v} size={46} />
            <T style={styles.faceT}>{m.t}</T>
          </Tap>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: radius.lg, borderWidth: 2, borderBottomWidth: 4, borderColor: color.line, backgroundColor: color.white },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: { fontFamily: font.heavy, fontSize: 13, color: color.muted },
  faces: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  face: { alignItems: 'center', gap: 4, minWidth: 52 },
  faceT: { fontFamily: font.heavy, fontSize: 12.5, color: color.muted },
});
