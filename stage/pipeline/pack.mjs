// Pack an FBX2glTF output plus prepared WebP maps into one mobile GLB.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTTextureWebP } from '@gltf-transform/extensions';
import { prune, dedup, weld } from '@gltf-transform/functions';
import fs from 'node:fs';
import path from 'node:path';

const [rawGltf, texDir, outGlb] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(rawGltf);
const root = doc.getRoot();
doc.createExtension(EXTTextureWebP).setRequired(true);

for (const t of root.listTextures()) t.dispose();
const has = (name) => fs.existsSync(path.join(texDir, name + '.webp'));
const tex = (name) => has(name) ? doc.createTexture(name).setImage(fs.readFileSync(path.join(texDir, name + '.webp'))).setMimeType('image/webp').setURI(name + '.webp') : null;

for (const m of root.listMaterials()) {
  const part = m.getName().replace(/^[a-z]\d+_/, '');
  m.setMetallicFactor(0).setRoughnessFactor(1).setEmissiveFactor([0, 0, 0]).setBaseColorFactor([1, 1, 1, 1]);
  if (part === 'opacity') {
    m.setBaseColorTexture(tex('opacity_color')).setAlphaMode('MASK').setAlphaCutoff(0.4).setDoubleSided(true);
    m.setNormalTexture(null).setMetallicRoughnessTexture(null).setRoughnessFactor(0.7);
  } else {
    m.setBaseColorTexture(tex(part + '_color')).setNormalTexture(tex(part + '_normal')).setNormalScale(1);
    m.setMetallicRoughnessTexture(tex(part + '_mr')).setAlphaMode('OPAQUE').setDoubleSided(part === 'keffiyeh');
    if (!has(part + '_mr')) m.setRoughnessFactor(0.75);
  }
  m.setName(part);
}
for (const mesh of root.listMeshes()) for (const p of mesh.listPrimitives()) if (p.getAttribute('COLOR_0')) p.setAttribute('COLOR_0', null);
for (const a of root.listAnimations()) a.dispose();
await doc.transform(weld(), dedup(), prune());
await io.write(outGlb, doc);
console.log('wrote', outGlb, fs.statSync(outGlb).size);
