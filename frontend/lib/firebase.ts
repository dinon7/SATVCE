// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; // Import Realtime Database
// TODO: Add SDKs for other Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCF1RwbEZ2s0Ttz5pL8cE9NqrZo8NW0_f0",
  authDomain: "vce-career-chooser.firebaseapp.com",
  databaseURL: "https://vce-career-chooser-default-rtdb.firebaseio.com",
  projectId: "vce-career-chooser",
  storageBucket: "vce-career-chooser.firebasestorage.app",
  messagingSenderId: "158760769707",
  appId: "1:158760769707:web:5bd5b5ddd3956b806c7fee",
  measurementId: "G-F9PFMRMZGH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

// Export the initialized services (including db and database)
export { db, app, analytics, database };

// Optional: Initialize other services if needed (e.g., Auth, Storage)
// export const auth = getAuth(app);
// export const storage = getStorage(app); 