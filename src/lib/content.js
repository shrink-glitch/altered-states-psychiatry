// Build-time content loaders. Everything here runs during `astro build`,
// never in the browser.
import * as yaml from 'js-yaml';
import { marked } from 'marked';
import bibRaw from '../../content/references.bib?raw';

marked.use({ breaks: true });
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

// Links written as (guide:frameworks#lukoff) inside case or guide text
// are rewritten to the real site path.
function resolveGuideLinks(md) {
  return md.replace(/\(guide:([a-z0-9-]+)(#[a-z0-9-]+)?\)/g, (_, page, hash = '') => `(${BASE}/guide/${page}/${hash})`);
}

export function md(text = '') {
  return marked.parse(resolveGuideLinks(String(text)));
}
export function mdInline(text = '') {
  return marked.parseInline(resolveGuideLinks(String(text)));
}
export const url = (path) => `${BASE}/${path.replace(/^\//, '')}`;

/* ---------- references.bib ---------- */
function parseBib(raw) {
  const entries = {};
  const re = /@(\w+)\s*\{\s*([^,\s]+)\s*,([\s\S]*?)\n\}/g;
  let m;
  while ((m = re.exec(raw))) {
    const [, type, key, body] = m;
    const fields = { type: type.toLowerCase(), key };
    const fre = /(\w+)\s*=\s*[{"]([\s\S]*?)[}"]\s*,?\s*(?=\n\s*\w+\s*=|\s*$)/g;
    let f;
    while ((f = fre.exec(body))) fields[f[1].toLowerCase()] = f[2].replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
    entries[key] = fields;
  }
  return entries;
}
export const bibliography = parseBib(bibRaw);

function shortAuthors(a = '') {
  const names = a.split(/\s+and\s+/).map((n) => {
    const [last, first = ''] = n.split(',').map((s) => s.trim());
    const initials = first.split(/[\s.-]+/).filter(Boolean).map((p) => p[0]).join('');
    return `${last} ${initials}`.trim();
  });
  return names.length > 6 ? `${names.slice(0, 3).join(', ')}, et al.` : names.join(', ');
}

// Vancouver-style formatting
export function formatRef(key) {
  const r = bibliography[key];
  if (!r) return { key, html: `<em>Missing reference: ${key}</em>`, missing: true };
  let s = `${shortAuthors(r.author)}. ${r.title}.`;
  if (r.type === 'book') s += ` ${r.publisher || ''}; ${r.year}.`;
  else if (r.journal) {
    s += ` <em>${r.journal}</em>. ${r.year}`;
    if (r.volume) s += `;${r.volume}`;
    if (r.number) s += `(${r.number})`;
    if (r.pages) s += `:${r.pages}`;
    s += '.';
  } else if (r.year) s += ` ${r.year}.`;
  if (r.doi) s += ` <a href="https://doi.org/${r.doi}" target="_blank" rel="noopener">doi:${r.doi}</a>`;
  else if (r.url) s += ` <a href="${r.url}" target="_blank" rel="noopener">Link</a>`;
  return { key, html: s };
}

/* ---------- guide ---------- */
const guideModules = import.meta.glob('../../content/guide/*.md', { eager: true });
export function getGuidePages() {
  return Object.entries(guideModules)
    .map(([path, mod]) => ({
      slug: path.split('/').pop().replace(/^\d+-/, '').replace(/\.md$/, ''),
      ...mod.frontmatter,
      Content: mod.Content,
    }))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}
export function guideSummary(ref) {
  const [slug, anchor] = ref.split('#');
  const page = getGuidePages().find((p) => p.slug === slug);
  if (!page) return null;
  const section = anchor && page.sections?.find((s) => s.id === anchor);
  return {
    href: url(`guide/${slug}/${anchor ? '#' + anchor : ''}`),
    title: section?.title || page.title,
    summary: section?.summary || page.summary,
  };
}

/* ---------- cases ---------- */
const caseFiles = import.meta.glob('../../content/cases/*.yaml', { eager: true, query: '?raw', import: 'default' });

function prepareCase(raw, file) {
  const c = yaml.load(raw);
  const slug = file.split('/').pop().replace(/\.yaml$/, '');
  return {
    ...c,
    slug,
    vignetteHtml: md(c.vignette),
    objectives: c.learning_objectives || [],
    stages: (c.stages || []).map((s) => ({
      ...s,
      bodyHtml: md(s.body || ''),
      questionHtml: mdInline(s.question || ''),
      options: (s.options || []).map((o) => ({
        ...o,
        textHtml: mdInline(o.text),
        feedbackHtml: md(o.feedback || ''),
      })),
      pearlHtml: s.pearl ? md(s.pearl) : null,
      guide: (s.guide_links || []).map(guideSummary).filter(Boolean),
    })),
    teachingPointsHtml: (c.teaching_points || []).map(mdInline),
    references: (c.references || []).map(formatRef),
  };
}

export function getCases() {
  return Object.entries(caseFiles)
    .map(([file, raw]) => prepareCase(raw, file))
    .filter((c) => c.status !== 'hidden')
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

/* ---------- quiz ---------- */
import quizRaw from '../../content/quiz/core-knowledge.yaml?raw';
export function getQuiz() {
  const q = yaml.load(quizRaw);
  return {
    ...q,
    items: q.items.map((it) => ({
      ...it,
      stemHtml: mdInline(it.stem),
      options: it.options.map((o) => ({ ...o, textHtml: mdInline(o.text) })),
      explanationHtml: md(it.explanation || ''),
    })),
  };
}
