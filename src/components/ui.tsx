import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from 'react-native';
import { color, font, radius, shade } from '@/theme';

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'title' | 'body' | 'bodyStrong' | 'small' | 'label';

const V: Record<Variant, TextStyle> = {
  display: { fontFamily: font.black, fontSize: 36, lineHeight: 40, letterSpacing: -0.5, color: color.ink },
  h1: { fontFamily: font.heavy, fontSize: 28, lineHeight: 33, letterSpacing: -0.3, color: color.ink },
  h2: { fontFamily: font.heavy, fontSize: 22, lineHeight: 27, color: color.ink },
  h3: { fontFamily: font.heavy, fontSize: 18, lineHeight: 23, color: color.ink },
  title: { fontFamily: font.bold, fontSize: 16, lineHeight: 21, color: color.ink },
  body: { fontFamily: font.semibold, fontSize: 15.5, lineHeight: 22, color: color.inkSoft },
  bodyStrong: { fontFamily: font.bold, fontSize: 15.5, lineHeight: 22, color: color.ink },
  small: { fontFamily: font.semibold, fontSize: 13.5, lineHeight: 18, color: color.muted },
  label: { fontFamily: font.heavy, fontSize: 12, lineHeight: 15, letterSpacing: 1, textTransform: 'uppercase', color: color.faint },
};

export function T({ v = 'body', style, children, ...rest }: TextProps & { v?: Variant; style?: StyleProp<TextStyle>; children?: ReactNode }) {
  return <Text {...rest} style={[V[v], style]}>{children}</Text>;
}

export function Tap({ onPress, haptic = true, style, children, ...rest }: PressableProps & { haptic?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      role="button"
      {...rest}
      onPress={(e) => { if (haptic) Haptics.selectionAsync().catch(() => {}); onPress?.(e); }}
      style={({ pressed }) => [style, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]}
    >
      {children as ReactNode}
    </Pressable>
  );
}

// Chunky button with a darker lip underneath that sinks when pressed.
export function Button({
  title, onPress, tone = color.green, textColor = color.white, disabled, style, small, outline, icon,
}: {
  title: string; onPress?: () => void; tone?: string; textColor?: string; disabled?: boolean;
  style?: StyleProp<ViewStyle>; small?: boolean; outline?: boolean; icon?: ReactNode;
}) {
  const face = disabled ? color.line : outline ? color.white : tone;
  const lip = disabled ? '#D0D0D0' : outline ? color.line : shade(tone);
  const fg = disabled ? color.faint : outline ? tone : textColor;
  const h = small ? 44 : 52;
  return (
    <Pressable
      role="button"
      disabled={disabled}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); onPress?.(); }}
      style={[{ height: h + 4, borderRadius: radius.md, backgroundColor: lip }, style]}
    >
      {({ pressed }) => (
        <View style={[styles.face, { height: h, backgroundColor: face, marginTop: pressed ? 4 : 0 }, outline && styles.outline]}>
          {icon}
          <Text style={[styles.btnText, { color: fg, fontSize: small ? 14 : 16 }]}>{title.toUpperCase()}</Text>
        </View>
      )}
    </Pressable>
  );
}

// A card with a 2px border and a thicker bottom edge.
export function Card({ children, style, tone, onPress }: { children?: ReactNode; style?: StyleProp<ViewStyle>; tone?: string; onPress?: () => void }) {
  const border = tone ? shade(tone) : color.line;
  const body = <View style={[styles.card, { borderColor: border, backgroundColor: tone ?? color.white }, style]}>{children}</View>;
  return onPress ? <Tap onPress={onPress}>{body}</Tap> : body;
}

export function Kind({ kind, small }: { kind: 'do' | 'avoid' | 'know'; small?: boolean }) {
  const map = {
    do: { bg: color.greenSoft, fg: color.greenDark, t: 'Do' },
    avoid: { bg: color.redSoft, fg: color.redDark, t: 'Avoid' },
    know: { bg: color.blueSoft, fg: color.blueDark, t: 'Good to know' },
  }[kind];
  return (
    <View style={[styles.kind, { backgroundColor: map.bg }, small && { paddingHorizontal: 8, paddingVertical: 2 }]}>
      <Text style={[styles.kindText, { color: map.fg }, small && { fontSize: 11 }]}>{map.t.toUpperCase()}</Text>
    </View>
  );
}

export function Section({ label, title, right, children, style }: { label?: string; title?: string; right?: ReactNode; children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ marginTop: 30 }, style]}>
      <View style={styles.sectionHead}>
        <View style={{ flex: 1 }}>
          {label ? <T v="label">{label}</T> : null}
          {title ? <T v="h2" style={{ marginTop: label ? 4 : 0 }}>{title}</T> : null}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

export function Bar({ value, tone = color.green, height = 16, track = color.line }: { value: number; tone?: string; height?: number; track?: string }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ width: `${v * 100}%`, height, borderRadius: height / 2, backgroundColor: tone }}>
        {v > 0.06 ? <View style={{ position: 'absolute', left: 8, right: 8, top: height * 0.22, height: Math.max(3, height * 0.22), borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)' }} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  face: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 20 },
  outline: { borderWidth: 2, borderColor: color.line },
  btnText: { fontFamily: font.heavy, letterSpacing: 0.8 },
  card: { borderWidth: 2, borderBottomWidth: 4, borderRadius: radius.lg, padding: 16 },
  kind: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
  kindText: { fontFamily: font.heavy, fontSize: 11.5, letterSpacing: 0.6 },
  sectionHead: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
});
