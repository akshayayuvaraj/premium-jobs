// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFrhQhLQYSNhgCgzbfhOq0w5MEYH41oRI",
  authDomain: "job-opus.firebaseapp.com",
  projectId: "job-opus",
  storageBucket: "job-opus.firebasestorage.app",
  messagingSenderId: "182169956593",
  appId: "1:182169956593:web:a5a27ff2810af1b329f950"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services so App.jsx can find them
export const auth = getAuth(app);
export const db = getFirestore(app);