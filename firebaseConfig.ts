// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { initializeAuth, getReactNativePersistence } from "firebase/auth"
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByk2dOK93OnB0-DOrG-XDClAFafe2G7Lo",
  authDomain: "betmate-84d4c.firebaseapp.com",
  projectId: "betmate-84d4c",
  storageBucket: "betmate-84d4c.firebasestorage.app",
  messagingSenderId: "1067137092859",
  appId: "1:1067137092859:web:365e5a7eab56b7da65b45e"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});