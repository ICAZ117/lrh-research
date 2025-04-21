import { defineStore } from 'pinia'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  sendEmailVerification,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    userData: null,
    loading: false,
    initialized: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isStaff: (state) => state.userData?.userType === 'staff',
    isEmailVerified: (state) => state.user?.emailVerified ?? false,
    userInitials: (state) => {
      if (!state.userData) return ''
      return `${state.userData.firstName?.[0] || ''}${state.userData.lastName?.[0] || ''}`.toUpperCase()
    },
    avatarColor: (state) => {
      if (!state.userData) return '#000000'
      const colors = [
        '#FFC107', '#FF9800', '#FF5722', '#B10B0B', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
        '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
        '#FFEB3B',
      ]
      const hash = state.userData.email.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0)
      return colors[hash % colors.length]
    },
    fbaUser: (state) => {
      if (!state.user) return null
      return state.user
    },
    isDev: (state) => {
      if (!state.user) return false
      return state.user.uid === 'rRcvNxC7lgaTgqkXd6UWqyJ2KuQ2'
    },
  },

  actions: {
    async init() {
      onAuthStateChanged(auth, async (user) => {
        this.user = user
        if (user) {
          await this.fetchUserData()
        } else {
          this.userData = null
        }
        this.initialized = true
      })
    },

    async login(email, password) {
      this.loading = true
      try {
        const { user } = await signInWithEmailAndPassword(auth, email, password)
        this.user = user
        await this.fetchUserData()
        return { success: true }
      } catch (error) {
        let errorMessage = 'Failed to login'
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email'
            break
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password'
            break
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address'
            break
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled'
            break
        }
        return { success: false, error: errorMessage }
      } finally {
        this.loading = false
      }
    },

    async register(email, password, userData, isStaff = false) {
      this.loading = true
      try {
        const { user } = await createUserWithEmailAndPassword(auth, email, password)

        // Send email verification
        await sendEmailVerification(user)

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          ...userData,
          email,
          userType: isStaff ? 'staff' : 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          emailVerified: false,
          projects: []
        })

        this.user = user
        await this.fetchUserData()
        return {
          success: true,
          message: 'Please check your email to verify your account'
        }
      } catch (error) {
        let errorMessage = 'Failed to create account'
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'An account with this email already exists'
            break
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address'
            break
          case 'auth/operation-not-allowed':
            errorMessage = 'Email/password accounts are not enabled'
            break
          case 'auth/weak-password':
            errorMessage = 'Password is too weak'
            break
        }
        return { success: false, error: errorMessage }
      } finally {
        this.loading = false
      }
    },

    async registerStaffMember(email, password, userData) {
      if (!this.isStaff) {
        return {
          success: false,
          error: 'Unauthorized: Only staff members can create staff accounts'
        }
      }
      return this.register(email, password, userData, true)
    },

    async logout() {
      this.loading = true
      try {
        await signOut(auth)
        this.user = null
        this.userData = null
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to logout. Please try again.'
        }
      } finally {
        this.loading = false
      }
    },

    async fetchUserData() {
      if (!this.user) return
      try {
        const docRef = doc(db, 'users', this.user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          this.userData = docSnap.data()

          // Update emailVerified status if it changed
          if (this.userData.emailVerified !== this.user.emailVerified) {
            await updateDoc(docRef, {
              emailVerified: this.user.emailVerified,
              updatedAt: new Date().toISOString()
            })
            this.userData.emailVerified = this.user.emailVerified
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    },

    async updateUserProfile(data) {
      if (!this.user) return { success: false, error: 'No user logged in' }
      try {
        const docRef = doc(db, 'users', this.user.uid)
        await updateDoc(docRef, {
          ...data,
          updatedAt: new Date().toISOString()
        })
        await this.fetchUserData()
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to update profile. Please try again.'
        }
      }
    },

    async updateUserPassword(newPassword) {
      if (!this.user) return { success: false, error: 'No user logged in' }
      try {
        await updatePassword(this.user, newPassword)
        return { success: true }
      } catch (error) {
        let errorMessage = 'Failed to update password'
        switch (error.code) {
          case 'auth/requires-recent-login':
            errorMessage = 'Please login again before changing your password'
            break
          case 'auth/weak-password':
            errorMessage = 'Password is too weak'
            break
        }
        return { success: false, error: errorMessage }
      }
    },

    async resendVerificationEmail() {
      if (!this.user) return { success: false, error: 'No user logged in' }
      try {
        await sendEmailVerification(this.user)
        return {
          success: true,
          message: 'Verification email sent. Please check your inbox.'
        }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to send verification email. Please try again later.'
        }
      }
    }
  }
})
