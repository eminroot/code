// One small interface over whichever model the team plugs in.
// Configure with EXPO_PUBLIC_* variables in .env (see .env.example).

export type Turn = { role: 'user' | 'assistant'; text: string };

const env = {
  provider: (process.env.EXPO_PUBLIC_LLM_PROVIDER || '').toLowerCase(),
  anthropicKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '',
  geminiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
  openaiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  openaiBase: process.env.EXPO_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com/v1',
  model: process.env.EXPO_PUBLIC_LLM_MODEL || '',
};

type Provider = 'anthropic' | 'gemini' | 'openai' | 'none';

export function provider(): Provider {
  if (env.provider === 'anthropic' && env.anthropicKey) return 'anthropic';
  if (env.provider === 'gemini' && env.geminiKey) return 'gemini';
  if (env.provider === 'openai' && env.openaiKey) return 'openai';
  if (env.anthropicKey) return 'anthropic';
  if (env.geminiKey) return 'gemini';
  if (env.openaiKey) return 'openai';
  return 'none';
}

export const hasModel = () => provider() !== 'none';

// Raw HTTP here: the official SDK fails to initialise under Metro (circular import
// error at startup), so React Native talks to the Messages API directly.
async function viaAnthropic(system: string, turns: Turn[]): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.anthropicKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'server-side-fallback-2026-07-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: env.model || 'claude-opus-5-5',
      max_tokens: 8000,
      system,
      output_config: { effort: 'low' },
      fallbacks: 'default',
      messages: turns.map((t) => ({ role: t.role, content: t.text })),
    }),
  });
  if (!res.ok) throw new Error('anthropic ' + res.status);
  const data = await res.json();
  if (data.stop_reason === 'refusal') throw new Error('refused');
  return (data.content ?? []).map((b: { type: string; text?: string }) => (b.type === 'text' ? b.text ?? '' : '')).join('').trim();
}

async function viaGemini(system: string, turns: Turn[]): Promise<string> {
  const model = env.model || 'gemini-2.5-flash';
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.geminiKey}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: turns.map((t) => ({ role: t.role === 'assistant' ? 'model' : 'user', parts: [{ text: t.text }] })),
      generationConfig: { temperature: 0.7, maxOutputTokens: 1200 },
    }),
  });
  if (!res.ok) throw new Error('gemini ' + res.status);
  const data = await res.json();
  return (data.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? '').join('').trim();
}

async function viaOpenAI(system: string, turns: Turn[]): Promise<string> {
  const res = await fetch(`${env.openaiBase.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${env.openaiKey}` },
    body: JSON.stringify({
      model: env.model || 'gpt-4o-mini',
      temperature: 0.7,
      messages: [{ role: 'system', content: system }, ...turns.map((t) => ({ role: t.role, content: t.text }))],
    }),
  });
  if (!res.ok) throw new Error('openai ' + res.status);
  const data = await res.json();
  return String(data.choices?.[0]?.message?.content ?? '').trim();
}

export async function complete(system: string, turns: Turn[]): Promise<string> {
  const p = provider();
  if (p === 'anthropic') return viaAnthropic(system, turns);
  if (p === 'gemini') return viaGemini(system, turns);
  if (p === 'openai') return viaOpenAI(system, turns);
  throw new Error('no model configured');
}
