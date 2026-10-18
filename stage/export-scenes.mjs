// Dumps every scene's timeline to stage/dev/scenes.json so the dev page can render thumbnails.
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'dev', '_guides.mjs');
await build({ entryPoints: [path.join(here, '../src/data/guides/index.ts')], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error' });
const { GUIDES } = await import(pathToFileURL(out).href);
const scenes = [];
for (const g of GUIDES) for (const s of g.scenes) scenes.push({ id: s.id, guide: g.code, color: g.color, local: g.avatars[s.local], you: s.you, do: s.do, avoid: s.avoid || null });
fs.writeFileSync(path.join(here, 'dev', 'scenes.json'), JSON.stringify(scenes));
fs.unlinkSync(out);
console.log(scenes.length, 'scenes');
