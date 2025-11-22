// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// Uses Environment Variables for security (Netlify), falls back to hardcoded values for local dev
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA6I4hDoOfGTXgSr2peid-gCe5GsfjpkYE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tradesnap-542ce.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tradesnap-542ce",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tradesnap-542ce.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "422713399968",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:422713399968:web:8f0807535117c010ec07c5",
  measurementId: "G-X4KB8ERB7Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
