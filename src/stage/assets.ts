import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

const AVATARS: Record<string, number> = {
  trav_m: require('../../assets/avatars/trav_m.glb'),
  trav_f: require('../../assets/avatars/trav_f.glb'),
  eastasia_m: require('../../assets/avatars/eastasia_m.glb'),
  eastasia_f: require('../../assets/avatars/eastasia_f.glb'),
  gulf_m: require('../../assets/avatars/gulf_m.glb'),
  europe_m: require('../../assets/avatars/europe_m.glb'),
  europe_f: require('../../assets/avatars/europe_f.glb'),
  south_m: require('../../assets/avatars/south_m.glb'),
  south_f: require('../../assets/avatars/south_f.glb'),
};
const CLIPS = require('../../assets/stage/clips.bin');

const avatarCache = new Map<string, Promise<string>>();
let clipPack: Promise<Record<string, unknown>> | null = null;

async function localUri(mod: number) {
  const asset = Asset.fromModule(mod);
  if (!asset.localUri) await asset.downloadAsync();
  return asset.localUri ?? asset.uri;
}

async function readBase64(uri: string): Promise<string> {
  try {
    return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  } catch {
    // Fallback for URIs the file system cannot read directly.
    const blob = await (await fetch(uri)).blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const s = String(reader.result);
        resolve(s.slice(s.indexOf(',') + 1));
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }
}

export function avatarBase64(id: string) {
  let p = avatarCache.get(id);
  if (!p) {
    const mod = AVATARS[id];
    if (!mod) return Promise.reject(new Error('unknown avatar ' + id));
    p = localUri(mod).then(readBase64);
    p.catch(() => avatarCache.delete(id));
    avatarCache.set(id, p);
  }
  return p;
}

async function loadClips() {
  if (!clipPack) {
    clipPack = (async () => {
      const uri = await localUri(CLIPS);
      let text: string;
      try {
        text = await FileSystem.readAsStringAsync(uri);
      } catch {
        text = await (await fetch(uri)).text();
      }
      return JSON.parse(text);
    })();
    clipPack.catch(() => { clipPack = null; });
  }
  return clipPack;
}

export async function clipsSubset(names: string[]) {
  const pack = await loadClips();
  const out: Record<string, unknown> = {};
  for (const n of names) if (pack[n]) out[n] = pack[n];
  return out;
}

// Warm the cache so the first scene opens fast.
export function preload(ids: string[]) {
  loadClips().catch(() => {});
  ids.forEach((id) => avatarBase64(id).catch(() => {}));
}
