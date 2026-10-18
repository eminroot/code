# Turn FBX2glTF animation files into one compact clip pack for the stage.
import sys, os, json, glob, base64, struct
import numpy as np
src, out = sys.argv[1], sys.argv[2]
KEEP_PREFIX = ('Bip01 Pelvis','Bip01 Spine','Bip01 Neck','Bip01 Head','Bip01 L ','Bip01 R ')
CT = {5126: np.float32}
def read(g, buf, i):
    a = g['accessors'][i]; bv = g['bufferViews'][a['bufferView']]
    n = {'SCALAR':1,'VEC3':3,'VEC4':4}[a['type']]
    off = bv.get('byteOffset',0) + a.get('byteOffset',0)
    return np.frombuffer(buf, CT[a['componentType']], a['count']*n, off).reshape(a['count'], n)
pack = {}
def loop_seam(name):
    return any(k in name for k in ('idle', 'talk', 'listen_neutral', 'thoughtful', 'laugh', 'phone', 'drink', 'presentation', 'claphands'))
for gf in sorted(glob.glob(os.path.join(src, '*_out', '*.gltf'))):
    name = os.path.basename(gf)[:-5]
    g = json.load(open(gf)); buf = open(os.path.join(os.path.dirname(gf), 'buffer.bin'),'rb').read()
    if not g.get('animations'): print('skip', name); continue
    a = g['animations'][0]; nodes = g['nodes']
    clip = {'bones': {}, 'root': None}
    frames = 0
    for ch in a['channels']:
        node = nodes[ch['target']['node']]; nm = node['name']; s = a['samplers'][ch['sampler']]
        t = read(g, buf, s['input'])[:,0]; v = read(g, buf, s['output'])
        frames = max(frames, len(t))
        long_clip = len(t) > 180
        step = 3 if long_clip else 1
        cap = 12 * 30
        v = v[:cap:step]
        if ch['target']['path'] == 'rotation' and (nm == 'Bip01' or nm.startswith(KEEP_PREFIX)):
            q = v.copy()
            for k in range(1, len(q)):  # keep hemisphere continuous
                if np.dot(q[k], q[k-1]) < 0: q[k] = -q[k]
            if loop_seam(name) and len(q) > 20:  # fade the tail into frame 0 so loops are seamless
                n = min(len(q) // 4, 8 if step > 1 else 24)
                for k in range(n):
                    w = (k + 1) / n; i = len(q) - n + k
                    a0 = q[0] if np.dot(q[0], q[i]) >= 0 else -q[0]
                    m = q[i] * (1 - w) + a0 * w; q[i] = m / np.linalg.norm(m)
            if np.abs(q - q[0]).max() < 1e-4: q = q[:1]
            clip['bones'][nm.replace(' ', '_')] = base64.b64encode((np.round(q*32767)).astype('<i2').tobytes()).decode()
        elif ch['target']['path'] == 'translation' and nm == 'Bip01':
            rest = np.array(node.get('translation', [0,0,0]), np.float32)
            d = (v - rest).astype('<f4')
            if loop_seam(name) and len(d) > 20:
                n = min(len(d) // 4, 8 if step > 1 else 24)
                for k in range(n):
                    w = (k + 1) / n; i = len(d) - n + k; d[i] = d[i] * (1 - w) + d[0] * w
            clip['root'] = base64.b64encode(d.tobytes()).decode()
    clip['frames'] = len(v); clip['fps'] = 10 if frames > 180 else 30
    pack[name] = clip
json.dump(pack, open(out, 'w'), separators=(',',':'))
print(len(pack), 'clips', os.path.getsize(out), 'bytes')
