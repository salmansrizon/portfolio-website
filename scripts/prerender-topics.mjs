// Writes one static HTML file per published Topic, so a shared link previews as
// that Topic rather than as the site's generic card.
//
// Why this exists at all: the app is an SPA behind a catch-all rewrite to
// index.html, and the crawlers that build social previews — LinkedIn, Facebook,
// X, WhatsApp — do not execute JavaScript. Setting meta tags from React is
// correct for the browser and invisible to every one of them. Vercel serves a
// matching static file before applying the rewrite, so dropping a real file at
// dist/career-prep/topic/<slug>.html is enough, with no SSR framework, no edge
// function and no host coupling.
//
// REQUIRES the topic rewrite in vercel.json, which maps
// /career-prep/topic/:slug to :slug.html *before* the catch-all SPA rewrite.
// Without it these files deploy and are never served, and shared links preview
// as the generic site card.
//
// Do NOT reach for `cleanUrls: true` to solve this — it was tried in
// production and 404'd every SPA route (/career-prep, /courses, /admin),
// because with cleanUrls an extensionless path resolves against the filesystem
// and never reaches the catch-all rewrite. An explicit rewrite for this one
// route family leaves the SPA fallback untouched.
//
// Runs after `vite build`. Fetches only published Topics, with the anon key
// already in the client bundle — the same data any visitor can read.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const SUPABASE_URL = 'https://llmeentlxjauihrkkrjg.supabase.co';
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? (
  await readFile('src/integrations/supabase/client.ts', 'utf8')
).match(/eyJ[A-Za-z0-9._-]+/)?.[0];

// No invented default. A wrong canonical/og:url is worse than none: it points
// crawlers and shares at a domain that may not be yours. Vercel sets VERCEL_URL
// on every build, so this resolves itself in CI; locally it just omits the
// absolute-URL tags.
const SITE = process.env.SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  ?? (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`)
  ?? null;
const DIST = 'dist';

const escape = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// One sentence a stranger can judge: what the topic is, then why it matters.
// The analogy is deliberately not used here — out of context it reads as a
// riddle, and a preview has one line to earn the click.
const summarise = (topic) => {
  const text = `${topic.what_it_is} ${topic.why_it_matters}`.replace(/\s+/g, ' ').trim();
  return text.length > 200 ? `${text.slice(0, 197).trimEnd()}…` : text;
};

const main = async () => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/topics?select=slug,title,what_it_is,why_it_matters&status=eq.published`,
    { headers: { apikey: ANON_KEY } },
  );
  if (!res.ok) {
    console.error(`prerender: topics fetch failed (${res.status}) — skipping, build still valid`);
    return;
  }
  const topics = await res.json();
  const template = await readFile(join(DIST, 'index.html'), 'utf8');

  if (!SITE) {
    console.warn('prerender: no SITE_URL or VERCEL_URL — writing previews without canonical/og:url');
  }

  for (const topic of topics) {
    const url = SITE ? `${SITE}/career-prep/topic/${topic.slug}` : null;
    const title = `${topic.title} — Career Prep`;
    const description = summarise(topic);

    // `summary`, not `summary_large_image`: there is no per-topic OG image yet,
    // and a large-image card with no image renders as a broken box on X. A
    // small text card is the honest version until an image exists.
    const head = `
    <title>${escape(title)}</title>
    <meta name="description" content="${escape(description)}" />${url ? `
    <link rel="canonical" href="${escape(url)}" />` : ''}

    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escape(title)}" />
    <meta property="og:description" content="${escape(description)}" />${url ? `
    <meta property="og:url" content="${escape(url)}" />` : ''}

    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escape(title)}" />
    <meta name="twitter:description" content="${escape(description)}" />`;

    // Replace the generic tags rather than appending: two og:title tags is a
    // coin toss over which one a crawler believes.
    const html = template
      .replace(/<title>[\s\S]*?<\/title>/, '')
      .replace(/<meta name="description"[^>]*>/, '')
      .replace(/<meta property="og:title"[^>]*>/, '')
      .replace(/<meta property="og:description"[^>]*>/, '')
      .replace(/<meta property="og:type"[^>]*>/, '')
      .replace(/<meta name="twitter:card"[^>]*>/, '')
      .replace('</head>', `${head}\n  </head>`);

    const out = join(DIST, 'career-prep', 'topic', `${topic.slug}.html`);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, html);
  }

  console.log(`prerender: wrote ${topics.length} topic pages`);
};

await main();
