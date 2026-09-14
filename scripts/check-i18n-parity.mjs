// scripts/check-i18n-parity.mjs — plain Node, no deps. Not a test file.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MSG_DIR = resolve(__dirname, '../src/i18n/messages');
// Mirrors ENABLED_LOCALES in src/i18n/locales.ts — keep the two lists in sync.
const LOCALES = ['en', 'he', 'ar', 'ru', 'fr', 'es'];
const args = process.argv.slice(2);
const only = args.includes('--locale') ? args[args.indexOf('--locale') + 1] : null;
const allowMissing = args.includes('--allow-missing');

if (only && !LOCALES.includes(only)) {
  console.error(`unknown --locale "${only}" (known: ${LOCALES.join(', ')})`);
  process.exit(2);
}

// Remove // line comments and /* block comments */ that sit OUTSIDE string
// literals, so a commented-out draft line (`// 'k': 'v',`) never mints a
// phantom key. A char scanner (not a regex) is used so a `//` or `/*` that is
// part of an actual message value is left untouched.
function stripComments(s) {
  let out = '';
  let quote = null; // ' " or ` while inside a string literal, else null
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const d = s[i + 1];
    if (quote) {
      out += c;
      if (c === '\\') { out += s[i + 1] ?? ''; i++; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; out += c; continue; }
    if (c === '/' && d === '/') { while (i < s.length && s[i] !== '\n') i++; out += '\n'; continue; }
    if (c === '/' && d === '*') {
      i += 2;
      while (i < s.length && !(s[i] === '*' && s[i + 1] === '/')) i++;
      i++; // land on '/', loop's i++ steps past it
      continue;
    }
    out += c;
  }
  return out;
}

// Extract 'key': 'value' pairs from a messages file without importing TS.
// Keys are simple quoted string literals; values may be single- or double-quoted,
// possibly spanning lines with escaped quotes. Good enough for parity accounting.
function parseMessages(code) {
  const src = readFileSync(resolve(MSG_DIR, `${code}.ts`), 'utf8');
  // Start at the object literal, not the `import type { MessageKey }` brace above it.
  const objAt = src.indexOf('= {');
  const body = stripComments(src.slice(objAt >= 0 ? objAt + 3 : src.indexOf('{') + 1));
  const re = /(['"])((?:\\.|(?!\1).)*?)\1\s*:\s*(['"])((?:\\.|(?!\3).)*?)\3\s*,?/gs;
  const out = new Map();
  let m;
  while ((m = re.exec(body))) out.set(m[2], m[4]);
  return out;
}

const en = parseMessages('en');
const enPlaceholders = (v) => new Set([...v.matchAll(/\{(\w+)\}/g)].map((x) => x[1]));

let failed = false;
const rows = [];
for (const code of LOCALES) {
  if (only && code !== only) continue;
  if (code === 'en') continue;
  const loc = parseMessages(code);
  let missing = 0, stray = 0, empty = 0, ph = 0;
  for (const [k, ev] of en) {
    if (!loc.has(k)) { missing++; continue; }
    const lv = loc.get(k);
    if (lv.trim() === '') empty++;
    const want = enPlaceholders(ev), got = enPlaceholders(lv);
    for (const p of want) if (!got.has(p)) { ph++; break; }
  }
  for (const k of loc.keys()) if (!en.has(k)) stray++;
  rows.push({ code, missing, stray, empty, ph });
  const hardFail = stray > 0 || empty > 0 || ph > 0 || (!allowMissing && missing > 0);
  if (hardFail) failed = true;
}

for (const r of rows) {
  console.log(
    `${r.code}: missing=${r.missing} stray=${r.stray} empty=${r.empty} placeholder-mismatch=${r.ph}`,
  );
}
process.exit(failed ? 1 : 0);
