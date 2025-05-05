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
  addDoc,
  arrayUnion,
  deleteDoc,
  arrayRemove,
  serverTimestamp,
  orderBy
} from 'firebase/firestore'

export const useResearchStore = defineStore('research', {
  state: () => ({
    allProjects: [],
    myProjects: [],
    currentProject: null,
    projectFiles: {},
    projectComments: [],
    allUsers: [],
    userNames: {},
    loading: false,
    activeDropdown: null,
  }),

  actions: {
    setActiveDropdown(dropdownId) {
      this.activeDropdown = dropdownId;
    },

    async fetchProjectFiles(projectType) {
      try {
        const docRef = doc(db, 'project-files', projectType);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          this.projectFiles[projectType] = docSnap.data().files || [];
        }
      } catch (error) {
        console.error('Error fetching project files:', error);
        throw error;
      }
    },

    async fetchProjectComments(projectId) {
      try {
        const commentsRef = collection(db, 'projects', projectId, 'comments');
        const q = query(commentsRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        this.projectComments = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error fetching project comments:', error);
        throw error;
      }
    },

    async addProjectComment(projectId, commentData) {
      try {
        const commentsRef = collection(db, 'projects', projectId, 'comments');
        await addDoc(commentsRef, {
          ...commentData,
          timestamp: serverTimestamp()
        });
        await this.fetchProjectComments(projectId);
      } catch (error) {
        console.error('Error adding project comment:', error);
        throw error;
      }
    },

    async addSystemComment(projectId, action, details) {
      try {
        const commentsRef = collection(db, 'projects', projectId, 'comments');
        await addDoc(commentsRef, {
          type: 'system',
          action,
          details,
          timestamp: serverTimestamp()
        });
        await this.fetchProjectComments(projectId);
      } catch (error) {
        console.error('Error adding system comment:', error);
        throw error;
      }
    },
    async fetchProjects(isStaff, userId) {
      this.loading = true
      try {
        const projectsRef = collection(db, 'projects')

        if (isStaff) {
          const querySnapshot = await getDocs(projectsRef)
          this.allProjects = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            needsAction: doc.data().needsAction || false
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
            ...doc.data(),
            needsAction: doc.data().needsAction || false
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

    async updateProjectActivity(projectId, needsAction) {
      this.loading = true
      try {
        const projectRef = doc(db, 'projects', projectId)
        await updateDoc(projectRef, {
          needsAction,
          updatedAt: new Date().toISOString()
        })

        // Update local state
        const projectInAll = this.allProjects.find(p => p.id === projectId)
        if (projectInAll) projectInAll.needsAction = needsAction

        const projectInMy = this.myProjects.find(p => p.id === projectId)
        if (projectInMy) projectInMy.needsAction = needsAction

        if (this.currentProject?.id === projectId) {
          this.currentProject.needsAction = needsAction
        }

        return true
      } catch (error) {
        console.error('Error updating project activity:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUsers() {
      this.loading = true
      try {
        const usersRef = collection(db, 'users')
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
        const assignedUsers = [
          projectData.principalInvestigator,
          projectData.coordinator,
          projectData.statistician,
          ...projectData.researchers
        ]

        const projectsCollectionRef = collection(db, 'projects')
        const newProjectRef = await addDoc(projectsCollectionRef, {
          ...projectData,
          assignedUsers: [...new Set(assignedUsers)],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })

        const projectId = newProjectRef.id

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

    async updateProject(projectId, projectData) {
      this.loading = true
      try {
        const projectRef = doc(db, 'projects', projectId)
        const projectSnapshot = await getDoc(projectRef)
        const oldAssignedUsers = projectSnapshot.data()?.assignedUsers || []

        const newAssignedUsers = [
          projectData.principalInvestigator,
          projectData.coordinator,
          projectData.statistician,
          ...projectData.researchers,
        ]
        const uniqueNewAssignedUsers = [...new Set(newAssignedUsers)]

        await updateDoc(projectRef, {
          ...projectData,
          assignedUsers: uniqueNewAssignedUsers,
          updatedAt: new Date().toISOString(),
        })

        // Identify users removed from the project
        const removedUsers = oldAssignedUsers.filter(userId => !uniqueNewAssignedUsers.includes(userId))

        // Update the projects array for removed users
        for (const userId of removedUsers) {
          const userRef = doc(db, 'users', userId)
          await updateDoc(userRef, {
            projects: arrayRemove(projectId),
          })
        }

        // Identify newly added users
        const addedUsers = uniqueNewAssignedUsers.filter(userId => !oldAssignedUsers.includes(userId))

        // Update the projects array for newly added users
        for (const userId of addedUsers) {
          const userRef = doc(db, 'users', userId)
          await updateDoc(userRef, {
            projects: arrayUnion(projectId),
          })
        }

        return true
      } catch (error) {
        console.error('Error updating project:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateProjectStatus(projectId, newStatus) {
      this.loading = true
      try {
        const projectRef = doc(db, 'projects', projectId)
        await updateDoc(projectRef, {
          status: newStatus,
          updatedAt: new Date().toISOString()
        })

        // Update local state
        const projectInAll = this.allProjects.find(p => p.id === projectId)
        if (projectInAll) projectInAll.status = newStatus

        const projectInMy = this.myProjects.find(p => p.id === projectId)
        if (projectInMy) projectInMy.status = newStatus

        if (this.currentProject?.id === projectId) {
          this.currentProject.status = newStatus
        }

        return true
      } catch (error) {
        console.error('Error updating project status:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteProject(projectId) {
      this.loading = true
      try {
        const projectRef = doc(db, 'projects', projectId)
        await deleteDoc(projectRef)

        // Update local state
        this.allProjects = this.allProjects.filter(p => p.id !== projectId)
        this.myProjects = this.myProjects.filter(p => p.id !== projectId)
        if (this.currentProject?.id === projectId) {
          this.currentProject = null
        }

        return true
      } catch (error) {
        console.error('Error deleting project:', error)
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
    },
  }
})
