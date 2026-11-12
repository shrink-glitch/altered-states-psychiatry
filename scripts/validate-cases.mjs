// Checks every case file for structural errors before build.
// Usage: npm run validate
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import * as yaml from 'js-yaml';

const root = new URL('..', import.meta.url).pathname;
const casesDir = join(root, 'content/cases');
const guideDir = join(root, 'content/guide');
const bib = readFileSync(join(root, 'content/references.bib'), 'utf8');
const bibKeys = new Set([...bib.matchAll(/@\w+\s*\{\s*([^,\s]+)\s*,/g)].map((m) => m[1]));

// guide slugs and section ids
const guide = {};
for (const f of readdirSync(guideDir).filter((f) => f.endsWith('.md'))) {
  const slug = f.replace(/^\d+-/, '').replace(/\.md$/, '');
  const fm = readFileSync(join(guideDir, f), 'utf8').match(/^---\n([\s\S]*?)\n---/);
  const data = fm ? yaml.load(fm[1]) : {};
  guide[slug] = new Set((data.sections || []).map((s) => s.id));
  for (const r of data.references || []) if (!bibKeys.has(r)) console.error(`✗ guide/${f}: unknown reference "${r}"`);
}

const RATINGS = new Set(['best', 'acceptable', 'poor', 'unsafe']);
let errors = 0;
const err = (file, msg) => { errors++; console.error(`✗ ${file}: ${msg}`); };

function checkGuideRef(file, ref) {
  const [slug, id] = ref.split('#');
  if (!guide[slug]) return err(file, `unknown guide page "${slug}"`);
  if (id && !guide[slug].has(id)) err(file, `unknown guide section "${ref}"`);
}

for (const f of readdirSync(casesDir).filter((f) => f.endsWith('.yaml'))) {
  let c;
  try { c = yaml.load(readFileSync(join(casesDir, f), 'utf8')); } catch (e) { err(f, `YAML error - ${e.message}`); continue; }
  for (const k of ['title', 'subtitle', 'status', 'vignette', 'stages', 'teaching_points']) if (!c[k]) err(f, `missing "${k}"`);
  if (!['draft', 'published', 'hidden'].includes(c.status)) err(f, `status must be draft, published or hidden`);
  if (c.status === 'published' && (c.reviewers || []).length < 2) err(f, 'published cases need at least two reviewers');
  const ids = new Set();
  for (const s of c.stages || []) {
    if (!s.id) err(f, 'a stage has no id');
    if (ids.has(s.id)) err(f, `duplicate stage id "${s.id}"`);
    ids.add(s.id);
  }
  for (const s of c.stages || []) {
    const opts = s.options || [];
    if (opts.length) {
      const best = opts.filter((o) => o.rating === 'best').length;
      if (best !== 1) err(f, `stage "${s.id}" should have exactly one "best" option (has ${best})`);
      for (const o of opts) {
        if (!RATINGS.has(o.rating)) err(f, `stage "${s.id}": invalid rating "${o.rating}"`);
        if (!o.feedback) err(f, `stage "${s.id}": an option has no feedback`);
        if (o.next && !ids.has(o.next)) err(f, `stage "${s.id}": next "${o.next}" does not exist`);
      }
    }
    if (s.next && !ids.has(s.next)) err(f, `stage "${s.id}": next "${s.next}" does not exist`);
    for (const g of s.guide_links || []) checkGuideRef(f, g);
    const text = [s.body, s.question, ...opts.map((o) => o.text + o.feedback)].join(' ');
    for (const m of text.matchAll(/\(guide:([a-z0-9-]+(?:#[a-z0-9-]+)?)\)/g)) checkGuideRef(f, m[1]);
  }
  for (const r of c.references || []) if (!bibKeys.has(r)) err(f, `unknown reference "${r}"`);
  if (!errors) console.log(`✓ ${f}`);
}

if (errors) { console.error(`\n${errors} problem(s) found.`); process.exit(1); }
console.log('All cases valid.');
