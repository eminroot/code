export type Dim = 'space' | 'touch' | 'time' | 'direct' | 'formal' | 'volume' | 'eye';

export type Country = {
  code: string;
  name: string;
  flag: string;
  dims: Record<Dim, number>;
  tip: number;
  shoes: boolean;
  left: boolean;
};

export type StageEvent = {
  t: number;
  clip?: string;
  once?: boolean;
  then?: string;
  g?: string;
  dur?: number;
  p?: Record<string, unknown>;
};

export type Performance = {
  duration: number;
  gap: number;
  camera?: 'three' | 'side' | 'close' | 'pov' | 'local';
  events: { you: StageEvent[]; local: StageEvent[] };
  beats: number[];
  props?: { id: string; kind: 'card' | 'gift'; color?: string; at: { t: number; holder: 'you' | 'local' | null; facing?: 'in' | 'out' }[] }[];
  solo?: boolean;
};

export type SceneCat = 'greet' | 'business' | 'home' | 'gesture' | 'out';

// Something a person says during a scene, shown as a speech bubble.
// {name} and {home} are replaced with the traveller's name and home country.
export type Line = { t: number; who: 'you' | 'local'; en: string; local?: string; roman?: string; dur?: number };

export type Scene = {
  id: string;
  title: string;
  sub: string;
  cat: SceneCat;
  local: 'm' | 'f';
  you?: 'm' | 'f';
  do: Performance;
  avoid?: Performance;
  steps: string[];
  avoidSteps?: string[];
  why: string;
  say?: Phrase;
  lines?: Line[];
  avoidLines?: Line[];
};

export type Phase = 'before' | 'day1' | 'week' | 'long';
export type Topic = 'greeting' | 'dining' | 'gifts' | 'dress' | 'money' | 'religion' | 'talk' | 'home' | 'public' | 'business' | 'gestures';

export type Rule = {
  id: string;
  phase: Phase;
  kind: 'do' | 'avoid' | 'know';
  topic: Topic;
  title: string;
  body: string;
  scene?: string;
};

export type Phrase = {
  en: string;
  local: string;
  roman?: string;
  note?: string;
  cat?: 'greet' | 'polite' | 'dining' | 'help';
};

export type Talk = {
  starters: { say: string; local?: string; roman?: string; why: string }[];
  topics: string[];
  avoid: { topic: string; why: string }[];
  asked: { q: string; a: string; note?: string }[];
  compliments: { say: string; local?: string; roman?: string }[];
};

export type Guide = {
  code: string;
  color: string;
  talk: Talk;
  lang: string;
  hello: { local: string; roman?: string };
  tagline: string;
  intro: string;
  avatars: { m: string; f: string };
  facts: { label: string; value: string }[];
  rules: Rule[];
  phrases: Phrase[];
  scenes: Scene[];
};

export type GuideSource = Omit<Guide, 'color' | 'talk'>;

export type Purpose = 'holiday' | 'business' | 'study' | 'family';

export type Trip = {
  name: string;
  avatar: 'm' | 'f';
  from: string;
  to: string;
  days: number;
  purpose: Purpose;
  createdAt: number;
};
