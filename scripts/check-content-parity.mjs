// scripts/check-content-parity.mjs — plain Node, no deps. Not a test file.
//
// Walks the content layer (src/content/*.ts, which already includes
// roote.config.ts) and checks every LocalizedText entry for ar / ru / fr / es
// coverage. Three entry shapes are recognised:
//   - L('en', 'he')                       — the four new locales are absent
//   - L6({ en, he, ar, ru, fr, es })      — an object literal, keys checked
//   - bare  { en: '…', he: '…', … }       — same, used inline in roote.config.ts
//
// Usage:
//   node scripts/check-content-parity.mjs                 # exit 2 on any gap
//   node scripts/check-content-parity.mjs --allow-missing # only empty values fail
//   node scripts/check-content-parity.mjs --file brand    # scope to src/content/brand.ts
//   node scripts/check-content-parity.mjs --file roote.config
//   node scripts/check-content-parity.mjs --file meta     # scope to src/seo/meta.ts
//
// A static-parse heuristic, mirroring scripts/check-i18n-parity.mjs — it shares
// that file's comment-stripping char scanner so a commented-out draft entry
// never counts.
//
// Also scans src/seo/meta.ts (ROUTE_META page titles/descriptions) — outside
// src/content/ but the same LocalizedText shape, and previously invisible to
// this gate entirely.

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative, basename } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const CONTENT_DIR = resolve(REPO_ROOT, 'src/content');
const SEO_META_FILE = resolve(REPO_ROOT, 'src/seo/meta.ts');
const NEW_LOCALES = ['ar', 'ru', 'fr', 'es'];

const args = process.argv.slice(2);
const allowMissing = args.includes('--allow-missing');
const only = args.includes('--file') ? args[args.indexOf('--file') + 1] : null;

// Remove // line comments and /* block comments */ that sit OUTSIDE string
// literals (identical scanner to check-i18n-parity.mjs) so a commented-out draft
// (`// name: L('x', 'y'),`) never mints a phantom entry. A char scanner, not a
// regex, so a `//` inside an actual string value is left untouched.
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

// Every balanced { … } pair, with source positions, skipping string literals so
// a `{` inside an interpolation placeholder ("{count}") is not mistaken for a
// real brace.
function findBracePairs(s) {
  const pairs = [];
  const stack = [];
  let quote = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      if (c === '\\') { i++; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') stack.push(i);
    else if (c === '}' && stack.length) pairs.push({ start: stack.pop(), end: i });
  }
  return pairs;
}

// `key: 'value'` — single- or double-quoted, escapes allowed, may span lines.
const FIELD_RE = /(?<![\w$])(en|he|ar|ru|fr|es)\s*:\s*(['"])((?:\\.|(?!\2)[\s\S])*?)\2/g;
// `L('en', 'he')` — the paren must follow `L` directly, so `L6(` never matches.
const L_CALL_RE =
  /(?<![\w$])L\(\s*(['"])((?:\\.|(?!\1)[\s\S])*?)\1\s*,\s*(['"])((?:\\.|(?!\3)[\s\S])*?)\3\s*,?\s*\)/g;

function analyseFile(path) {
  const src = stripComments(readFileSync(path, 'utf8'));
  const c = { entries: 0, 'missing-ar': 0, 'missing-ru': 0, 'missing-fr': 0, 'missing-es': 0, empty: 0 };

  // Shape 1 — L('en', 'he'): en + he present, the four new locales always absent.
  for (const _m of src.matchAll(L_CALL_RE)) {
    c.entries++;
    for (const loc of NEW_LOCALES) c[`missing-${loc}`]++;
  }

  // Shapes 2 & 3 — a leaf object literal carrying both an `en:` and a `he:`
  // string field (covers L6({…}) and bare { en, he } literals). "Leaf" = no
  // nested brace pair, so a container object that merely holds a LocalizedText
  // is not itself counted (and not double-counted).
  const pairs = findBracePairs(src);
  for (const p of pairs) {
    const hasNested = pairs.some((q) => q !== p && q.start > p.start && q.start < p.end);
    if (hasNested) continue;
    const body = src.slice(p.start + 1, p.end);
    const fields = new Map();
    for (const m of body.matchAll(FIELD_RE)) fields.set(m[1], m[3]);
    if (!fields.has('en') || !fields.has('he')) continue;
    c.entries++;
    for (const loc of NEW_LOCALES) {
      if (!fields.has(loc)) c[`missing-${loc}`]++;
      else if (fields.get(loc).trim() === '') c.empty++;
    }
  }
  return c;
}

let files = readdirSync(CONTENT_DIR)
  .filter((f) => f.endsWith('.ts'))
  .map((f) => resolve(CONTENT_DIR, f))
  .sort();
files.push(SEO_META_FILE);

if (only) {
  const wantName = only.endsWith('.ts') ? only : `${only}.ts`;
  files = files.filter((f) => basename(f) === wantName);
  if (files.length === 0) {
    console.error(`unknown --file "${only}"`);
    process.exit(2);
  }
}

let failed = false;
for (const path of files) {
  const c = analyseFile(path);
  console.log(
    `${relative(REPO_ROOT, path).replace(/\\/g, '/')}: entries=${c.entries} ` +
      `missing-ar=${c['missing-ar']} missing-ru=${c['missing-ru']} ` +
      `missing-fr=${c['missing-fr']} missing-es=${c['missing-es']} empty=${c.empty}`,
  );
  const missingTotal = NEW_LOCALES.reduce((n, loc) => n + c[`missing-${loc}`], 0);
  if (c.empty > 0) failed = true;
  if (!allowMissing && missingTotal > 0) failed = true;
}

process.exit(failed ? 2 : 0);
