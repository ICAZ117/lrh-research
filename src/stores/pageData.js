// src/stores/pageData.js
import { defineStore } from 'pinia'
import { db } from '../firebase'
import { collection, doc, getDoc, setDoc } from 'firebase/firestore'

export const usePageDataStore = defineStore('pageData', {
  state: () => ({
    homePage: null
  }),

  actions: {
    async getHomePage() {
      const pageDataCollection = collection(db, 'pageData')
      const homePageDoc = doc(pageDataCollection, 'homePage')
      const docSnap = await getDoc(homePageDoc)
      if (docSnap.exists()) {
        this.homePage = docSnap.data()
      } else {
        console.log('No homePage document found')
      }
    },
  }
})
