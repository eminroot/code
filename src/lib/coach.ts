import { byCode } from '@/data/countries';
import type { Guide, Rule, Scene, Trip } from '@/data/types';
import { originNotes, shifts } from '@/lib/insights';
import { complete, hasModel, type Turn } from '@/lib/llm';

const PURPOSE: Record<Trip['purpose'], string> = { holiday: 'a holiday', business: 'business', study: 'study', family: 'a family visit' };

// Model output goes straight into the UI, so keep it clean of markdown and dashes.
function tidy(s: string) {
  return s
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/\s+[—–]\s+/g, ', ')
    .replace(/[—–]/g, ', ')
    .trim();
}

function notes(guide: Guide) {
  const facts = guide.facts.map((f) => `${f.label}: ${f.value}`).join('\n');
  const rules = guide.rules.map((r) => `${r.kind.toUpperCase()} ${r.title}. ${r.body}`).join('\n');
  return `${facts}\n${rules}`;
}

export function coachSystem(trip: Trip, guide: Guide) {
  const from = byCode(trip.from)?.name ?? trip.from;
  const to = byCode(trip.to)?.name ?? trip.to;
  const scenes = guide.scenes.map((s) => `${s.id}: ${s.title} (${s.sub})`).join('\n');
  return `You are Adab, a practical culture coach for travellers.
The user is ${trip.name}, from ${from}, spending ${trip.days} days in ${to} for ${PURPOSE[trip.purpose]}.
Help them handle real social situations in ${to}: greetings, food, gifts, homes, work, religion, gestures, and recovering from mistakes.

How to answer:
- Write like a friend who lives there. Plain words, short sentences, short paragraphs. No headings, lists, markdown or dashes.
- Start with the answer. No greetings, no praise for the question, no summary at the end.
- Avoid stock phrases such as "great question", "it's important to", "navigate", "nuance", "rich culture" or "journey".
- Stay under 130 words unless they ask for more detail.
- Give one concrete thing to do or say. Include the local phrase with its pronunciation when it helps.
- Compare with habits in ${from} when that makes the difference clearer.
- Be accurate. If a custom varies by region, age or family, say so in a few words. Never invent laws.
- If one of these scenes would show them how, put its id in double brackets at the very end, like [[${guide.scenes[0]?.id ?? 'scene-id'}]]. At most two.

Scenes they can watch:
${scenes}

Reference notes for ${to}:
${notes(guide)}`;
}

export type CoachReply = { text: string; scenes: string[] };

function extractScenes(raw: string, guide: Guide): CoachReply {
  const ids = [...raw.matchAll(/\[\[([a-z]{2}-[a-z-]+)\]\]/g)].map((m) => m[1]).filter((id) => guide.scenes.some((s) => s.id === id));
  const text = tidy(raw.replace(/\[\[[^\]]*\]\]/g, ''));
  return { text, scenes: [...new Set(ids)].slice(0, 2) };
}

export async function coachReply(trip: Trip, guide: Guide, history: Turn[]): Promise<CoachReply> {
  if (hasModel()) {
    try {
      const raw = await complete(coachSystem(trip, guide), history.slice(-12));
      if (raw) return extractScenes(raw, guide);
    } catch (e) {
      if (__DEV__) console.warn('[coach]', e);
    }
  }
  return offlineCoach(trip, guide, history[history.length - 1]?.text ?? '');
}

// ---- story explanations ----------------------------------------------------

export async function explain(trip: Trip, guide: Guide, item: { title: string; sub?: string; body: string }): Promise<string> {
  const from = byCode(trip.from)?.name ?? trip.from;
  const to = byCode(trip.to)?.name ?? trip.to;
  if (hasModel()) {
    try {
      const system = `You explain customs to travellers. Write 70 to 120 words on why people in ${to} do this, where it comes from, and how it may feel to someone from ${from}. Two short paragraphs, plain words, short sentences. Start with the reason, not an introduction. No markdown, lists or dashes. No stock phrases such as "rich history", "deeply rooted", "navigate" or "nuance". End with one practical tip.`;
      const raw = await complete(system, [{ role: 'user', text: `Custom: ${item.title}${item.sub ? `. ${item.sub}` : ''}.\nNotes: ${item.body}` }]);
      if (raw) return tidy(raw);
    } catch (e) {
      if (__DEV__) console.warn('[explain]', e);
    }
  }
  return offlineExplain(trip, item);
}

function offlineExplain(trip: Trip, item: { body: string }) {
  const a = byCode(trip.from), b = byCode(trip.to);
  if (!a || !b) return item.body;
  const top = shifts(a, b)[0];
  const extra = top && Math.abs(top.delta) >= 2 ? `\n\nComing from ${a.name}: ${top.text}` : '';
  return `${item.body}${extra}`;
}

// ---- offline coach ---------------------------------------------------------

const TOPICS: { words: string[]; topics: Rule['topic'][]; cats?: Scene['cat'][] }[] = [
  { words: ['greet', 'hello', 'hi', 'meet', 'introduce', 'handshake', 'shake', 'kiss', 'hug', 'bow', 'wai', 'namaste'], topics: ['greeting'], cats: ['greet'] },
  { words: ['eat', 'food', 'dinner', 'lunch', 'restaurant', 'meal', 'table', 'drink', 'toast', 'chopstick', 'full', 'refuse', 'tea', 'coffee'], topics: ['dining', 'home'] },
  { words: ['gift', 'present', 'flowers', 'bring', 'wrap'], topics: ['gifts'], cats: ['home'] },
  { words: ['home', 'house', 'invite', 'invited', 'visit', 'host', 'family', 'shoes', 'parents'], topics: ['home', 'gifts'], cats: ['home'] },
  { words: ['tip', 'tipping', 'pay', 'bill', 'money', 'cash', 'price'], topics: ['money'] },
  { words: ['wear', 'dress', 'clothes', 'shorts', 'scarf', 'temple', 'mosque', 'church'], topics: ['dress', 'religion'] },
  { words: ['work', 'meeting', 'business', 'colleague', 'boss', 'office', 'card'], topics: ['business'], cats: ['business'] },
  { words: ['point', 'gesture', 'hand', 'finger', 'thumb', 'ok', 'wave', 'call', 'beckon', 'head', 'feet', 'left'], topics: ['gestures'], cats: ['gesture'] },
  { words: ['photo', 'picture', 'camera', 'phone', 'train', 'bus', 'loud', 'queue', 'street'], topics: ['public'], cats: ['out'] },
  { words: ['say', 'talk', 'conversation', 'no', 'yes', 'topic', 'politics', 'joke', 'offend', 'offended', 'sorry', 'mistake', 'rude'], topics: ['talk'] },
  { words: ['pray', 'religion', 'ramadan', 'monk', 'god', 'church', 'mosque', 'temple'], topics: ['religion'] },
];

const words = (s: string) => s.toLowerCase().replace(/[^a-zÀ-ɏ\s']/g, ' ').split(/\s+/).filter((w) => w.length > 1);

function offlineCoach(trip: Trip, guide: Guide, question: string): CoachReply {
  const q = words(question);
  const qs = new Set(q);
  const topics = new Set<Rule['topic']>();
  const cats = new Set<Scene['cat']>();
  for (const t of TOPICS) if (t.words.some((w) => qs.has(w) || q.some((x) => x.startsWith(w)))) { t.topics.forEach((x) => topics.add(x)); t.cats?.forEach((x) => cats.add(x)); }

  const score = (r: Rule) => {
    const text = new Set(words(`${r.title} ${r.body}`));
    let s = topics.has(r.topic) ? 3 : 0;
    for (const w of text) if (w.length > 3 && qs.has(w)) s += 1.5;
    if (s > 0 && r.kind === 'avoid') s += 0.2;
    return s;
  };
  const scored = guide.rules.map((r) => ({ r, s: score(r) })).filter((x) => x.s >= 1.5).sort((a, b) => b.s - a.s);
  // Keep the second answer only if it is nearly as relevant as the first.
  const ranked = scored.filter((x, i) => i === 0 || (i === 1 && x.s >= scored[0].s * 0.6)).map((x) => x.r);
  const toName = byCode(trip.to)?.name ?? trip.to;
  const country = /^United /.test(toName) ? `the ${toName}` : toName;
  const from = byCode(trip.from);

  let scenes = ranked.map((r) => r.scene).filter(Boolean) as string[];
  if (scenes.length === 0) {
    for (const s of guide.scenes) {
      if (scenes.length >= 1) break;
      const hit = cats.has(s.cat) || words(`${s.title} ${s.sub}`).some((w) => w.length > 3 && qs.has(w));
      if (hit && !scenes.includes(s.id)) scenes.push(s.id);
    }
  }
  scenes = [...new Set(scenes)].slice(0, 2);

  // Making amends is the same everywhere, but the word for sorry is not.
  if (['offend', 'offended', 'apologise', 'apologize', 'mistake', 'sorry', 'upset'].some((w) => qs.has(w))) {
    const sorry = guide.phrases.find((p) => /sorry/i.test(p.en));
    const same = sorry && sorry.local.toLowerCase().includes(sorry.en.toLowerCase());
    const line = !sorry ? '' : same ? `Say "${sorry.local}". ` : `Say "${sorry.local}"${sorry.roman ? ` (${sorry.roman})` : ''}, which means ${sorry.en.toLowerCase()}. `;
    return {
      text: `Apologise soon and keep it short. ${line}Do not explain at length or argue about whether it was rude. A small kind act later helps more than a long speech.`,
      scenes: [],
    };
  }

  if (!ranked.length) {
    const starters = guide.rules.filter((r) => r.phase === 'day1').slice(0, 2);
    return {
      text: `I have nothing saved on that. Two things to know for your first days in ${country}:\n\n${starters.map((r) => `${r.title}. ${r.body}`).join('\n\n')}\n\nYou can ask about greetings, food, gifts, visiting a home, tipping or gestures.`,
      scenes: guide.scenes.slice(0, 1).map((s) => s.id),
    };
  }

  let text = `${ranked.map((r) => `${r.title}. ${r.body}`).join('\n\n')}`;
  if (from) {
    const extra = originNotes(from, byCode(trip.to)!).find((n) => (topics.has('money') && /tip/i.test(n)) || (topics.has('home') && /shoe/i.test(n)) || (topics.has('dining') && /hand/i.test(n)));
    if (extra) text += `\n\nComing from ${from.name}: ${extra}`;
  }
  return { text, scenes };
}

export function starterPrompts(trip: Trip, guide: Guide): string[] {
  const base = [
    'I have been invited to a family dinner. What should I know?',
    'How do I politely refuse more food?',
    'What gift should I bring, and how do I give it?',
    'I think I offended someone. How do I make it right?',
  ];
  if (trip.purpose === 'business') base.splice(1, 0, 'How do I behave in my first business meeting?');
  if (guide.code === 'JP' || guide.code === 'KR') base.push('Is it rude to eat or talk on the train?');
  if (guide.code === 'AE' || guide.code === 'AZ' || guide.code === 'TR') base.push('How should I greet someone of the opposite gender?');
  if (guide.code === 'US') base.push('How much should I tip, and where?');
  return base.slice(0, 5);
}
