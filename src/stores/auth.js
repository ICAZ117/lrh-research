import { defineStore } from 'pinia'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updatePassword } from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    userData: null,
    loading: false
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    isStaff: (state) => state.userData?.userType === 'staff'
  },
  actions: {
    async login(email, password) {
      this.loading = true
      try {
        const auth = getAuth()
        const { user } = await signInWithEmailAndPassword(auth, email, password)
        this.user = user
        await this.fetchUserData()
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },
    async register(email, password, userData) {
      this.loading = true
      try {
        const auth = getAuth()
        const { user } = await createUserWithEmailAndPassword(auth, email, password)
        await setDoc(doc(db, 'users', user.uid), {
          ...userData,
          email,
          createdAt: new Date(),
          projects: []
        })
        this.user = user
        await this.fetchUserData()
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },
    async logout() {
      this.loading = true
      try {
        const auth = getAuth()
        await signOut(auth)
        this.user = null
        this.userData = null
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },
    async fetchUserData() {
      if (!this.user) return
      const docRef = doc(db, 'users', this.user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        this.userData = docSnap.data()
      }
    },
    async updateUserProfile(data) {
      if (!this.user) return { success: false, error: 'No user logged in' }
      try {
        const docRef = doc(db, 'users', this.user.uid)
        await updateDoc(docRef, data)
        await this.fetchUserData()
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },
    async updateUserPassword(newPassword) {
      if (!this.user) return { success: false, error: 'No user logged in' }
      try {
        await updatePassword(this.user, newPassword)
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    }
  }
})