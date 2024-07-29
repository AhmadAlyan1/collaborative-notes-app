import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB6p5J0aoMnfDwEiDZmpCzuDu4GTjjUX4Q",
    authDomain: "collaborative-notes-app-90374.firebaseapp.com",
    projectId: "collaborative-notes-app-90374",
    storageBucket: "collaborative-notes-app-90374.appspot.com",
    messagingSenderId: "560476114859",
    appId: "1:560476114859:web:8da78ac555e492ab83ccee",
    measurementId: "G-79DMY0WB9Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
