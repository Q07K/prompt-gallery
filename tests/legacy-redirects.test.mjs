import test from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { redirectPage, legacySitemap, buildRedirects, LEGACY_ROOT } from '../scripts/build-redirects.mjs';
import { projectRoot, readCatalog } from '../scripts/validate.mjs';
import { analyticsConfig } from '../src/analytics-config.mjs';

test('legacy redirects preserve detail destinations, queries and old prompt hashes without analytics', () => {
  const target = 'https://example.pages.dev/prompts/example/';
  const page = redirectPage(target);
  assert.ok(page.includes('rel="canonical" href="' + target + '"'));
  assert.ok(page.includes('http-equiv="refresh" content="0;url=' + target));
  assert.ok(!page.includes('gtag'));
  assert.ok(page.includes('content="4wKKUukii7RAtcVjzkOVLx2ZSWK0a1Y34Rjy1J2HJ_I"'), 'keep ownership verification on the old host');
  for (const [html, pathname, expected] of [
    [page, '/prompt-gallery/prompts/example/', target + '?source=chat#prompt=example'],
    [redirectPage('https://example.pages.dev/'), '/prompt-gallery/', 'https://example.pages.dev/?source=chat#prompt=example'],
    [redirectPage('https://example.pages.dev/', true), '/prompt-gallery/prompts/future/', 'https://example.pages.dev/prompts/future/?source=chat#prompt=example'],
  ]) {
    let destination;
    const location = { pathname, search: '?source=chat', hash: '#prompt=example', replace(value) { destination = value; } };
    runInNewContext(/<script>([\s\S]*?)<\/script>/.exec(html)[1], { URL, location });
    assert.equal(destination, expected);
  }
  assert.throws(() => redirectPage('javascript:alert(1)'));
  assert.throws(() => redirectPage('https://example.com/?injected=yes'));
});

test('legacy sitemap lists only old addresses so Google rechecks them', () => {
  const xml = legacySitemap([{ id: 'one' }, { id: 'two' }]);
  assert.deepEqual([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]), [LEGACY_ROOT, LEGACY_ROOT + 'prompts/one/', LEGACY_ROOT + 'prompts/two/']);
});

test('every catalog prompt gets a redirect page to its production address', async () => {
  await buildRedirects();
  const output = resolve(projectRoot, 'legacy-dist');
  for (const prompt of await readCatalog()) {
    const page = await readFile(resolve(output, 'prompts', prompt.id, 'index.html'), 'utf8');
    assert.ok(page.includes('rel="canonical" href="' + analyticsConfig.siteUrl + 'prompts/' + prompt.id + '/"'));
  }
  assert.ok((await readFile(resolve(output, 'sitemap.xml'), 'utf8')).includes('<loc>' + LEGACY_ROOT + '</loc>'));
});
