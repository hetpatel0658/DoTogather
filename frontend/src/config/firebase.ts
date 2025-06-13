
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUPz9SgPf1lWkO2o9dteVpa51-YlS92Ng",
  authDomain: "walkie-talkie-8cd3a.firebaseapp.com",
  projectId: "walkie-talkie-8cd3a",
  storageBucket: "walkie-talkie-8cd3a.appspot.com",
  messagingSenderId: "901629172992",
  appId: "1:901629172992:web:905faa33965694430b27e5"
};

// Lazy initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Initialize Firebase only when needed
const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    console.log("Initializing Firebase app");
    try {
      app = initializeApp(firebaseConfig);
      console.log("Firebase app initialized successfully");
    } catch (error) {
      console.error("Error initializing Firebase app:", error);
      throw error;
    }
  }
  return app;
};

const getFirebaseAuth = (): Auth => {
  if (!auth) {
    console.log("Initializing Firebase auth");
    try {
      auth = getAuth(getFirebaseApp());
      console.log("Firebase auth initialized successfully");
    } catch (error) {
      console.error("Error initializing Firebase auth:", error);
      throw error;
    }
  }
  return auth;
};

const getFirebaseFirestore = (): Firestore => {
  if (!db) {
    console.log("Initializing Firebase firestore");
    try {
      db = getFirestore(getFirebaseApp());
      console.log("Firebase firestore initialized successfully");
    } catch (error) {
      console.error("Error initializing Firebase firestore:", error);
      throw error;
    }
  }
  return db;
};

export { getFirebaseApp, getFirebaseAuth, getFirebaseFirestore };
