# Public website, imagery and search-readiness update

## Implemented

- Extracted six real photographs from the four supplied MP4 clips. Black padding was trimmed; no synthetic people or substitute stock photos were added. WebP photographs total roughly 72 KB. Source timestamps, dimensions and descriptions are recorded in `images/sessions/provenance.json`; extraction is reproducible with `scripts/extract-session-images.py`.
- Replaced the external autoplay hero video with an authentic session-photo layout. Replaced the three large stock gallery PNGs with real session frames, captions, descriptive alt text, explicit dimensions and lazy loading below the fold.
- Added a 1200 × 630 social-sharing image using the real frames and existing brand colors. Added a PNG version of the existing A favicon mark for organization metadata.
- Added a descriptive homepage title, meta description, canonical URL, Open Graph and Twitter metadata, and consistent organization identity at the current live Vercel origin. An `/index.html` redirect consolidates the homepage at `/`.
- Added concise explanatory content and six visible, keyboard-accessible FAQs covering services, audiences, the personalized process, application support, demo limitations and contact.
- Training cards and FAQs are now generated into static HTML during build. Public content and video links no longer rely on a client-side JavaScript render.
- Added `/training.html` and four dedicated `/training/<id>.html` watch pages with one primary video each, visible summaries, related videos, contact links, canonical URLs and matching `VideoObject` metadata.
- Added JSON-LD for Organization, WebSite, WebPage, Services, video pages and breadcrumbs. No unverified ratings, reviews, job offers, location coordinates, business hours or guaranteed rich-result claims were added.
- Generated `robots.txt` and a six-URL XML sitemap. Public pages are crawlable; the sitemap excludes dashboard/demo/account pages. Dashboards retain `noindex,nofollow` HTML metadata and now also receive an `X-Robots-Tag` response header. Robots.txt does not block the crawler from reading their noindex instruction.
- Added an accessible 404 recovery page, semantic main/navigation landmarks, a skip link, logical headings, labeled carousel controls, a keyboard-operable mobile menu and Escape support. Main content remains visible if JavaScript fails or is unavailable.
- Removed the external GSAP scripts and duplicate animation effects from the marketing page. Core functionality uses a small local script; motion preferences are respected. Below-fold images and all video files load on demand.
- Improved button contrast (white text on action orange is approximately 4.96:1), muted text colors and footer readability. Fixed the sign-in dialog heading color and local preview root routing. The contact website link now uses the actual deployed Vercel address.

## Verification

- `npm test`: eight test groups pass, covering dashboard data behavior and generated SEO output, schema/video consistency, canonical URLs, static content, image attributes, sitemap membership and dashboard noindex behavior.
- Static checker validates 193 local link/asset references across nine HTML documents, same-page and cross-page anchors, unique element IDs and all MP4/poster pairs.
- Browser checks at 1440 × 1000 and 390 × 844: homepage, mobile navigation, FAQs, training library and a dedicated watch page fit their viewports; navigation works and the video plays through native controls.
- Existing dashboard modules and their data model remain in the build. No production Firebase configuration was supplied or changed.

## Owner follow-up and limits

- Search Console ownership was not connected. Submit `https://akalus-global.vercel.app/sitemap.xml` and inspect the public URLs in the correct Search Console property once ownership is verified. No indexing request or search-performance result is claimed.
- Search indexing, rankings, AI citations and rich-result display depend on search engines; technical readiness does not guarantee inclusion. AI answer visibility uses the same helpful-content and crawlability foundations; no special AI ranking file or hidden keyword content was added.
- Existing learner testimonials, leadership claims and business statistics were retained from the supplied website. They were not independently authenticated and should be confirmed by the business owner before relying on them in campaigns. They are not represented as structured review ratings.
- The videos are short session highlights with their original audio and resolution. There is no verified transcript or caption track; none was fabricated. Photographs are used at compact sizes suitable for the supplied 368-pixel source material.
- Live student authentication/shared data still requires the Firebase setup in README.md. Demo records are illustrative and remain browser-local.
- If a custom domain becomes the primary site later, change `SITE_ORIGIN` in `site-content.mjs`, the Vercel domain configuration and redirects together, then rebuild and resubmit the sitemap.

## Primary references used

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google: organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Google: video structured data](https://developers.google.com/search/docs/appearance/structured-data/video)

Use `npm run build` before serving or deploying. Generated public pages and search files live in `dist/`; their shared content and metadata are maintained in `site-content.mjs`, `training.js` and `scripts/generate-public.mjs`.
