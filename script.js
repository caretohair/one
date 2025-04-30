import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCeuaUdUQO3TEJplfl5q24O8Zb01Rwtw6E",
    authDomain: "hcaw-af26e.firebaseapp.com",
    projectId: "hcaw-af26e",
    storageBucket: "hcaw-af26e.firebasestorage.app",
    messagingSenderId: "882275854718",
    appId: "1:882275854718:web:135016785a06cd1b6feb2f",
    measurementId: "G-8Z07DLMR0E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Authentication handling
const googleSignInBtn = document.getElementById('googleSignInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const userStatus = document.getElementById('userStatus');
const bookingForm = document.getElementById('booking-form');
const emailInput = document.getElementById('email');

if (!googleSignInBtn || !signOutBtn || !userStatus || !bookingForm || !emailInput) {
    console.error("One or more DOM elements not found:", { googleSignInBtn, signOutBtn, userStatus, bookingForm, emailInput });
}

googleSignInBtn.addEventListener('click', () => {
    console.log("Attempting to sign in with Google...");
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            console.log("Signed in with Google:", user);
            console.log("User email:", user.email);
            console.log("User displayName:", user.displayName);
        })
        .catch((error) => {
            console.error("Google Sign-In error:", error.code, error.message);
            alert('Error signing in with Google: ' + error.message);
        });
});

signOutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        console.log("Signed out successfully");
    }).catch((error) => {
        console.error("Sign-out error:", error);
    });
});

onAuthStateChanged(auth, (user) => {
    console.log("Auth state changed:", user);
    if (user) {
        const displayName = user.email || user.displayName || "User";
        userStatus.textContent = `Signed in as ${displayName}`;
        googleSignInBtn.style.display = 'none';
        signOutBtn.style.display = 'block';
        bookingForm.style.display = 'block';
        emailInput.value = user.email || "Not provided";
    } else {
        userStatus.textContent = 'Not signed in';
        googleSignInBtn.style.display = 'block';
        signOutBtn.style.display = 'none';
        bookingForm.style.display = 'none';
        emailInput.value = '';
    }
});

const dateInput = document.getElementById('appointmentDate');
const timeSlot = document.getElementById('time-slot');
const today = new Date().toISOString().split('T')[0];

// Set minimum date to tomorrow
dateInput.min = today;

// Show time slots only when a future date is selected
dateInput.addEventListener('change', function() {
    if (this.value && this.value >= today) {
        timeSlot.style.display = 'block';
    } else {
        timeSlot.style.display = 'none';
    }
});

// Handle form submission
document.getElementById('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        alert('Please sign in to book an appointment.');
        return;
    }

    const appointmentData = {
        name: document.getElementById('name').value,
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        email: user.email || "Not provided",
        service: document.getElementById('service').value,
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value,
        timestamp: new Date(),
        userId: user.uid
    };

    try {
        console.log("Submitting appointment:", appointmentData);
        await addDoc(collection(db, 'appointments'), appointmentData);
        alert('Appointment booked successfully!');
        document.getElementById('booking-form').reset();
        timeSlot.style.display = 'none';
        emailInput.value = user.email || "Not provided";
    } catch (error) {
        console.error("Submission error:", error);
        alert('Error booking appointment: ' + error.message);
    }
});