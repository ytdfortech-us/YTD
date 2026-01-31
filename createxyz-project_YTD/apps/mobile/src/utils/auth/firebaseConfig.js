import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth,
  getReactNativePersistence 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
// TODO: Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCY489J3fyWpNeL57kSM6NaXI4yilKpW7s",
  authDomain: "youthedriver.firebaseapp.com",
  projectId: "youthedriver",
  storageBucket: "youthedriver.firebasestorage.app",
  messagingSenderId: "837653476018",
  appId: "1:837653476018:web:cb4ee139019b48ca334fab",
  measurementId: "G-LKD4H2K4NF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
