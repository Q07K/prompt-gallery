import test from 'node:test';
import { searchGuides, searchMetadata, homeSearch } from '../src/search-guides.mjs';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { projectRoot, readCatalog } from '../scripts/validate.mjs';
import { promptUrl, readPromptLocation } from '../src/sharing.mjs';
import { socialTags } from '../scripts/social.mjs';

test('sharing routes support Pages subpaths, legacy hashes, history navigation and index.html', () => {
  const root = 'https://example.com/prompt-gallery/';
  assert.equal(promptUrl('handcrafted-diorama', root), root + 'prompts/handcrafted-diorama/');
  assert.equal(readPromptLocation(root + 'prompts/handcrafted-diorama/', root), 'handcrafted-diorama');
  assert.equal(readPromptLocation(root + 'prompts/animal-friend/index.html', root), 'animal-friend');
  assert.equal(readPromptLocation(root + '#prompt=cozy-stickers', root), 'cozy-stickers');
  assert.equal(readPromptLocation(root + 'prompts/animal-friend/#prompt=pixel-food', root), 'pixel-food');
  for (const href of [root, root + '#prompt=%E0%A4', root + '#gallery', 'https://example.com/other/prompts/test/']) {
    assert.equal(readPromptLocation(href, root), null);
  }
});

test('untrusted catalog text cannot inject markup into sharing metadata', () => {
  const tags = socialTags({ title: '\"><script>alert(1)</script>', description: 'A & B', url: 'https://example.com/', image: 'https://example.com/image.jpg', imageAlt: '"example"' });
  assert.ok(!tags.includes('<script>'));
  assert.ok(tags.includes('&lt;script&gt;'));
  assert.ok(tags.includes('A &amp; B'));
});

test('built pages expose each actual result to crawlers without running JavaScript', async () => {
  const siteRoot = 'https://example.com/gallery/';
  await promisify(execFile)(process.execPath, ['scripts/build.mjs'], { cwd: projectRoot, env: { ...process.env, SITE_URL: siteRoot, CF_PAGES_BRANCH: 'main' } });
  for (const prompt of await readCatalog()) {
    const page = await readFile(resolve(projectRoot, 'dist/prompts', prompt.id, 'index.html'), 'utf8');
    assert.ok(page.includes(`property="og:url" content="${promptUrl(prompt.id, siteRoot)}"`));
    assert.ok(page.includes(`property="og:title" content="${searchMetadata(prompt).title}"`));
    const guide = searchGuides[prompt.id];
    if (guide) {
      assert.ok(page.includes(guide.description));
      assert.ok(page.includes(guide.intro));
      for (const section of guide.sections) assert.ok(page.includes(section.body));
    } else assert.ok(!page.includes('<section class="prompt-guide"'));
    const { title, description } = searchMetadata(prompt);
    assert.ok(title.length <= 70, `${prompt.id} search title is too long for results pages`);
    assert.ok(description.length <= 200, `${prompt.id} search description is too long for results pages`);
    const structured = JSON.parse(/<script type="application\/ld\+json">(.*?)<\/script>/.exec(page)[1]);
    assert.equal(structured['@graph'][0].itemListElement.at(-1).item, promptUrl(prompt.id, siteRoot));
    assert.equal((page.match(/property="og:image" /g) || []).length, 1);
    assert.ok(page.includes(`<h1 id="page-title">${prompt.title}</h1>`));
    assert.ok(page.includes('id="static-content"'));
    assert.ok(page.includes('class="static-prompt"'));
    assert.ok(page.includes('src="../../app.js"'));
    assert.ok(page.includes('href="../../styles.css"'));
    const imageUrl = /property="og:image" content="([^"]+)"/.exec(page)[1];
    assert.ok(imageUrl.startsWith(siteRoot + 'assets/social/' + prompt.id + '-'));
    const image = await readFile(resolve(projectRoot, 'dist', imageUrl.slice(siteRoot.length)));
    const metadata = await sharp(image).metadata();
    assert.equal(metadata.format, 'jpeg');
    assert.equal(metadata.width, 1200);
    assert.equal(metadata.height, 600);
    assert.ok(image.length < 500_000);
  }
  const home = await readFile(resolve(projectRoot, 'dist/index.html'), 'utf8');
  const source = await readFile(resolve(projectRoot, 'index.html'), 'utf8');
  assert.ok(home.includes(`<title>${homeSearch.title}</title>`));
  const verification = source.match(/<meta name="google-site-verification"[^>]+>/)?.[0];
  assert.ok(verification, 'Search Console verification tag must be configured');
  assert.ok(home.includes(verification), 'build must preserve the verification tag');
  assert.equal((home.match(/property="og:image" /g) || []).length, 1);
  assert.ok(home.includes(`property="og:url" content="${siteRoot}"`));
  const catalog = await readCatalog();
  for (const prompt of catalog) assert.ok(home.includes(`href="./prompts/${prompt.id}/"`));
  const config = await readFile(resolve(projectRoot, 'dist/src/analytics-config.mjs'), 'utf8');
  assert.ok(config.includes(siteRoot), 'analytics and canonical must use the same build root');
  const robots = await readFile(resolve(projectRoot, 'dist/robots.txt'), 'utf8');
  assert.ok(robots.includes('Sitemap: ' + siteRoot + 'sitemap.xml'));
  const notFound = await readFile(resolve(projectRoot, 'dist/404.html'), 'utf8');
  assert.ok(notFound.includes('content="noindex"'));
  const routes = JSON.parse(await readFile(resolve(projectRoot, 'dist/_routes.json'), 'utf8'));
  assert.deepEqual(routes, { version: 1, include: ['/sitemap.xml'], exclude: [] }, 'only sitemap requests may invoke the diagnostic Function');
  const sitemap = await readFile(resolve(projectRoot, 'dist/sitemap.xml'), 'utf8');
  assert.equal((sitemap.match(/<loc>/g) || []).length, catalog.length + 1);
  for (const prompt of catalog) assert.ok(sitemap.includes(`<loc>${promptUrl(prompt.id, siteRoot)}</loc>`));
  for (const prompt of catalog) assert.ok(sitemap.includes(`<image:loc>${siteRoot}${prompt.image}</image:loc>`));
  assert.ok(home.includes('"@type":"WebSite"'));
  const headers = await readFile(resolve(projectRoot, 'dist/_headers'), 'utf8');
  assert.ok(headers.includes('/assets/social/*\n  Cache-Control: public, max-age=31536000, immutable'));
});

test('Cloudflare branch previews cannot collect production analytics or be indexed', async () => {
  await promisify(execFile)(process.execPath, ['scripts/build.mjs'], { cwd: projectRoot, env: { ...process.env, SITE_URL: 'https://example.pages.dev/', CF_PAGES: '1', CF_PAGES_BRANCH: 'test-preview' } });
  const page = await readFile(resolve(projectRoot, 'dist/index.html'), 'utf8');
  assert.ok(page.includes('<meta name="robots" content="noindex, nofollow">'));
  assert.ok(page.includes('rel="canonical" href="https://example.pages.dev/"'));
  const config = await readFile(resolve(projectRoot, 'dist/src/analytics-config.mjs'), 'utf8');
  assert.ok(config.includes('"measurementId": ""'));
  assert.ok((await readFile(resolve(projectRoot, 'dist/robots.txt'), 'utf8')).includes('Disallow: /'));
  assert.ok((await readFile(resolve(projectRoot, 'dist/_headers'), 'utf8')).includes('X-Robots-Tag: noindex, nofollow'));
});
