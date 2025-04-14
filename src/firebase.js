import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyBD_KO87vdH07s1ZOHXrzba-QrG3HKjG3k",
  authDomain: "lrhresearch.firebaseapp.com",
  projectId: "lrhresearch",
  storageBucket: "lrhresearch.firebasestorage.app",
  messagingSenderId: "827726888525",
  appId: "1:827726888525:web:c5bbcb2f23b2e8e11d6604",
  measurementId: "G-J40S910Q52"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Auth first
export const auth = getAuth(app)

// Then initialize other services
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
