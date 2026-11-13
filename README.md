# AKALUs Global — Career workspace

The existing vanilla HTML/CSS/JavaScript website now includes a coordinator workspace (`admin.html`), a student workspace (`student.html`), and four supplied training clips on the public website and in the dashboard.

## Run and build

Use Node.js 20 or newer.

```sh
npm install
npm run build
npm run dev
npm test
```

Open `http://localhost:3000/admin.html?demo=1` for the coordinator demo or `http://localhost:3000/student.html?demo=1` for the student demo. Demo records are illustrative, stored only in this browser, and shared between these demo views. Use the settings panel to restore samples, start an empty demo, or export a backup. Do not enter real student records in demo mode. A student demo is a UI preview, not an authentication boundary.

The production build copies an explicit list of public application files to `dist/`; it excludes rules, tests, service-account material, Git metadata and dependencies. Existing Vercel hosting can use build command `npm run build`, output directory `dist`, framework preset Other. Sites hosting uses `.openai/hosting.json`. This repository does not contain a real Firebase project configuration.

## Live Firebase setup (required for real shared data)

1. Create or select your Firebase project. Enable **Authentication → Email/Password** and create a **Firestore** database. Use locked/production mode.
2. Copy the public web-app configuration into `firebase-config.js`. Never put a service-account key in frontend code, this repository, or the public build.
3. Add each deployed hostname under **Authentication → Settings → Authorized domains**. Add localhost for local live-mode testing if needed.
4. Install Firebase CLI on your trusted development machine and deploy the included access rules to the correct project:

   ```sh
   firebase deploy --only firestore:rules --project YOUR_PROJECT_ID
   ```

5. Register the coordinator through the website or Firebase Authentication. Grant the account the **server-issued** `admin: true` custom claim. The included trusted-machine helper preserves existing custom claims:

   ```sh
   npm install --no-save firebase-admin
   # Set GOOGLE_APPLICATION_CREDENTIALS to a service-account JSON file OUTSIDE this repo.
   node scripts/set-admin.mjs COORDINATOR_FIREBASE_UID
   ```

   Sign out and back in to refresh the claim. Signing up never grants coordinator access. The helper is not included in the public build.
6. Students register through the website. Copy their account UID from Firebase Authentication or their student workspace settings. The coordinator creates their student profile with that UID **before adding applications**.
7. Rebuild and deploy. Verify with two student accounts that each can read only their own profile/applications, that student writes fail, and that anonymous requests fail. These production checks require your actual Firebase project; they cannot be verified with the placeholder configuration.

## Features and data model

- Student profiles: contact, qualification, batch/institution, target role, coordinator, support services, notes, training progress and dated activity log.
- Applications: linked student, company, requested job role, requirements, package (including ranges/Not disclosed), location, applied date, follow-up, interview date/time in India, job URL, notes and status history.
- Statuses: Applied → Shortlisted → Interview scheduled → Offer received → Joined, plus Rejected and Withdrawn. Each status remains editable to support real hiring workflows.
- Overview counts and follow-up reminders use current data. Search, company/status filters and pagination apply to application exports. CSV output neutralizes spreadsheet formulas. JSON exports include visible student and application history.
- Live updates use Firestore listeners. Writes use transactions and reject stale edits; reopen a record if another coordinator updated it. No student data is seeded into live mode.
- `students/{id}` stores `ownerUid`; applications duplicate it for efficient queries. Rules also check parent student ownership. Students have read-only access; only server-claimed coordinators can write. All other paths and deletion are denied. Rules must be deployed before storing personal data.
- Ownership relinking after applications exist is deliberately blocked in the UI. Perform any account migration atomically through a trusted Admin SDK process and update both student and application ownership.
- Activity history keeps the most recent 100 updates per record; it is an operational timeline, not an immutable audit log. Export backups as required.

## Training assets

`media/training/` includes the user's four original MP4 clips and extracted poster frames. Videos load on demand (`preload="none"`), keep their original aspect ratio, and use native playback controls. Descriptions identify visible practice activities; they are session highlights rather than structured lessons. Completion is recorded by coordinators and visible to students. Source mapping and technical details are in `MEDIA-REVIEW.md`.

## Validation limits

`npm test` verifies domain validation, relationship integrity, follow-up rules, HTML escaping and CSV formula protection. Browser QA covers demo interactions. Real sign-in, custom claims, Firestore rules enforcement and cross-device synchronization require the configured Firebase project and deployment. No claim is made that the demo is a production student database.
