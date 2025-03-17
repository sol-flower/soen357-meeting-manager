import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAhLjuOSN7HcPw5Nn-NPRottw7k4mmGMwQ",
  authDomain: "meeting-manager-e2601.firebaseapp.com",
  projectId: "meeting-manager-e2601",
  storageBucket: "meeting-manager-e2601.firebasestorage.app",
  messagingSenderId: "197906993909",
  appId: "1:197906993909:web:383af7e8a5a88205ce2bbc",
  measurementId: "G-EHBFE18M5J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export  const firestore = getFirestore(app);