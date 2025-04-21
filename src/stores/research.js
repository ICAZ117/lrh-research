import { defineStore } from 'pinia'
import { db } from '@/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore'

export const useResearchStore = defineStore('research', {
  state: () => ({
    allProjects: [],
    myProjects: [],
    currentProject: null,
    staffUsers: [],
    allUsers: [],
    userNames: {},
    loading: false
  }),

  actions: {
    async fetchProjects(isStaff, userId) {
      this.loading = true
      try {
        const projectsRef = collection(db, 'projects')

        if (isStaff) {
          const querySnapshot = await getDocs(projectsRef)
          this.allProjects = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))

          this.myProjects = this.allProjects.filter(project =>
            project.assignedUsers.includes(userId)
          )
        } else {
          const q = query(
            projectsRef,
            where('assignedUsers', 'array-contains', userId)
          )
          const querySnapshot = await getDocs(q)
          this.myProjects = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        }

        await this.fetchUserNames()
      } catch (error) {
        console.error('Error fetching projects:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUsers() {
      this.loading = true
      try {
        const usersRef = collection(db, 'users')

        const staffQuery = query(usersRef, where('userType', '==', 'staff'))
        const staffSnapshot = await getDocs(staffQuery)
        this.staffUsers = staffSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        const allSnapshot = await getDocs(usersRef)
        this.allUsers = allSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error fetching users:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchProject(projectId) {
      this.loading = true
      try {
        const projectDoc = await getDoc(doc(db, 'projects', projectId))
        if (projectDoc.exists()) {
          this.currentProject = {
            id: projectDoc.id,
            ...projectDoc.data()
          }
          await this.fetchUserNames()
        }
      } catch (error) {
        console.error('Error fetching project:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createProject(projectData) {
      this.loading = true
      try {
        const projectId = Math.random().toString(36).substring(2, 8).toUpperCase()
        const assignedUsers = [
          projectData.principalInvestigator,
          projectData.coordinator,
          projectData.statistician,
          ...projectData.researchers
        ]

        const projectRef = doc(db, 'projects', projectId)
        await setDoc(projectRef, {
          ...projectData,
          assignedUsers: [...new Set(assignedUsers)],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })

        for (const userId of assignedUsers) {
          const userRef = doc(db, 'users', userId)
          await updateDoc(userRef, {
            projects: arrayUnion(projectId)
          })
        }

        return projectId
      } catch (error) {
        console.error('Error creating project:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUserNames() {
      const userIds = new Set()

      if (this.currentProject) {
        userIds.add(this.currentProject.principalInvestigator)
        userIds.add(this.currentProject.coordinator)
        userIds.add(this.currentProject.statistician)
        this.currentProject.researchers?.forEach(id => userIds.add(id))
      }

      const projects = [...this.allProjects, ...this.myProjects]
      projects.forEach(project => {
        userIds.add(project.principalInvestigator)
        userIds.add(project.coordinator)
        userIds.add(project.statistician)
        project.researchers?.forEach(id => userIds.add(id))
      })

      for (const userId of userIds) {
        if (!this.userNames[userId]) {
          const userDoc = await getDoc(doc(db, 'users', userId))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            this.userNames[userId] = `${userData.title} ${userData.firstName} ${userData.lastName}`
          }
        }
      }
    },

    getUserName(userId) {
      return this.userNames[userId] || 'Loading...'
    }
  }
})
