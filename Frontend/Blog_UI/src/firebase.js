import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
     apiKey: "AIzaSyBmyfZ5S1PVELUkwi-xm4dAud0wtzyqhQ0",
     authDomain: "nxthreads.firebaseapp.com",
     projectId: "nxthreads",
     storageBucket: "nxthreads.firebasestorage.app",
     messagingSenderId: "499235531409",
     appId: "1:499235531409:web:1a42a6ee5d6ce331f0ed30",
     measurementId: "G-QG9Z5ZXSBR"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, app };
