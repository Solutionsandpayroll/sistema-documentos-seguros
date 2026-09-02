// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgRl4B96zObPV100icSgXErJNgNHUXD7c",
  authDomain: "sistema-documentos-seguros.firebaseapp.com",
  projectId: "sistema-documentos-seguros",
  storageBucket: "sistema-documentos-seguros.firebasestorage.app",
  messagingSenderId: "768122831229",
  appId: "1:768122831229:web:0ea79eb38e72f92e5ecc14"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;