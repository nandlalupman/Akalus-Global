# AKALUs Global — current project context

Vanilla HTML/CSS/JavaScript static website. See README.md for the current architecture and setup.

- Public website: index.html, styles.css, script.js, auth-ui.js, public-training.js.
- Career dashboard: admin.html / student.html, dashboard.js, dashboard.css.
- Data: data.js (browser-local demo or live Firestore), domain.mjs (validation and shared logic).
- Identity: auth.js and public Firebase configuration in firebase-config.js. No production credentials are present.
- Access: server-issued admin custom claim; Firestore rules limit students to reading their own data.
- Training: four supplied videos and poster frames in media/training/, catalog in training.js.
- Build: npm run build emits only public files to dist/. npm test checks domain behavior.
- Deployment: existing Vercel static site can use dist/. A private Sites preview uses .openai/hosting.json.

Demo URLs explicitly include ?demo=1. Live mode never seeds sample data or treats mock login as authorization. Real Firebase authentication and synchronization require project setup described in README.md.
