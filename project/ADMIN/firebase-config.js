// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyCycqAmH0d1O5eXqWZ1yzjEiZw8OcLKA8s",
  authDomain: "admin-manage-dashboard.firebaseapp.com",
  projectId: "admin-manage-dashboard",
  storageBucket: "admin-manage-dashboard.firebasestorage.app",
  messagingSenderId: "985437524894",
  appId: "1:985437524894:web:0d400c54470c8f141d3c8f",
  measurementId: "G-RZE2649MFJ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();