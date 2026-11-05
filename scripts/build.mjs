import { cp, mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { readCatalog, projectRoot } from './validate.mjs';
import { createSocialImage, socialTags, escapeHtml } from './social.mjs';
import { analyticsConfig } from '../src/analytics-config.mjs';
import { promptUrl } from '../src/sharing.mjs';
import { searchGuides, searchMetadata } from '../src/search-guides.mjs';
import { renderStaticCatalog, renderStaticPrompt, renderSitemap, renderHomeStructuredData, renderPromptStructuredData } from './static-content.mjs';

const prompts = await readCatalog();
for (const id of Object.keys(searchGuides)) if (!prompts.some(prompt => prompt.id === id)) throw new Error(`Unknown search guide: ${id}`);
const output = resolve(projectRoot, 'dist');
if (relative(projectRoot, output) !== 'dist') throw new Error('Build output must be the project dist directory.');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'src', 'data', 'assets', 'licenses']) {
  await cp(resolve(projectRoot, file), resolve(output, file), { recursive: true });
}
await writeFile(resolve(output, '.nojekyll'), '');
// Keep diagnostics off gallery pages and all other static assets.
await writeFile(resolve(output, '_routes.json'), JSON.stringify({ version: 1, include: ['/sitemap.xml'], exclude: [] }, null, 2) + '\n');
const siteUrl = new URL(process.env.SITE_URL || analyticsConfig.siteUrl);
if (siteUrl.protocol !== 'https:' || siteUrl.search || siteUrl.hash) throw new Error('SITE_URL must be an HTTPS site root without a query or hash.');
if (!siteUrl.pathname.endsWith('/')) siteUrl.pathname += '/';
const isPreview = process.env.CF_PAGES === '1' && process.env.CF_PAGES_BRANCH !== 'main';
const template = (await readFile(resolve(projectRoot, 'index.html'), 'utf8'))
  .replace('</head>', isPreview ? '  <meta name="robots" content="noindex, nofollow">\n</head>' : '</head>');
await writeFile(resolve(output, 'src/analytics-config.mjs'), 'export const analyticsConfig = ' + JSON.stringify({ ...analyticsConfig, siteUrl: siteUrl.href, ...(isPreview ? { measurementId: '' } : {}) }, null, 2) + ';\n');
await writeFile(resolve(output, 'robots.txt'), isPreview ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\nSitemap: ' + new URL('sitemap.xml', siteUrl).href + '\n');
await writeFile(resolve(output, '_headers'), '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n' + (isPreview ? '  X-Robots-Tag: noindex, nofollow\n' : '')
  // Social previews are content-hashed; gallery images keep their paths when revised, so cache them for a day only.
  + '/assets/social/*\n  Cache-Control: public, max-age=31536000, immutable\n/assets/images/*\n  Cache-Control: public, max-age=86400\n');
await writeFile(resolve(output, '404.html'), '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>페이지를 찾을 수 없습니다 — Prompt Gallery</title></head><body><h1>페이지를 찾을 수 없습니다</h1><p><a href="' + escapeHtml(siteUrl.href) + '">전체 프롬프트 둘러보기</a></p></body></html>');
const images = new Map();
for (const prompt of prompts) images.set(prompt.id, await createSocialImage(prompt, projectRoot, output));
const featured = [...prompts].sort((a, b) => a.order - b.order)[0];
const tagsFor = (prompt, url, title, description) => socialTags({
  title, description, url, image: new URL(images.get(prompt.id), siteUrl).href,
  imageAlt: `${prompt.title} — AI 생성 결과 예시`,
});
const homeTitle = /<title>(.*?)<\/title>/.exec(template)[1];
const homeDescription = /<meta name="description" content="(.*?)">/.exec(template)[1];
await writeFile(resolve(output, 'index.html'), template.replace('<!-- static-content -->', () => renderStaticCatalog(prompts)).replace('</head>', `  ${tagsFor(featured, siteUrl.href, homeTitle, homeDescription)}\n  ${renderHomeStructuredData(siteUrl, homeDescription)}\n</head>`));
for (const prompt of prompts) {
  const { title, description } = searchMetadata(prompt);
  const page = template
    .replace('<!-- static-content -->', () => renderStaticPrompt(prompt, prompts))
    .replace(/(<h1 id="page-title">)[\s\S]*?(<\/h1>)/, (_, start, end) => start + escapeHtml(prompt.title) + end)
    .replace(/(href|src)="\.\//g, '$1="../../')
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${escapeHtml(description)}">`)
    .replace('</head>', `  ${tagsFor(prompt, promptUrl(prompt.id, siteUrl), title, description)}\n  ${renderPromptStructuredData(prompt, siteUrl, { title, description })}\n</head>`);
  const directory = resolve(output, 'prompts', prompt.id);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'index.html'), page);
}
await writeFile(resolve(output, 'sitemap.xml'), renderSitemap(prompts, siteUrl));
console.log(`Built ${prompts.length} prompts with individual sharing pages and JPEG previews into dist/.`);
