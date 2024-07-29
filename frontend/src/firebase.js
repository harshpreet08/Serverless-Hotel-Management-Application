// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB3Snc4ikvYPkyKsAlRHBcqDDTKHPvg5Hc",
    authDomain: "dalvacationhome-73daa.firebaseapp.com",
    databaseURL: "https://dalvacationhome-73daa-default-rtdb.firebaseio.com",
    projectId: "dalvacationhome-73daa",
    storageBucket: "dalvacationhome-73daa.appspot.com",
    messagingSenderId: "805314360259",
    appId: "1:805314360259:web:eef1b82b2215f698984376",
    measurementId: "G-VXF85SY5PW"
  
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
