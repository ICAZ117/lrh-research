import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyBvBL5nTfjdu85awdDkGTS-HtlUvTLcD2U",
  authDomain: "lrh-codebook.firebaseapp.com",
  projectId: "lrh-codebook",
  storageBucket: "lrh-codebook.appspot.com",
  messagingSenderId: "19502263714",
  appId: "1:19502263714:web:563e622ef36866ca5d16fb",
  measurementId: "G-VE6JHR065F"
};

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app