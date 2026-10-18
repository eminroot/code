import { Redirect, Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBrief, TabCoach, TabLearn, TabTalk } from '@/components/icons';
import { T, Tap } from '@/components/ui';
import { useStore } from '@/lib/store';
import { color, font } from '@/theme';

const TABS = {
  index: { Icon: TabLearn, label: 'Learn' },
  brief: { Icon: TabBrief, label: 'Brief' },
  talk: { Icon: TabTalk, label: 'Talk' },
  coach: { Icon: TabCoach, label: 'Coach' },
} as const;

type BarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void; emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean } };
};

function Bar({ state, navigation }: BarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom - 4, 8) }]}>
      {state.routes.map((route, i) => {
        const on = state.index === i;
        const tab = TABS[route.name as keyof typeof TABS];
        if (!tab) return null;
        const { Icon } = tab;
        return (
          <Tap
            key={route.key}
            style={styles.item}
            onPress={() => {
              const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!on && !e.defaultPrevented) navigation.navigate(route.name);
            }}
          >
            <View style={[styles.tile, on && styles.tileOn]}>
              <Icon size={28} active={on} />
            </View>
            <T style={[styles.label, { color: on ? color.blueDark : color.faint }]}>{tab.label}</T>
          </Tap>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const { trip } = useStore();
  if (!trip) return <Redirect href="/welcome" />;
  return (
    <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: color.bg } }} tabBar={(p) => <Bar {...(p as unknown as BarProps)} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="brief" />
      <Tabs.Screen name="talk" />
      <Tabs.Screen name="coach" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: color.white, borderTopWidth: 2, borderTopColor: color.line, paddingTop: 8, paddingHorizontal: 10 },
  item: { flex: 1, alignItems: 'center', gap: 2 },
  tile: { width: 54, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  tileOn: { backgroundColor: color.blueSoft, borderColor: '#84D8FF' },
  label: { fontFamily: font.heavy, fontSize: 11, letterSpacing: 0.4 },
});
