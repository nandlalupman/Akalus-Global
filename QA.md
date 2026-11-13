# Verification record

Checked on 13 November 2026.

## Automated

- Five Node test groups passed: valid demo relationships, due/overdue follow-ups and closed statuses, application validation, student validation, HTML escaping and CSV formula protection.
- JavaScript syntax checks passed for dashboard, data service, account UI and original website script.
- Static page links and all four MP4/poster pairs verified; production static build completed.
- Git whitespace check passed.

## Browser demo checks

- Created a test student with course, target role, services and support plan.
- Added a linked company application with role requirements, package and follow-up.
- Changed Applied to Interview scheduled, set an India-time interview date/time, and confirmed persistence after reload and updated overview counts.
- Recorded a support activity and completed a training video; both appeared in the student's support history.
- Combined search/status filters and exported a CSV containing exactly the selected application; verified downloaded columns and values.
- Student demo showed only the selected demo student's journey and applications, with editing controls absent and training completion disabled.
- Checked at a 390 × 844 viewport. Fixed an absolutely positioned hidden table header causing page overflow; verified the page fits the viewport and navigation opens/closes.
- Public training video played through native controls (`readyState=4`, current time advancing, no media error).
- Account modal clearly reports unconfigured live authentication and offers both demo views. No mock successful authentication remains.
- No dashboard or public-page console errors/warnings were observed during these checks.

Test records were kept only in browser demo storage, not seeded into the production database or source catalog.

## Not verified

Firebase project credentials and server-side coordinator claims were not supplied. Real sign-in/registration, deployed Firestore rule enforcement, concurrent live editing and cross-device synchronization require the project's live configuration and two-account access checks described in README.md. Browser demo checks do not verify server authorization. Spoken-word transcription and captions were not created for the supplied video highlights.
