import test from 'node:test';
import assert from 'node:assert/strict';
import { renderStaticCatalog, renderStaticPrompt, renderSitemap, renderHomeStructuredData, renderPromptStructuredData } from '../scripts/static-content.mjs';

test('static content safely renders catalog text as text, including prompt markup', () => {
  const prompt = { id: 'example', title: '<script>alert(1)</script>', category: '제품', inputLabel: '사진 1장', usage: '<img src=x onerror=alert(1)>', prompt: '</pre><script>alert(1)</script>', author: 'A & B', sourceUrl: 'https://example.com/', thumbnail: 'assets/example.webp', image: 'assets/example.webp', referenceImages: ['assets/input.webp'], width: 100, height: 200, order: 0 };
  for (const html of [renderStaticCatalog([prompt]), renderStaticPrompt(prompt, [prompt])]) {
    assert.ok(!html.includes('<script>'));
    assert.ok(!html.includes('<img src=x'));
    assert.ok(html.includes('&lt;script&gt;'));
  }
  assert.ok(renderStaticPrompt(prompt, [prompt]).includes('&lt;/pre&gt;'));
});

test('sitemap contains canonical HTTPS subpath URLs without fabricated dates', () => {
  const xml = renderSitemap([{ id: 'one', order: 0 }, { id: 'two', order: -1 }], 'https://example.com/gallery/');
  assert.deepEqual([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]), ['https://example.com/gallery/', 'https://example.com/gallery/prompts/two/', 'https://example.com/gallery/prompts/one/']);
  assert.ok(!xml.includes('<lastmod>'));
});

test('sitemap lists each prompt result image once, including example results, but not input photos', () => {
  const prompt = { id: 'one', order: 0, image: 'assets/images/one.webp', referenceImages: ['assets/images/one.reference.webp'], examples: [{ image: 'assets/images/one.webp' }, { image: 'assets/images/one.pet.webp' }] };
  const xml = renderSitemap([prompt], 'https://example.com/gallery/');
  assert.ok(xml.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'));
  assert.deepEqual([...xml.matchAll(/<image:loc>(.*?)<\/image:loc>/g)].map(match => match[1]), ['https://example.com/gallery/assets/images/one.webp', 'https://example.com/gallery/assets/images/one.pet.webp']);
});

test('structured data is valid JSON that cannot close its script element', () => {
  const prompt = { id: 'one', title: '</script><script>alert(1)</script>', image: 'assets/images/one.webp', width: 10, height: 20, tags: ['a', 'b'] };
  const html = renderPromptStructuredData(prompt, 'https://example.com/gallery/', { title: 't', description: 'd' });
  assert.equal((html.match(/<\/script>/g) || []).length, 1);
  const data = JSON.parse(/<script type="application\/ld\+json">(.*)<\/script>/.exec(html)[1]);
  const [breadcrumb, page] = data['@graph'];
  assert.deepEqual(breadcrumb.itemListElement.map(item => item.item), ['https://example.com/gallery/', 'https://example.com/gallery/prompts/one/']);
  assert.equal(page.primaryImageOfPage.contentUrl, 'https://example.com/gallery/assets/images/one.webp');
  const home = JSON.parse(/<script type="application\/ld\+json">(.*)<\/script>/.exec(renderHomeStructuredData('https://example.com/gallery/', 'd'))[1]);
  assert.equal(home['@type'], 'WebSite');
  assert.equal(home.url, 'https://example.com/gallery/');
});
