import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDarkMode: false
  }),
  actions: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
      localStorage.setItem('darkMode', this.isDarkMode)
    },
    initTheme() {
      const savedTheme = localStorage.getItem('darkMode')
      if (savedTheme !== null) {
        this.isDarkMode = JSON.parse(savedTheme)
      }
    }
  }
})
