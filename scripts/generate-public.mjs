import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { trainingVideos, trainingCards } from '../training.js';
import { SITE_ORIGIN, SITE_TITLE, SITE_DESCRIPTION, seoHead, services, videoSchema, faqMarkup } from '../site-content.mjs';
import { escapeHTML as e } from '../domain.mjs';

const fontLink = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">';
const header = `<a class="skip-link" href="#main">Skip to main content</a><header class="navbar"><div class="navbar-inner"><a class="logo" href="/" aria-label="AKALUs Global home"><span class="logo-text">AKAL<span class="logo-accent">Us</span></span><span class="logo-sub">Global</span><span class="logo-tagline">Your Timeless Partners</span></a><nav class="page-nav" aria-label="Main navigation"><a href="/">Home</a><a href="/training.html">Training</a><a href="/#contact">Contact</a><a href="/admin.html?demo=1">Workspace demo</a></nav></div></header>`;
const footer = `<footer class="public-footer"><div class="container"><span>AKALUs Global · Your Timeless Partners</span><span><a href="mailto:hello@akalusglobal.in">hello@akalusglobal.in</a> · Jaipur, Rajasthan</span></div></footer>`;
function page(head, body) {
  return `<!DOCTYPE html><html lang="en-IN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${head}${fontLink}<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/seo-site.css"><link rel="icon" href="/favicon.svg" type="image/svg+xml"></head><body class="public-page">${header}<main id="main" class="public-main">${body}</main>${footer}<script type="module" src="/public-training.js"></script></body></html>`;
}
const context = {
  communication: ['Practice speaking with confidence', 'The clip brings together short scenes of learners presenting, speaking with others and taking part in guided activities. It offers a look at the practice behind communication development.', 'Explore personalized communication support', '/#individuals'],
  workshop: ['A classroom built around participation', 'The scenes include written activities, paired conversations and presentations. The focus is on giving learners opportunities to participate, reflect and practise with others.', 'See our personalized development journey', '/#journey'],
  interview: ['Rehearse the conversation before the opportunity', 'This highlight shows interview-style practice, peer participation and conversations with facilitators. Use it to see the session format; individual preparation is planned around a learner’s needs.', 'Explore interview and application support', '/#journey'],
  group: ['Learn through interaction', 'This short clip shows learners participating in a group session. It is a glimpse of the learning environment and group interaction, rather than a complete recorded course.', 'Discuss learning needs for your group', '/#contact']
};
export async function generatePublic(root,out) {
  let homepage=await readFile(path.join(root,'index.html'),'utf8');
  const serviceGraph=services.map(s=>({ '@type': 'Service', '@id': `${SITE_ORIGIN}/#service-${s.id}`, name: s.name, serviceType: s.type, description: s.description, url: `${SITE_ORIGIN}/#${s.anchor}`, provider: { '@id': `${SITE_ORIGIN}/#organization` } }));
  homepage=homepage.replace('<!-- SEO_HEAD -->',seoHead('/',SITE_TITLE,SITE_DESCRIPTION,serviceGraph))
    .replace('<!-- TRAINING_CARDS -->',trainingCards({publicLinks:true}))
    .replace('<!-- FAQ_CONTENT -->',faqMarkup());
  await writeFile(path.join(out,'index.html'),homepage);

  const trainingTitle='Communication & Interview Practice Videos | AKALUs Global';
  const trainingDescription='Watch real AKALUs Global session highlights: communication practice, classroom workshops, mock interviews and group learning.';
  const listSchema={ '@type': 'ItemList', itemListElement: trainingVideos.map((v,i)=>({ '@type': 'ListItem', position:i+1, name:v.title, url:`${SITE_ORIGIN}/training/${v.id}.html` })) };
  await writeFile(path.join(out,'training.html'),page(seoHead('/training.html',trainingTitle,trainingDescription,[listSchema]),`<div class="container"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Training library</span></nav><span class="page-eyebrow">REAL SESSIONS. REAL PARTICIPATION.</span><h1>Communication, classroom and interview practice.</h1><p class="page-intro">See what learning looks like at AKALUs Global. These short highlights show presentations, practical activities, mock interview conversations and group participation.</p><div class="public-training-grid">${trainingCards({publicLinks:true,headingLevel:2})}</div><p class="public-notice">These videos are session highlights, not complete courses. To discuss a personalized plan or a session for your institution or team, <a href="/#contact">get in touch with us</a>.</p></div>`));

  await mkdir(path.join(out,'training'),{recursive:true});
  for(const v of trainingVideos){
    const [heading,summary,cta,ctaURL]=context[v.id];
    const title=`${v.title} — Session Highlights | AKALUs Global`;
    const graph=[videoSchema(v),{ '@type':'BreadcrumbList',itemListElement:[{ '@type':'ListItem',position:1,name:'Home',item:`${SITE_ORIGIN}/` },{ '@type':'ListItem',position:2,name:'Training library',item:`${SITE_ORIGIN}/training.html` },{ '@type':'ListItem',position:3,name:v.title,item:`${SITE_ORIGIN}/training/${v.id}.html` }] }];
    const body=`<div class="container"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/training.html">Training library</a><span aria-hidden="true">/</span><span aria-current="page">${e(v.title)}</span></nav><span class="page-eyebrow">${e(v.category)} · SESSION HIGHLIGHTS</span><h1>${e(v.title)}</h1><p class="page-intro">${e(v.description)}</p><div class="watch-layout"><article class="watch-main"><video controls playsinline preload="none" width="368" height="368" poster="/media/training/${v.poster}" aria-label="${e(v.title)}"><source src="/media/training/${v.file}" type="video/mp4">Your browser does not support this video. <a href="/media/training/${v.file}">Open the MP4</a>.</video><div class="watch-copy"><div class="watch-meta"><span>${v.duration} duration</span><span>AKALUs Global</span><span>Session highlight</span></div><h2>${heading}</h2><p>${summary}</p><p>These are real moments from our learning sessions. They show the practice environment rather than a promise of a particular career outcome.</p><a class="btn btn-primary" href="${ctaURL}">${cta} →</a></div></article><aside class="watch-sidebar"><h2>More from our sessions</h2>${trainingVideos.filter(other=>other.id!==v.id).map(other=>`<a href="/training/${other.id}.html">${e(other.title)}<small>${e(other.category)} · ${other.duration}</small></a>`).join('')}<a class="contact-link" href="/training.html">View all training videos →</a></aside></div></div>`;
    await writeFile(path.join(out,'training',v.id+'.html'),page(seoHead(`/training/${v.id}.html`,title,v.description,graph),body));
  }
  await writeFile(path.join(out,'404.html'),page('<title>Page not found | AKALUs Global</title><meta name="robots" content="noindex,follow">',`<div class="container error-page"><span class="page-eyebrow">404 · LET’S FIND YOUR WAY</span><h1>This page has moved or isn’t here.</h1><p>You can return to the main website, browse our session highlights, or contact the team about your development goals.</p><a class="btn btn-primary" href="/">Back to AKALUs Global →</a></div>`));
  const urls=['/','/training.html',...trainingVideos.map(v=>`/training/${v.id}.html`)];
  await writeFile(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(url=>`  <url><loc>${SITE_ORIGIN}${url}</loc></url>`).join('\n')+'\n</urlset>\n');
  await writeFile(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`);
  console.log('Generated crawlable homepage, training library, 4 video pages, 404, robots.txt and sitemap.xml.');
}
