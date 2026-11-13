import { escapeHTML as e } from './domain.mjs';
export const SITE_ORIGIN = 'https://akalus-global.vercel.app';
export const SITE_TITLE = 'Career Guidance & Interview Preparation | AKALUs Global';
export const SITE_DESCRIPTION = 'Personalized career guidance, communication coaching, resume support and mock interviews in Jaipur. Explore AKALUs Global’s support for learners and teams.';
export const SOCIAL_IMAGE = `${SITE_ORIGIN}/images/social/akalus-global.jpg`;
export const VIDEO_PUBLISHED_AT = '2026-11-13T17:59:21Z';
export const faqs = [
  ['What does AKALUs Global do?', 'AKALUs Global is a development and consulting organization based in Jaipur, Rajasthan. It supports personal and professional growth through assessment, personalized guidance, communication practice, resume and LinkedIn support, and interview preparation.'],
  ['Who can work with AKALUs Global?', 'The services are designed for students, graduates and working professionals, as well as academic institutions and organizations seeking learning and workforce development support.'],
  ['How is the development journey personalized?', 'The journey starts with understanding your strengths, improvement areas and goals. This informs a development plan, one-on-one sessions, feedback, progress review, professional profile support and preparation for opportunities.'],
  ['Do you help with resumes, job applications and interviews?', 'Yes. Career support can include resume development, LinkedIn profile guidance, job application assistance, mock interviews and feedback. Employers make hiring decisions; application support does not guarantee a job offer.'],
  ['What is available in the career workspace?', 'The workspace brings together student support plans, company applications, job roles and requirements, packages, statuses, follow-ups and training progress. The public demo uses sample records stored in your browser. Account-based shared tracking requires live setup; please keep personal student information out of the demo.'],
  ['How can an individual, institution or organization get started?', 'Email hello@akalusglobal.in with your goals. Individuals can share their qualification and career interests; institutions and organizations can describe the group and development needs they want to discuss.']
];
export const services = [
  { id: 'career-guidance', name: 'Personalized career guidance', type: 'Career development consulting', description: 'Assessment-led guidance, individual development planning and ongoing feedback.', anchor: 'individuals' },
  { id: 'communication-coaching', name: 'Communication and interview preparation', type: 'Communication coaching and mock interviews', description: 'Presentation practice, confidence building, mock interviews and expert feedback.', anchor: 'training' },
  { id: 'resume-support', name: 'Resume, LinkedIn and application support', type: 'Career application support', description: 'Help with professional profiles, resumes, job applications and interview readiness.', anchor: 'journey' },
  { id: 'workforce-development', name: 'Learning and workforce development', type: 'Workforce development consulting', description: 'Assessment, learning interventions and development support for academic institutions and organizations.', anchor: 'organizations' }
];
export function baseSchema(path, title, description) {
  return [
    { '@type': 'Organization', '@id': `${SITE_ORIGIN}/#organization`, name: 'AKALUs Global', url: `${SITE_ORIGIN}/`, description: SITE_DESCRIPTION, email: 'hello@akalusglobal.in', logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/images/brand-mark.png`, width: 192, height: 192 }, address: { '@type': 'PostalAddress', addressLocality: 'Jaipur', addressRegion: 'Rajasthan', addressCountry: 'IN' } },
    { '@type': 'WebSite', '@id': `${SITE_ORIGIN}/#website`, url: `${SITE_ORIGIN}/`, name: 'AKALUs Global', publisher: { '@id': `${SITE_ORIGIN}/#organization` }, inLanguage: 'en-IN' },
    { '@type': 'WebPage', '@id': `${SITE_ORIGIN}${path}#webpage`, url: `${SITE_ORIGIN}${path}`, name: title, description, isPartOf: { '@id': `${SITE_ORIGIN}/#website` }, about: { '@id': `${SITE_ORIGIN}/#organization` }, inLanguage: 'en-IN', primaryImageOfPage: { '@type': 'ImageObject', url: SOCIAL_IMAGE } }
  ];
}
export function videoSchema(video) {
  return { '@type': 'VideoObject', '@id': `${SITE_ORIGIN}/training/${video.id}.html#video`, name: video.title, description: video.description, thumbnailUrl: [`${SITE_ORIGIN}/media/training/${video.poster}`], uploadDate: VIDEO_PUBLISHED_AT, duration: video.isoDuration, contentUrl: `${SITE_ORIGIN}/media/training/${video.file}`, creator: { '@id': `${SITE_ORIGIN}/#organization` }, mainEntityOfPage: { '@id': `${SITE_ORIGIN}/training/${video.id}.html#webpage` } };
}
export function seoHead(path, title, description, graph = []) {
  const url = `${SITE_ORIGIN}${path}`;
  const schema = JSON.stringify({ '@context': 'https://schema.org', '@graph': [...baseSchema(path,title,description), ...graph] }).replaceAll('<','\\u003c');
  return `<title>${e(title)}</title>
    <meta name="description" content="${e(description)}">
    <link rel="canonical" href="${url}">
    <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
    <meta name="theme-color" content="#0f1d3a">
    <meta property="og:type" content="website"><meta property="og:locale" content="en_IN">
    <meta property="og:site_name" content="AKALUs Global"><meta property="og:title" content="${e(title)}">
    <meta property="og:description" content="${e(description)}"><meta property="og:url" content="${url}">
    <meta property="og:image" content="${SOCIAL_IMAGE}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="AKALUs Global career guidance with real classroom and interview practice scenes">
    <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${e(title)}">
    <meta name="twitter:description" content="${e(description)}"><meta name="twitter:image" content="${SOCIAL_IMAGE}">
    <meta name="twitter:image:alt" content="AKALUs Global learning and interview practice sessions">
    <script type="application/ld+json">${schema}</script>`;
}
export function faqMarkup() {
  return `<div class="faq-list">${faqs.map(([q,a],i)=>`<details class="faq-item" ${i===0?'open':''}><summary>${e(q)}</summary><p>${e(a)}</p></details>`).join('')}</div>`;
}
