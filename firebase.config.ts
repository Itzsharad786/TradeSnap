// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6I4hDoOfGTXgSr2peid-gCe5GsfjpkYE",
  authDomain: "tradesnap-542ce.firebaseapp.com",
  projectId: "tradesnap-542ce",
  storageBucket: "tradesnap-542ce.firebasestorage.app",
  messagingSenderId: "422713399968",
  appId: "1:422713399968:web:8f0807535117c010ec07c5",
  measurementId: "G-X4KB8ERB7Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
