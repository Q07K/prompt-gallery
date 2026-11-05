import { mkdir, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readCatalog, projectRoot } from './validate.mjs';
import { analyticsConfig } from '../src/analytics-config.mjs';
export const LEGACY_ROOT = 'https://q07k.github.io/prompt-gallery/';
const escapeHtml =value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function redirectPage(targetUrl, legacyFallback = false) {
  const target = new URL(targetUrl);
  if (target.protocol !== 'https:' || target.username || target.password || target.search || target.hash) throw new Error('Redirect destination must be a clean HTTPS URL.');
  const destination = escapeHtml(target.href);
  return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="google-site-verification" content="4wKKUukii7RAtcVjzkOVLx2ZSWK0a1Y34Rjy1J2HJ_I"><title>Prompt Gallery 주소 변경</title><link rel="canonical" href="' + destination + '"><meta http-equiv="refresh" content="0;url=' + destination + '"></head><body><p>Prompt Gallery의 주소가 바뀌었습니다. <a href="' + destination + '">새 갤러리로 이동</a></p><script>const target = new URL(' + JSON.stringify(target.href) + ');' + (legacyFallback ? 'if (location.pathname.startsWith("/prompt-gallery/")) target.pathname += location.pathname.slice("/prompt-gallery/".length);' : '') + 'target.search = location.search; target.hash = location.hash; location.replace(target.href);</script></body></html>';
}

export async function buildRedirects() {
  const output = resolve(projectRoot, 'legacy-dist');
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await writeFile(resolve(output, '.nojekyll'), '');
  await writeFile(resolve(output, 'index.html'), redirectPage(analyticsConfig.siteUrl));
  await writeFile(resolve(output, '404.html'), redirectPage(analyticsConfig.siteUrl, true));
  const prompts = await readCatalog();
  for (const prompt of prompts) {
    const directory = resolve(output, 'prompts', prompt.id);
    await mkdir(directory, { recursive: true });
    await writeFile(resolve(directory, 'index.html'), redirectPage(new URL('prompts/' + prompt.id + '/', analyticsConfig.siteUrl)));
  }
  // Lists the old addresses so Google recrawls them and sees the moves sooner; submit it in the old Search Console property.
  await writeFile(resolve(output, 'sitemap.xml'), legacySitemap(prompts));
  console.log('Legacy redirects generated without images or analytics.');
}

export function legacySitemap(prompts, legacyRoot = LEGACY_ROOT) {
  const urls = [legacyRoot, ...prompts.map(prompt => new URL('prompts/' + encodeURIComponent(prompt.id) + '/', legacyRoot).href)];
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(url => '  <url><loc>' + escapeHtml(url) + '</loc></url>').join('\n') + '\n</urlset>\n';
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await buildRedirects();
