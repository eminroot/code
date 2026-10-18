# Convert Rocketbox TGA textures into small WebP maps for one avatar.
import sys, os, glob, re
import numpy as np
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
def save(im, name, size, q):
    im = im.resize((size, size), Image.LANCZOS)
    im.save(os.path.join(out, name + '.webp'), 'WEBP', quality=q, method=6)
for f in sorted(glob.glob(os.path.join(src, '*_color.tga'))):
    part = re.match(r'^[a-z]\d+_(.+)_color\.tga$', os.path.basename(f)).group(1)
    if part == 'opacity':
        save(Image.open(f).convert('RGBA'), 'opacity_color', 1024, 88); continue
    save(Image.open(f).convert('RGB'), part + '_color', 1024, 84)
    nf = f.replace('_color.tga', '_normal.tga'); sf = f.replace('_color.tga', '_specular.tga')
    if os.path.exists(nf): save(Image.open(nf).convert('RGB'), part + '_normal', 1024, 90)
    if os.path.exists(sf):
        s = np.asarray(Image.open(sf).convert('L')).astype(np.float32) / 255.0
        rough = np.clip(1.0 - np.sqrt(s) * 0.75, 0.32, 1.0)
        mr = np.zeros(s.shape + (3,), np.uint8); mr[..., 0] = 255; mr[..., 1] = (rough * 255).astype(np.uint8)
        save(Image.fromarray(mr), part + '_mr', 512, 85)
print('ok', sorted(os.listdir(out)))
