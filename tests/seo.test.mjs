import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { trainingVideos } from '../training.js';
import { SITE_ORIGIN, faqs } from '../site-content.mjs';
const read=relative=>readFile(new URL('../dist/'+relative,import.meta.url),'utf8');
const graphs=html=>[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].flatMap(match=>JSON.parse(match[1])['@graph']);
test('public homepage has canonical metadata, real photos and crawlable content without JavaScript',async()=>{
  const html=await read('index.html');
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.ok(html.includes(`rel="canonical" href="${SITE_ORIGIN}/"`));
  assert.ok(!html.includes('<!-- SEO_HEAD -->')&&!html.includes('<!-- FAQ_CONTENT -->')&&!html.includes('<!-- TRAINING_CARDS -->'));
  assert.equal((html.match(/<video\b/g)||[]).length,4);
  assert.equal((html.match(/<details class="faq-item"/g)||[]).length,faqs.length);
  assert.equal((html.match(/<img\b/g)||[]).length,6);
  assert.ok(!html.includes('assets.mixkit.co')&&!html.includes('gsap.min.js'));
  const data=graphs(html);assert.ok(data.some(item=>item['@type']==='Organization'));
  assert.equal(data.filter(item=>item['@type']==='Service').length,4);
  for(const item of data)assert.ok(!['AggregateRating','Review'].includes(item['@type']));
  for(const image of html.matchAll(/<img\b([^>]+)>/g)){
    assert.match(image[1],/\balt="[^"]+"/);assert.match(image[1],/\bwidth="\d+"/);assert.match(image[1],/\bheight="\d+"/);
  }
});
test('each video has an indexable watch page with matching source and structured data',async()=>{
  const canonicals=new Set();
  for(const video of trainingVideos){
    const html=await read('training/'+video.id+'.html');
    const url=`${SITE_ORIGIN}/training/${video.id}.html`;
    assert.ok(html.includes(`rel="canonical" href="${url}"`));canonicals.add(url);
    const data=graphs(html),schema=data.find(item=>item['@type']==='VideoObject');
    assert.equal(schema.name,video.title);assert.equal(schema.duration,video.isoDuration);
    assert.equal(schema.contentUrl,`${SITE_ORIGIN}/media/training/${video.file}`);
    assert.ok(html.includes(`src="/media/training/${video.file}"`));
    assert.ok(html.includes('<h1>'+video.title+'</h1>'));
    assert.ok(!html.includes('noindex'));
    assert.equal((html.match(/<video\b/g)||[]).length,1);
  }
  assert.equal(canonicals.size,4);
});
test('sitemap and robots cover public pages; dashboards stay out of the search index',async()=>{
  const sitemap=await read('sitemap.xml'),robots=await read('robots.txt');
  assert.equal((sitemap.match(/<loc>/g)||[]).length,6);
  assert.ok(!/admin|student|demo=/.test(sitemap));
  assert.ok(robots.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`));
  assert.ok(!robots.includes('Disallow: /'));
  for(const page of ['admin.html','student.html'])assert.ok((await read(page)).includes('content="noindex,nofollow"'));
  assert.ok((await read('404.html')).includes('content="noindex,follow"'));
});
