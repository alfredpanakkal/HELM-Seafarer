import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import localConfig from "../../firebase-applet-config.json";

// Prioritize environment variables (e.g. VITE_FIREBASE_API_KEY) with fallback to local applet config
const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || localConfig?.apiKey || "",
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || localConfig?.authDomain || "",
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || localConfig?.projectId || "",
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || localConfig?.storageBucket || "",
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || localConfig?.messagingSenderId || "",
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || localConfig?.appId || "",
  firestoreDatabaseId: (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID as string) || localConfig?.firestoreDatabaseId || "",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Explicitly pass the databaseId from config if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export default app;
