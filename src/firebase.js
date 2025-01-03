import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDHk85olncJf-tOGBDxSn5qUXAbpKeabyk",
  authDomain: "chatify-71b9f.firebaseapp.com",
  projectId: "chatify-71b9f",
  storageBucket: "chatify-71b9f.firebasestorage.app",
  messagingSenderId: "420810884369",
  appId: "1:420810884369:web:ed40bb779bc160fa3378b0",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore();
