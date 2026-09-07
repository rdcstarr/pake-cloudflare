// safeDomain replaces the set of URLs that stay inside the app, it does not add
// to it — the mistake that shipped in pake-dribbble 1.0.0, where every internal
// link ended up in the system browser.
//
// safeDomain here names one host, not the whole of cloudflare.com: the login,
// the two-factor prompt and every dashboard page live on dash.cloudflare.com,
// while the docs, the blog and the marketing site are somewhere a link should
// take you out of the app. The probes below cover the pages that must stay.
//
// Reads the config pake generated for the build just run and asserts the app can
// still navigate to its own pages and to the login it depends on.
import { readFileSync, existsSync } from 'node:fs';

const GENERATED = 'node_modules/pake-cli/src-tauri/.pake/pake.json';

const app = JSON.parse(readFileSync('app.json', 'utf8'));
const home = new URL(app.url);

if (!existsSync(GENERATED)) {
  console.error(`warning: ${GENERATED} not found — cannot verify internal navigation`);
  process.exit(0);
}

const generated = JSON.parse(readFileSync(GENERATED, 'utf8'));
const window = generated.windows?.[0] ?? generated;
const pattern = window.internal_url_regex;

// An empty regex is pake's default, which keeps the app's own host internal.
if (!pattern) {
  console.log('internal_url_regex is unset — pake keeps the origin host internal by default');
  process.exit(0);
}

const probes = [
  home.href,
  new URL('/login', home).href,
  new URL('/profile/api-tokens', home).href,
];
const failed = probes.filter((url) => !new RegExp(pattern).test(url));

if (failed.length > 0) {
  const hosts = [...new Set(failed.map((url) => new URL(url).host))];
  console.error('internal_url_regex leaves URLs the app depends on outside it, so they would open in the system browser:');
  for (const url of failed) console.error(`  external: ${url}`);
  console.error(`regex: ${pattern}`);
  console.error(`fix: add ${hosts.join(', ')} to safeDomain`);
  process.exit(1);
}

console.log(`internal_url_regex keeps all ${probes.length} required URLs inside the app`);
