// Run only on a trusted administrator's computer, never in the browser.
// GOOGLE_APPLICATION_CREDENTIALS must reference a service-account file OUTSIDE the repository.
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
const uid=process.argv[2];
if(!uid)throw new Error('Usage: node scripts/set-admin.mjs <Firebase-user-UID>');
initializeApp({credential:applicationDefault()});
const auth=getAuth();const user=await auth.getUser(uid);
await auth.setCustomUserClaims(uid,{...user.customClaims,admin:true});
console.log('Coordinator role granted. Sign out and sign in again to refresh access.');
