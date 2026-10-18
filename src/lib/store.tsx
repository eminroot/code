import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Checkin, Trip } from '@/data/types';

export type ChatMessage = { id: string; role: 'user' | 'coach'; text: string; scenes?: string[]; at: number };

type State = {
  ready: boolean;
  trip: Trip | null;
  seen: string[];
  saved: string[];
  chat: ChatMessage[];
  checkins: Checkin[];
  practiced: string[];
  streak: number;
  xp: number;
  setTrip: (t: Trip) => void;
  clearTrip: () => void;
  markSeen: (id: string) => void;
  toggleSaved: (id: string) => void;
  setChat: (fn: (prev: ChatMessage[]) => ChatMessage[]) => void;
  addCheckin: (c: Checkin) => void;
  markPracticed: (ids: string[]) => void;
};

const Ctx = createContext<State | null>(null);
const KEY = 'adab:v1';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [trip, setTripState] = useState<Trip | null>(null);
  const [seen, setSeen] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [chat, setChatState] = useState<ChatMessage[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [practiced, setPracticed] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    const done = () => { if (alive) setReady(true); };
    // Never let storage hold the app on the splash screen.
    const timer = setTimeout(done, 1500);
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw || !alive) return;
        const d = JSON.parse(raw);
        setTripState(d.trip ?? null);
        setSeen(d.seen ?? []);
        setSaved(d.saved ?? []);
        setChatState(d.chat ?? []);
        setDays(d.days ?? []);
        setCheckins(d.checkins ?? []);
        setPracticed(d.practiced ?? []);
      })
      .catch(() => {})
      .finally(() => { clearTimeout(timer); done(); });
    return () => { alive = false; clearTimeout(timer); };
  }, []);

  // Record today as an active day, for the streak.
  useEffect(() => {
    if (!ready) return;
    const today = new Date().toISOString().slice(0, 10);
    setDays((d) => (d.includes(today) ? d : [...d, today].slice(-60)));
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(KEY, JSON.stringify({ trip, seen, saved, chat: chat.slice(-60), days, checkins: checkins.slice(-120), practiced })).catch(() => {});
  }, [ready, trip, seen, saved, chat, days, checkins, practiced]);

  const streak = useMemo(() => {
    const set = new Set(days);
    let n = 0;
    const d = new Date();
    while (set.has(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1); }
    return Math.max(n, 1);
  }, [days]);
  const xp = seen.length * 10 + practiced.length * 5 + chat.filter((m) => m.role === 'user').length * 5;

  const setTrip = useCallback((t: Trip) => {
    setTripState((prev) => {
      if (!prev || prev.to !== t.to || prev.from !== t.from) setChatState([]);
      return t;
    });
  }, []);
  const clearTrip = useCallback(() => { setTripState(null); setSeen([]); setSaved([]); setChatState([]); setCheckins([]); setPracticed([]); }, []);
  // One check-in per day; a second one the same day replaces the first.
  const addCheckin = useCallback((c: Checkin) => setCheckins((list) => [...list.filter((x) => x.day !== c.day), c]), []);
  const markPracticed = useCallback((ids: string[]) => setPracticed((p) => [...new Set([...p, ...ids])]), []);
  const markSeen = useCallback((id: string) => setSeen((s) => (s.includes(id) ? s : [...s, id])), []);
  const toggleSaved = useCallback((id: string) => setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])), []);
  const setChat = useCallback((fn: (prev: ChatMessage[]) => ChatMessage[]) => setChatState(fn), []);

  const value = useMemo(
    () => ({ ready, trip, seen, saved, chat, checkins, practiced, streak, xp, setTrip, clearTrip, markSeen, toggleSaved, setChat, addCheckin, markPracticed }),
    [ready, trip, seen, saved, chat, checkins, practiced, streak, xp, setTrip, clearTrip, markSeen, toggleSaved, setChat, addCheckin, markPracticed],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore outside provider');
  return v;
}
