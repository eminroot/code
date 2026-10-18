import type { ReactNode } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';

// An image that fills its frame, with content layered on top.
export function Cover({ source, style, radius = 0, children }: { source: ImageSourcePropType; style?: StyleProp<ViewStyle>; radius?: number; children?: ReactNode }) {
  return (
    <View style={[{ overflow: 'hidden', borderRadius: radius }, style]}>
      <Image source={source} style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]} resizeMode="cover" />
      {children}
    </View>
  );
}
