
import { initializeApp }       from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth }             from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore }        from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyBCht1TQbBs28n71p9737E6gY2WocFDFaE",
    authDomain: "expense-tracker-25a00.firebaseapp.com",
    projectId: "expense-tracker-25a00",
    storageBucket: "expense-tracker-25a00.firebasestorage.app",
    messagingSenderId: "331973607819",
    appId: "1:331973607819:web:6495f9bc0d9a7735e8ef8e",
    measurementId: "G-4CY2ZWBEX4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
