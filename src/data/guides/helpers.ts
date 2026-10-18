import type { Phase, Rule, Topic } from '../types';

export const r = (
  id: string, phase: Phase, kind: Rule['kind'], topic: Topic,
  title: string, body: string, scene?: string,
): Rule => ({ id, phase, kind, topic, title, body, scene });
