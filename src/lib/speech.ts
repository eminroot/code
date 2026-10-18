import * as Speech from 'expo-speech';
import type { Phrase } from '@/data/types';

// Languages that often have no voice on a phone, and the closest one that does.
const FALLBACK: Record<string, string> = { az: 'tr-TR', ka: 'en-US' };

let voices: Promise<string[]> | null = null;
const available = () => {
  if (!voices) voices = Speech.getAvailableVoicesAsync().then((v) => v.map((x) => x.language.toLowerCase())).catch(() => []);
  return voices;
};

export async function say(phrase: Pick<Phrase, 'local' | 'roman'>, lang: string, onDone?: () => void) {
  Speech.stop();
  const list = await available();
  const base = lang.split('-')[0].toLowerCase();
  const has = list.length === 0 || list.some((l) => l.startsWith(base));
  let language = lang;
  let text = phrase.local.split(' / ')[0];
  if (!has && FALLBACK[base]) {
    language = FALLBACK[base];
    // A Latin-script reading works better than a script the voice cannot read.
    if (base === 'ka' && phrase.roman) text = phrase.roman;
  }
  Speech.speak(text, { language, rate: 0.85, pitch: 1.0, onDone, onStopped: onDone, onError: onDone });
}

export const stopSpeaking = () => Speech.stop();
