// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD64LI7qkwm7VcEpXYVDDFpo0usLIBlKTA",
    authDomain: "barterbase-bc037.firebaseapp.com",
    projectId: "barterbase-bc037",
    storageBucket: "barterbase-bc037.firebasestorage.app",
    messagingSenderId: "769472078959",
    appId: "1:769472078959:web:ecf0159685a844c343999a",
    measurementId: "G-ZQC6NBN09E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);