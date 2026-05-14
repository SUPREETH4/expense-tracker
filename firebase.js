/* =========================================================
   firebase.js — Firebase App Initialization
   ---------------------------------------------------------
   Import this file in any page that needs Firebase services.
   It exports `auth` (Authentication) and `db` (Firestore).

   HOW TO USE:
     1. Create a project at https://console.firebase.google.com
     2. Enable "Authentication → Google" sign-in provider
     3. Enable "Firestore Database" (start in test mode for dev)
     4. Copy your project's firebaseConfig object and paste it
        into the `firebaseConfig` variable below.
   ========================================================= */

// Firebase modular SDK — loaded via CDN in each HTML file.
// These imports work because we load the Firebase ESM (module) build.
import { initializeApp }       from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth }             from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore }        from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// ─────────────────────────────────────────────────────────
//  ⚠️  REPLACE THIS OBJECT with your own Firebase project
//      config from: Firebase Console → Project Settings →
//      "Your apps" → SDK setup and configuration → Config
// ─────────────────────────────────────────────────────────
const firebaseConfig = {
    apiKey: "AIzaSyBCht1TQbBs28n71p9737E6gY2WocFDFaE",
    authDomain: "expense-tracker-25a00.firebaseapp.com",
    projectId: "expense-tracker-25a00",
    storageBucket: "expense-tracker-25a00.firebasestorage.app",
    messagingSenderId: "331973607819",
    appId: "1:331973607819:web:6495f9bc0d9a7735e8ef8e",
    measurementId: "G-4CY2ZWBEX4"
};

// Initialize Firebase — safe to call once; subsequent calls
// with the same config return the existing instance.
const app = initializeApp(firebaseConfig);

// `auth` — Firebase Authentication service
export const auth = getAuth(app);

// `db`   — Cloud Firestore database service
export const db   = getFirestore(app);
