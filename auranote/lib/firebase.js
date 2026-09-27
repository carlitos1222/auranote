import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBe54EQunNIZO59fcm9LpUhVC8-qadjweQ",
  authDomain: "ia-de-aputes.firebaseapp.com",
  projectId: "ia-de-aputes",
  storageBucket: "ia-de-aputes.firebasestorage.app",
  messagingSenderId: "303367258984",
  appId: "1:303367258984:web:0b29734d57413729df8cdd",
  measurementId: "G-FY0JXXKYRN"
};

// Initialize Firebase (avoid re-initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
