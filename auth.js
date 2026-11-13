import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';
let clientPromise;
export function getFirebase() {
  if (!isFirebaseConfigured) return Promise.reject(new Error('Live sign-in is not configured yet. Explore the demo workspace below.'));
  return clientPromise ||= Promise.all([
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')
  ]).then(([appSDK, authSDK, dbSDK]) => {
    const app = appSDK.initializeApp(firebaseConfig);
    return { auth: authSDK.getAuth(app), db: dbSDK.getFirestore(app), authSDK, dbSDK };
  });
}
export async function currentSession() {
  const client = await getFirebase();
  await client.auth.authStateReady();
  const user = client.auth.currentUser;
  if (!user) return { ...client, user: null, admin: false };
  const token = await user.getIdTokenResult();
  return { ...client, user, admin: token.claims.admin === true };
}
export function authMessage(error) {
  const messages = {
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/email-already-in-use': 'This email already has an account. Please sign in.',
    'auth/weak-password': 'Use a password with at least 8 characters.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Unable to connect. Check your internet connection.',
    'auth/unauthorized-domain': 'This website domain must be enabled in Firebase Authentication.'
  };
  return messages[error.code] || (isFirebaseConfigured ? 'Unable to sign in. Please try again or contact your coordinator.' : error.message);
}
