import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function collectFrom(startAbs, files) {
  let stat;
  try { stat = fs.statSync(startAbs); } catch { return; }
  if (stat.isDirectory()) {
    let entries;
    try { entries = fs.readdirSync(startAbs); } catch { return; }
    for (const name of entries) {
      collectFrom(path.join(startAbs, name), files);
    }
  } else if (stat.isFile()) {
    const ext = path.extname(startAbs).toLowerCase();
    if (ext === '.svg' || ext === '.webp' || ext === '.gif') {
      files.push(startAbs);
    }
  }
}

const args = process.argv.slice(2);
const starts = [];
if (args.length > 0) {
  for (const a of args) {
    starts.push(path.resolve(process.cwd(), a));
  }
} else {
  starts.push(path.join(repoRoot, 'assets'));
  const dist = path.join(repoRoot, 'dist');
  if (fs.existsSync(dist)) starts.push(dist);
}

const fileSet = new Set();
for (const s of starts) {
  if (!fs.existsSync(s)) continue;
  const collected = [];
  collectFrom(s, collected);
  for (const f of collected) fileSet.add(f);
}
const files = [...fileSet].sort();

if (files.length === 0) {
  console.log('NO ASSETS FOUND');
  process.exit(0);
}

const problems = [];

for (const file of files) {
  const rel = path.relative(repoRoot, file).replace(/\\/g, '/');
  const stat = fs.statSync(file);
  const ext = path.extname(file).toLowerCase();

  if (ext === '.webp' || ext === '.gif') {
    if (stat.size > 5242880) {
      const line = `FAIL ${rel}: larger than 5 MB`;
      console.log(line);
      problems.push(line);
    }
    continue;
  }

  let content;
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch {
    content = '';
  }
  const lower = content.toLowerCase();
  const size = stat.size;

  if (lower.includes('<script')) {
    const line = `FAIL ${rel}: script tag`;
    console.log(line); problems.push(line);
  }
  if (lower.includes('<foreignobject')) {
    const line = `FAIL ${rel}: foreignObject`;
    console.log(line); problems.push(line);
  }
  if (lower.includes('href="http') || lower.includes("href='http") ||
      lower.includes('xlink:href="http') || lower.includes("xlink:href='http")) {
    const line = `FAIL ${rel}: external href`;
    console.log(line); problems.push(line);
  }
  if (lower.includes('url(http') || lower.includes("url('http") || lower.includes('url("http')) {
    const line = `FAIL ${rel}: external url()`;
    console.log(line); problems.push(line);
  }
  if (lower.includes('@import')) {
    const line = `FAIL ${rel}: @import`;
    console.log(line); problems.push(line);
  }
  if (/\son[a-z]+\s*=/i.test(content)) {
    const line = `FAIL ${rel}: event handler attribute`;
    console.log(line); problems.push(line);
  }
  if (size > 1048576) {
    const line = `FAIL ${rel}: larger than 1 MB`;
    console.log(line); problems.push(line);
  }
  // Owner 2026-11-26: always animate, like other profile READMEs; a reduced-motion freeze stopped everything on his laptop
  if (lower.includes('prefers-reduced-motion')) {
    const line = `FAIL ${rel}: has a prefers-reduced-motion freeze`;
    console.log(line); problems.push(line);
  }
  let trimmed = content.trimStart();
  if (trimmed.toLowerCase().startsWith('<?xml')) {
    const idx = trimmed.indexOf('?>');
    if (idx !== -1) {
      trimmed = trimmed.slice(idx + 2).trimStart();
    }
  }
  if (!trimmed.toLowerCase().startsWith('<svg')) {
    const line = `FAIL ${rel}: not an svg root`;
    console.log(line); problems.push(line);
  }
  if (!/viewBox\s*=/i.test(content)) {
    const line = `FAIL ${rel}: missing viewBox`;
    console.log(line); problems.push(line);
  }
}

if (problems.length > 0) {
  console.log(`${problems.length} PROBLEMS`);
  process.exit(1);
} else {
  console.log(`ALL ASSETS OK (${files.length} files)`);
  process.exit(0);
}
