import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBFrhQhLQYSNhgCgzbfhOq0w5MEYH41oRI",
  authDomain: "job-opus.firebaseapp.com",
  databaseURL: "https://job-opus-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "job-opus",
  storageBucket: "job-opus.firebasestorage.app",
  messagingSenderId: "182169956593",
  appId: "1:182169956593:web:a5a27ff2810af1b329f950"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;