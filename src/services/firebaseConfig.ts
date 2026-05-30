import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBJNnA6u7uJAmkABnGYU8PApfhhqB-CZxA",
  authDomain: "foodexpress-51f5e.firebaseapp.com",
  projectId: "foodexpress-51f5e",
  storageBucket: "foodexpress-51f5e.firebasestorage.app",
  messagingSenderId: "102378063430",
  appId: "1:102378063430:web:bfb4c06e65c127d4416c47",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);