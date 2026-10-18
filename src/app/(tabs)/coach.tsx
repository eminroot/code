import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Play, Send } from '@/components/icons';
import { TopBar } from '@/components/TopBar';
import { T, Tap } from '@/components/ui';
import { PORTRAITS, THUMBS } from '@/data/images';
import { coachReply, starterPrompts } from '@/lib/coach';
import { useStore, type ChatMessage } from '@/lib/store';
import { useTrip } from '@/lib/useTrip';
import { color, font, radius, shade } from '@/theme';

export default function Coach() {
  const ctx = useTrip();
  const { chat, setChat } = useStore();
  const { ask } = useLocalSearchParams<{ ask?: string }>();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [kb, setKb] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const input = useRef<TextInput>(null);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKb(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKb(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  useEffect(() => {
    if (ask) { setText(ask); setTimeout(() => input.current?.focus(), 300); }
  }, [ask]);
  useEffect(() => {
    if (!chat.length && !busy) return;
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 80);
  }, [chat.length, busy]);

  if (!ctx) return null;
  const { trip, guide, to } = ctx;
  const coachFace = PORTRAITS[guide.avatars.f] ?? PORTRAITS[guide.avatars.m];

  const send = async (q?: string) => {
    const body = (q ?? text).trim();
    if (!body || busy) return;
    setText('');
    const mine: ChatMessage = { id: String(Date.now()), role: 'user', text: body, at: Date.now() };
    const next = [...chat, mine];
    setChat(() => next);
    setBusy(true);
    const reply = await coachReply(trip, guide, next.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', text: m.text })));
    setChat((prev) => [...prev, { id: String(Date.now() + 1), role: 'coach', text: reply.text, scenes: reply.scenes, at: Date.now() }]);
    setBusy(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: color.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TopBar />
      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 20 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: color.green, borderColor: color.greenDark }]}>
          <Image source={coachFace} style={styles.heroFace} />
          <View style={{ flex: 1 }}>
            <T style={styles.heroLabel}>Your coach for {to.name}</T>
            <T style={styles.heroTitle}>{chat.length ? 'Ask me anything' : `What is happening, ${trip.name.split(' ')[0]}?`}</T>
          </View>
          {chat.length ? (
            <Tap onPress={() => setChat(() => [])} style={styles.newChat}><T style={styles.newChatT}>NEW</T></Tap>
          ) : null}
        </View>

        {chat.length === 0 ? (
          <View style={{ marginTop: 18 }}>
            <T v="body" style={{ marginBottom: 12 }}>Describe the moment. You will get what to do, what to say, and a scene to watch.</T>
            {starterPrompts(trip, guide).map((p) => (
              <Tap key={p} onPress={() => send(p)} style={styles.option}>
                <T v="bodyStrong" style={{ flex: 1 }}>{p}</T>
              </Tap>
            ))}
          </View>
        ) : null}

        {chat.map((m) => (m.role === 'user' ? (
          <View key={m.id} style={styles.me}><T style={styles.meT}>{m.text}</T></View>
        ) : (
          <View key={m.id} style={styles.coachRow}>
            <Image source={coachFace} style={styles.face} />
            <View style={styles.coachMsg}>
              <T style={styles.coachT}>{m.text}</T>
              {(m.scenes ?? []).map((sid) => {
                const s = guide.scenes.find((x) => x.id === sid);
                if (!s) return null;
                return (
                  <Tap key={sid} onPress={() => router.push({ pathname: '/scene/[id]', params: { id: sid } })} style={styles.sceneLink}>
                    <Image source={THUMBS[sid]} style={styles.sceneThumb} />
                    <View style={{ flex: 1 }}>
                      <T style={styles.watchLabel}>WATCH</T>
                      <T v="title">{s.title}</T>
                    </View>
                    <View style={styles.play}><Play size={14} color={color.white} /></View>
                  </Tap>
                );
              })}
            </View>
          </View>
        )))}
        {busy ? (
          <View style={styles.coachRow}>
            <Image source={coachFace} style={styles.face} />
            <View style={[styles.coachMsg, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}><ActivityIndicator color={color.green} /><T v="small">Thinking about {to.name}</T></View>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.inputBar, { paddingBottom: kb ? 8 : 10 }]}>
        <TextInput
          ref={input}
          value={text}
          onChangeText={setText}
          placeholder="Describe the situation"
          placeholderTextColor={color.faint}
          style={styles.input}
          multiline
          numberOfLines={1}
          maxLength={600}
        />
        <Tap onPress={() => send()} disabled={!text.trim() || busy} style={[styles.send, (!text.trim() || busy) && { backgroundColor: color.line, borderColor: '#D0D0D0' }]}>
          <Send size={20} />
        </Tap>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.xl, padding: 16, borderBottomWidth: 6 },
  heroFace: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: color.white, backgroundColor: color.greenSoft },
  heroLabel: { fontFamily: font.heavy, fontSize: 12.5, letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(255,255,255,0.88)' },
  heroTitle: { fontFamily: font.black, fontSize: 20, lineHeight: 25, color: color.white, marginTop: 1 },
  newChat: { paddingHorizontal: 12, height: 34, borderRadius: 12, justifyContent: 'center', backgroundColor: color.white },
  newChatT: { fontFamily: font.heavy, fontSize: 13, color: color.green, letterSpacing: 0.6 },
  option: { padding: 16, borderRadius: radius.lg, borderWidth: 2, borderBottomWidth: 4, borderColor: color.line, backgroundColor: color.white, marginBottom: 10 },
  me: { alignSelf: 'flex-end', maxWidth: '84%', backgroundColor: color.blue, borderRadius: 20, borderBottomRightRadius: 6, paddingHorizontal: 16, paddingVertical: 11, marginTop: 16, borderBottomWidth: 4, borderBottomColor: color.blueDark },
  meT: { fontFamily: font.bold, fontSize: 15.5, lineHeight: 21, color: color.white },
  coachRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 16 },
  face: { width: 38, height: 38, borderRadius: 19, backgroundColor: color.greenSoft, borderWidth: 2, borderColor: color.white },
  coachMsg: { flex: 1, backgroundColor: color.white, borderRadius: 20, borderBottomLeftRadius: 6, borderWidth: 2, borderBottomWidth: 4, borderColor: color.line, padding: 14 },
  coachT: { fontFamily: font.semibold, fontSize: 15.5, lineHeight: 23, color: color.ink },
  sceneLink: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, padding: 8, borderRadius: radius.md, backgroundColor: color.blueSoft, borderWidth: 2, borderColor: '#84D8FF' },
  sceneThumb: { width: 42, height: 52, borderRadius: 8, backgroundColor: color.white },
  watchLabel: { fontFamily: font.heavy, fontSize: 11, letterSpacing: 0.8, color: color.blueDark },
  play: { width: 34, height: 34, borderRadius: 17, backgroundColor: color.blue, borderBottomWidth: 3, borderBottomColor: color.blueDark, alignItems: 'center', justifyContent: 'center', marginRight: 2 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 14, paddingTop: 10, backgroundColor: color.white, borderTopWidth: 2, borderTopColor: color.line },
  input: { flex: 1, fontFamily: font.semibold, fontSize: 16, color: color.ink, maxHeight: 120, minHeight: 48, borderWidth: 2, borderColor: color.line, borderRadius: 16, backgroundColor: color.bgSoft, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12 },
  send: { width: 50, height: 50, borderRadius: 16, backgroundColor: color.green, borderBottomWidth: 4, borderColor: color.greenDark, alignItems: 'center', justifyContent: 'center' },
});
