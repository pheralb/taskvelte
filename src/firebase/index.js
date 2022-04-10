// 💛 Firebase:
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// 🔨 Firebase config:
const firebaseConfig = {
  apiKey: APP_ENV_FIREBASE_API_KEY,
  authDomain: APP_ENV_FIREBASE_AUTH_DOMAIN,
  projectId: APP_ENV_FIREBASE_PROJECT_ID,
  storageBucket: APP_ENV_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: APP_ENV_FIREBASE_MESSAGING_SENDER_ID,
  appId: APP_ENV_FIREBASE_APP_ID,
};

// 🚀 Initialize Firestore:
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🚀 Initialize Firebase Auth:
const auth = getAuth();
const provider = new GoogleAuthProvider();
const userStatus = auth.currentUser;

// 🔨 Export all:
export { db, auth, signInWithPopup, provider, GoogleAuthProvider, userStatus };
