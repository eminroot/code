import { createElement, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { avatarBase64, clipsSubset } from '@/stage/assets';
import type { StageScene } from '@/stage/scene';
import { STAGE_HTML } from '@/stage/stage-html';
import { color, font } from '@/theme';

const IS_WEB = Platform.OS === 'web';
// On web the same page runs in an iframe, with a tiny shim standing in for the native bridge.
const WEB_HTML = STAGE_HTML.replace('<body>', '<body><script>window.ReactNativeWebView={postMessage:function(s){parent.postMessage({__stage:s},"*")}}</script>');

export type StageHandle = { restart: () => void; seek: (t: number) => void };

type Props = {
  scene: StageScene | null;
  camera?: string;
  speed?: number;
  paused?: boolean;
  // Freeze the scene's script but keep people breathing.
  hold?: boolean;
  active?: boolean;
  background?: string;
  style?: ViewStyle;
  onBeat?: (i: number) => void;
  onTime?: (t: number, d: number) => void;
  onCycle?: () => void;
  onLoaded?: () => void;
  showLoader?: boolean;
};

export const Stage = forwardRef<StageHandle, Props>(function Stage(
  { scene, camera, speed = 1, paused = false, hold = false, active = true, background, style, onBeat, onTime, onCycle, onLoaded, showLoader = true },
  ref,
) {
  const focused = useIsFocused();
  const web = useRef<WebView>(null);
  const frame = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState<string | null>(null);
  const sentKey = useRef<string | null>(null);
  const handlers = useRef({ onBeat, onTime, onCycle, onLoaded });
  handlers.current = { onBeat, onTime, onCycle, onLoaded };

  const send = useCallback((msg: unknown) => {
    if (IS_WEB) frame.current?.contentWindow?.__stage?.(msg);
    else web.current?.injectJavaScript(`window.__stage && window.__stage(${JSON.stringify(msg)});true;`);
  }, []);

  useImperativeHandle(ref, () => ({
    restart: () => send({ type: 'restart' }),
    seek: (t: number) => send({ type: 'seek', t }),
  }), [send]);

  useEffect(() => {
    if (!ready || !scene || sentKey.current === scene.key) return;
    sentKey.current = scene.key;
    setLoading(true);
    send({ type: 'scene', scene });
  }, [ready, scene, send]);

  useEffect(() => { if (ready && camera) send({ type: 'camera', preset: camera }); }, [ready, camera, send]);
  useEffect(() => { if (ready) send({ type: 'speed', value: speed }); }, [ready, speed, send]);
  useEffect(() => { if (ready) send({ type: 'pause', value: paused }); }, [ready, paused, send]);
  useEffect(() => { if (ready) send({ type: 'hold', value: hold }); }, [ready, hold, send]);
  // Stop drawing when the screen is covered, so hidden stages cost nothing.
  useEffect(() => { if (ready) send({ type: 'run', value: active && focused }); }, [ready, active, focused, send]);
  useEffect(() => { if (ready && background) send({ type: 'bg', value: background }); }, [ready, background, send]);

  const onMessage = useCallback(async (e: WebViewMessageEvent) => {
    let msg: any;
    try { msg = JSON.parse(e.nativeEvent.data); } catch { return; }
    switch (msg.type) {
      case 'ready':
        sentKey.current = null;
        setReady(true);
        break;
      case 'need': {
        try {
          const avatars: Record<string, string> = {};
          await Promise.all((msg.avatars as string[]).map(async (id) => { avatars[id] = await avatarBase64(id); }));
          const clips = await clipsSubset(msg.clips as string[]);
          send({ type: 'assets', id: msg.id, avatars, clips });
        } catch (err) {
          setFailed(String(err));
        }
        break;
      }
      case 'loaded':
        setLoading(false);
        setFailed(null);
        handlers.current.onLoaded?.();
        break;
      case 'beat': handlers.current.onBeat?.(msg.i); break;
      case 't': handlers.current.onTime?.(msg.t, msg.d); break;
      case 'cycle': handlers.current.onCycle?.(); break;
      case 'error':
        if (__DEV__) console.warn('[stage]', msg.message);
        break;
    }
  }, [send]);

  useEffect(() => {
    if (!IS_WEB) return;
    const handler = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow || !e.data?.__stage) return;
      onMessage({ nativeEvent: { data: e.data.__stage } } as WebViewMessageEvent);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onMessage]);

  return (
    <View style={[styles.wrap, style]}>
      {IS_WEB ? createElement('iframe', { ref: frame, srcDoc: WEB_HTML, style: { border: 0, width: '100%', height: '100%', display: 'block' } }) : (
      <WebView
        ref={web}
        source={{ html: STAGE_HTML, baseUrl: 'https://stage.adab.app/' }}
        originWhitelist={['*']}
        onMessage={onMessage}
        javaScriptEnabled
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        setSupportMultipleWindows={false}
        style={styles.web}
        containerStyle={styles.web}
        onContentProcessDidTerminate={() => { setReady(false); web.current?.reload(); }}
      />
      )}
      {showLoader && loading && (
        <View style={styles.loader} pointerEvents="none">
          <ActivityIndicator color={color.muted} />
          <Text style={styles.loaderText}>{failed ? 'Could not load the scene' : 'Loading scene'}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: '#EAF6FF' },
  web: { flex: 1, backgroundColor: 'transparent' },
  loader: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#EAF6FF' },
  loaderText: { fontFamily: font.bold, fontSize: 14, color: color.blueDark },
});
