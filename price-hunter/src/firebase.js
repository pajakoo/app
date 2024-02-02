// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBLQhYeRT4rtL_Jcn9G_QtluXdHr1sHVMk',
  authDomain: "shopapp-c3c48.firebaseapp.com",
  projectId: "shopapp-c3c48",
  storageBucket: "shopapp-c3c48.appspot.com",
  messagingSenderId: "1078990909694",
  appId: "1:1078990909694:web:5d18292374ce816a5db5af"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };