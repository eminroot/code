// Static server for the project plus a POST endpoint that writes captured images
// into assets/portraits or assets/thumbs only.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(process.argv[2] || '.');
const port = Number(process.argv[3] || 8766);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.bin': 'application/octet-stream', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'POST' && url.pathname === '/save') {
    const rel = url.searchParams.get('path') || '';
    if (!/^assets\/(portraits|thumbs)\/[a-z0-9_-]+\.(jpg|png)$/.test(rel)) { res.writeHead(400); return res.end('bad path'); }
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      const b64 = body.slice(body.indexOf(',') + 1);
      const out = path.join(root, rel);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, Buffer.from(b64, 'base64'));
      res.writeHead(200); res.end('ok ' + fs.statSync(out).size);
    });
    return;
  }
  const file = path.join(root, decodeURIComponent(url.pathname));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log('saver on', port));
