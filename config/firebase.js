import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALAoyRt0XI5-tRR7b9J11j9y8VIoemyUw",
  authDomain: "proyect-ultima-milla.firebaseapp.com",
  databaseURL: "https://proyect-ultima-milla-default-rtdb.firebaseio.com",
  projectId: "proyect-ultima-milla",
  storageBucket: "proyect-ultima-milla.appspot.com",
  messagingSenderId: "772900269183",
  appId: "1:772900269183:web:09cfbbcdc04c376358e34a",
  measurementId: "G-D4D55G5J23"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const db = getDatabase();

export default app;