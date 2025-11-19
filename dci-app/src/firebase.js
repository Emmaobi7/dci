import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCytPlcc7sAjVZY2bkGo2gmdxWn84mWynA",
  authDomain: "igome-eb31d.firebaseapp.com",
  projectId: "igome-eb31d",
  storageBucket: "igome-eb31d.firebasestorage.app",
  messagingSenderId: "402894316399",
  appId: "1:402894316399:web:81749960d36c1f2d743e9a",
  measurementId: "G-P8X7SNFXN6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();