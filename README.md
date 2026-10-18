# Adab

A culture coach for travellers. Pick where you are from, where you are going and how long you stay. Adab shows how people there greet, give, eat and say no, acted out by realistic 3D people, and a coach helps with the moments that get tricky.

Built with Expo SDK 54 (React Native 0.81) so it runs in Expo Go.

## Run it on your iPhone

```bash
npm install
```

```bash
npx expo start
```

Scan the QR code with the iPhone camera and open it in Expo Go. Phone and computer must be on the same Wi-Fi. If the network blocks it, use `npx expo start --tunnel`.

The first scene takes a moment while the 3D people load. After that they are cached.

## Plug in the LLM

Copy `.env.example` to `.env` and set one provider:

- `EXPO_PUBLIC_ANTHROPIC_API_KEY` for Claude (`claude-opus-5-5` by default)
- `EXPO_PUBLIC_GEMINI_API_KEY` for Gemini (`gemini-2.5-flash` by default)
- `EXPO_PUBLIC_OPENAI_API_KEY` plus `EXPO_PUBLIC_OPENAI_BASE_URL` for any OpenAI-compatible API

`EXPO_PUBLIC_LLM_MODEL` overrides the model name. Restart Expo after editing `.env`.

The model writes the coach replies and the "story behind it" explanations. With no key set, both fall back to the built-in guides, so the demo never breaks.

`EXPO_PUBLIC_` values are bundled into the app. That is fine for a hackathon demo; for a public release, move the call behind a small server.

## What is where

```
src/app/            screens (expo-router)
  welcome.tsx       live 3D greeting reel
  onboarding.tsx    name, home, destination, stay
  (tabs)/index      Brief: culture shift, day-by-day plan, essentials
  (tabs)/scenes     scene gallery
  (tabs)/coach      AI coach chat
  (tabs)/phrases    phrasebook with pronunciation
  scene/[id].tsx    scene player: Do / Avoid, cameras, synced steps
src/data/           countries, destination guides, scene timelines
src/lib/            culture-shift maths, coach + LLM providers, storage
src/components/     Stage (3D WebView), UI kit
stage/              the 3D engine (three.js), bundled into src/stage/stage-html.ts
assets/avatars/     the people (glTF), assets/stage/clips.bin motion capture
```

## The 3D stage

The people are Microsoft Rocketbox avatars (MIT, see `assets/avatars/LICENSE-Rocketbox.md`), converted from FBX to glTF with WebP textures, about 1 MB each. Idle, wave, nod, head shake, talk, shrug, invite and phone clips are Rocketbox motion capture. Bows, handshakes, cheek kisses, namaste, wai, hand on heart, card and gift exchange and the gestures to avoid are generated on the same skeleton with two-bone arm IK, hand orientation and finger curls (`stage/src/gestures.js`).

The engine runs three.js inside a WebView. Models travel from the app bundle to the page as base64, so nothing is fetched from the internet.

After editing anything in `stage/src`:

```bash
npm run stage
```

## Adding a destination

1. Add the country profile to `src/data/countries.ts` if it is new.
2. Write a guide in `src/data/guides/` (facts, rules by phase, phrases, scenes built from `src/data/perf.ts`) and add it to `GUIDES`.
3. Scene thumbnails live in `assets/thumbs/`. They are rendered from the stage itself; until you render new ones, add the scene id to `src/data/images.ts` pointing at an existing image.
