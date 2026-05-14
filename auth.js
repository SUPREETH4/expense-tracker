import { auth } from './firebase.js';
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

const LOGIN_URL   = 'login.html';
const TRACKER_URL = 'index.html';

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signUpWithEmail(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  if (displayName && displayName.trim()) {
    await updateProfile(cred.user, { displayName: displayName.trim() });
  }

  return cred.user;
}

export async function signInWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logOut() {
  await signOut(auth);
  window.location.href = LOGIN_URL;
}

export function onAuthReady(callback) {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe();
    callback(user);
  });
}

export function requireAuth(onReady) {
  onAuthReady((user) => {
    if (!user) window.location.replace(LOGIN_URL);
    else onReady(user);
  });
}

export function redirectIfAuthenticated() {
  onAuthReady((user) => {
    if (user) window.location.replace(TRACKER_URL);
  });
}

export function getAuthErrorMessage(err) {
  const code = (err && err.code) || '';

  switch (code) {
    case 'auth/invalid-email':
      return 'That email address looks invalid.';

    case 'auth/missing-password':
      return 'Please enter your password.';

    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';

    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in.';

    case 'auth/user-not-found':
      return 'No account found with that email. Create one instead?';

    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';

    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';

    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';

    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return '';

    case 'auth/popup-blocked':
      return 'Popup was blocked by the browser. Allow popups and retry.';

    default:
      return 'Something went wrong. Please try again.';
  }
}
