import type { Checkin, Country, Mood, Struggle, Trip } from '@/data/types';
import { shifts } from '@/lib/insights';

// Dates are local calendar days as YYYY-MM-DD.
export function dayKey(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function parse(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}
export function addDays(key: string, n: number) {
  const d = parse(key);
  d.setDate(d.getDate() + n);
  return dayKey(d);
}
export function daysBetween(a: string, b: string) {
  return Math.round((parse(b).getTime() - parse(a).getTime()) / 86400000);
}

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function shortDate(key: string) {
  const d = parse(key);
  return `${WEEKDAY[d.getDay()]} ${d.getDate()} ${MONTH[d.getMonth()]}`;
}
export const weekdayLetter = (key: string) => WEEKDAY[parse(key).getDay()][0];

export const arrival = (trip: Trip) => trip.arrive ?? dayKey(new Date(trip.createdAt));

// 1 is the day you land. 0 or less is before the trip.
export const tripDay = (trip: Trip, today = dayKey()) => daysBetween(arrival(trip), today) + 1;

export type TripStage = 'before' | 'new' | 'dip' | 'settling' | 'settled' | 'home';

// A rough map of the usual culture shock curve. Everyone moves through it differently.
export function stageOf(trip: Trip, day: number): TripStage {
  if (day <= 0) return 'before';
  if (day > trip.days) return 'home';
  if (day <= 3) return 'new';
  if (day <= 24) return 'dip';
  if (day <= 75) return 'settling';
  return 'settled';
}

export function stageText(stage: TripStage, trip: Trip): { title: string; body: string } {
  switch (stage) {
    case 'before': return { title: 'Before you go', body: 'Nerves before a trip are normal. Knowing how to say hello makes the first day much easier.' };
    case 'new': return { title: 'The first days', body: 'Everything is new and a lot of it is exciting. Small surprises are normal.' };
    case 'dip': return trip.days <= 10
      ? { title: 'Halfway through', body: 'Short trips still wear you out. Plan one quiet hour a day.' }
      : { title: 'The hard part', body: 'Around now many people feel tired or annoyed by small things. It is a known stage of culture shock, and it passes.' };
    case 'settling': return { title: 'Settling in', body: 'Things start to feel familiar. Keep a few habits from home and add a local one.' };
    case 'settled': return { title: 'At home here', body: 'Most people feel at ease by now. Look back at how much you have picked up.' };
    case 'home': return { title: 'Back home', body: 'Coming home can feel strange too. Give yourself a few days to adjust again.' };
  }
}

export function dayLabel(trip: Trip, day: number, place: string) {
  if (day <= 0) return day === 0 ? 'Arriving tomorrow' : `Arriving in ${1 - day} days`;
  if (day > trip.days) return `Back from ${place}`;
  return `Day ${day} in ${place}`;
}

export function question(stage: TripStage) {
  if (stage === 'before') return 'How do you feel about the trip?';
  if (stage === 'home') return 'How is it being back?';
  return 'How are you finding it?';
}

export const MOODS: { v: Mood; t: string }[] = [
  { v: 1, t: 'Rough' },
  { v: 2, t: 'Low' },
  { v: 3, t: 'Okay' },
  { v: 4, t: 'Good' },
  { v: 5, t: 'Great' },
];

export const STRUGGLES: { k: Struggle; t: string }[] = [
  { k: 'language', t: 'The language' },
  { k: 'people', t: 'How people act' },
  { k: 'rules', t: 'Rules I do not get' },
  { k: 'food', t: 'The food' },
  { k: 'around', t: 'Getting around' },
  { k: 'home', t: 'Missing home' },
  { k: 'tired', t: 'Just tired' },
];

export type Action = { label: string; href?: '/(tabs)/talk' | '/(tabs)/brief' | '/practice'; ask?: string };
export type Tip = { text: string; action?: Action };

export function tipsFor(c: Pick<Checkin, 'mood' | 'hard'>, from: Country, to: Country): Tip[] {
  const out: Tip[] = [];
  for (const k of c.hard) {
    switch (k) {
      case 'language':
        out.push({ text: 'Learn three phrases today: hello, thank you and sorry. People notice the effort more than the accent.', action: { label: 'Open phrases', href: '/(tabs)/talk' } });
        break;
      case 'people': {
        const top = shifts(from, to)[0];
        out.push({ text: `${top.text} It is a difference in habits, not a judgement of you.`, action: { label: 'See what feels different', href: '/(tabs)/brief' } });
        break;
      }
      case 'rules':
        out.push({ text: 'Unwritten rules are the hardest part. Practise the ones that come up most, so you stop thinking about them.', action: { label: 'Practise now', href: '/practice' } });
        break;
      case 'food':
        out.push({ text: 'Find one local dish you like and one familiar place to fall back on. Both count as a win.', action: { label: 'Ask the coach', ask: `What local dishes in ${to.name} are easy to like for someone from ${from.name}?` } });
        break;
      case 'around':
        out.push({ text: 'Getting around gets easier after a few trips. Learn how locals do it once, then repeat it.', action: { label: 'Ask the coach', ask: `How do people get around in ${to.name}, and what should I know?` } });
        break;
      case 'home':
        out.push({ text: 'Missing home is normal. Set a regular time to call, and keep one routine from home, like your morning drink or a walk.' });
        break;
      case 'tired':
        out.push({ text: 'Adjusting takes energy, even on good days. Plan one quiet hour with nothing new in it, and keep regular sleep.' });
        break;
    }
  }
  if (!out.length) {
    out.push(c.mood >= 4
      ? { text: 'Good days are the best time to try one new thing. Practise a few scenes while it is easy.', action: { label: 'Practise now', href: '/practice' } }
      : { text: 'Some days are flat for no clear reason. Keep it simple today: eat well, get outside, and do one small thing in the local language.', action: { label: 'Open phrases', href: '/(tabs)/talk' } });
  }
  return out.slice(0, 3);
}

// Three low days out of the last four check-ins.
export function struggling(list: Checkin[]) {
  const last = [...list].sort((a, b) => a.day.localeCompare(b.day)).slice(-4);
  return last.filter((c) => c.mood <= 2).length >= 3;
}

export function lastDays(n: number, today = dayKey()) {
  return Array.from({ length: n }, (_, i) => addDays(today, i - n + 1));
}
