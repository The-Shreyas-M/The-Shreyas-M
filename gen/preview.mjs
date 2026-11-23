import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const arg = process.argv[2];
const inputPath = arg ? path.resolve(process.cwd(), arg) : path.join(root, 'README.md');

if (!fs.existsSync(inputPath)) {
  console.error(`README not found: ${inputPath}`);
  process.exit(1);
}

const res = spawnSync('gh', ['api', '-X', 'POST', 'markdown/raw', '-H', 'Content-Type: text/plain', '--input', inputPath], { encoding: 'utf8', shell: false });
if (res.status !== 0) {
  if (res.stderr) process.stderr.write(res.stderr);
  process.exit(1);
}

let fragment = res.stdout;

fragment = fragment.replace(/<img\b[^>]*>/g, (tag) => {
  const m = tag.match(/data-canonical-src="([^"]*)"/);
  if (!m) return tag;
  return tag.replace(/\bsrc="[^"]*"/, `src="${m[1]}"`);
});

function transformSingle(url) {
  let u = url.trim();
  let m = u.match(/^https:\/\/raw\.githubusercontent\.com\/The-Shreyas-M\/The-Shreyas-M\/output\/(.+)$/);
  if (m) return '../dist/' + m[1];
  m = u.match(/^.*\/The-Shreyas-M\/The-Shreyas-M\/(?:raw|blob)\/main\/(.+)$/);
  if (m) return '../' + m[1];
  let clean = u.replace(/^\.\//, '');
  if (clean.startsWith('assets/') || clean.startsWith('dist/')) {
    return '../' + clean;
  }
  return u;
}

function transformSrcset(value) {
  return value.split(',').map((part) => {
    const trimmed = part.trim();
    if (!trimmed) return part;
    const match = trimmed.match(/^(\S+)(.*)$/);
    if (!match) return part;
    const newUrl = transformSingle(match[1]);
    return part.replace(match[1], newUrl);
  }).join(',');
}

fragment = fragment.replace(/\b(src|href|srcset)="([^"]*)"/g, (full, attr, value) => {
  const next = attr === 'srcset' ? transformSrcset(value) : transformSingle(value);
  return `${attr}="${next}"`;
});

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Profile preview — The-Shreyas-M</title>
<style>
body { background: #0d1117; color: #e6edf3; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.5; margin: 0; }
.topbar { height: 64px; background: #010409; border-bottom: 1px solid #30363d; }
.container { max-width: 1280px; margin: 0 auto; padding: 24px 32px; display: grid; grid-template-columns: 296px 1fr; gap: 24px; }
.avatar { width: 296px; height: 296px; border-radius: 50%; background: #161b22; border: 1px solid #30363d; }
.name { font-size: 24px; font-weight: 700; margin-top: 12px; }
.rightbox { border: 1px solid #30363d; border-radius: 6px; padding: 24px; }
.headerline { font-size: 12px; color: #8b949e; margin-bottom: 12px; }
.markdown-body img { max-width: 100%; box-sizing: content-box; }
.markdown-body a { color: #4493f8; text-decoration: none; }
.markdown-body h1, .markdown-body h2 { border-bottom: 1px solid #30363d; padding-bottom: .3em; }
.markdown-body p { margin: 0 0 16px; }
.markdown-body [align=center] { text-align: center; }
.markdown-body hr { height: .25em; background: #30363d; border: 0; }
@media (max-width: 768px) {
  .container { grid-template-columns: 1fr; padding: 16px; }
  .avatar { width: 120px; height: 120px; }
}
</style>
</head>
<body>
<div class="topbar"></div>
<div class="container">
  <div class="left">
    <div class="avatar"></div>
    <div class="name">The-Shreyas-M</div>
  </div>
  <div>
    <div class="rightbox">
      <div class="headerline">The-Shreyas-M / README.md</div>
      <article class="markdown-body">
${fragment}
      </article>
    </div>
  </div>
</div>
</body>
</html>
`;

const outDir = path.join(root, 'preview');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'index.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log(`PREVIEW WRITTEN ${outPath}`);
