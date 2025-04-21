import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import Home from '../views/Home.vue'
import { useAuthStore } from '../stores/auth'
import { useResearchStore } from '@/stores/research'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/account',
    name: 'Account',
    component: () => import('../views/Account.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { requiresNoAuth: true }
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue'),
    meta: { requiresNoAuth: true }
  },
  {
    path: '/auth/register-staff',
    name: 'RegisterStaff',
    component: () => import('../views/auth/RegisterStaff.vue'),
    meta: { requiresAuth: true, requiresStaff: true }
  },
  {
    path: '/research-portal',
    name: 'ResearchPortal',
    component: () => import('../views/research/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/research-portal/new',
    name: 'NewProject',
    component: () => import('../views/research/NewProject.vue'),
    meta: { requiresAuth: true, requiresStaff: true }
  },
  {
    path: '/research-portal/:id',
    name: 'ProjectDetails',
    component: () => import('../views/research/ProjectDetails.vue'),
    meta: { requiresAuth: true },
    beforeEnter: async (to, from, next) => {
      const authStore = useAuthStore()
      const researchStore = useResearchStore()

      if (!authStore.isAuthenticated) {
        next('/auth/login')
        return
      }

      try {
        await researchStore.fetchProject(to.params.id)

        if (!researchStore.currentProject) {
          next('/research-portal')
          return
        }

        if (authStore.isStaff || researchStore.currentProject.assignedUsers.includes(authStore.user.uid)) {
          next()
        } else {
          next('/research-portal')
        }
      } catch (error) {
        next('/research-portal')
      }
    }
  },
  {
    path: '/codebook',
    name: 'Codebook',
    component: () => import('../views/Codebook.vue')
  },
  {
    path: '/dev/DBManager',
    name: 'DBManager',
    component: () => import('../views/dev/DBManager.vue'),
    meta: { requiresDev: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})

// This function returns a promise that resolves when Firebase Auth is initialized
function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
}

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresStaff = to.matched.some(record => record.meta.requiresStaff)
  const requiresNoAuth = to.matched.some(record => record.meta.requiresNoAuth)
  const requiresDev = to.matched.some(record => record.meta.requiresDev)

  // Wait for Firebase Auth to initialize before proceeding
  const currentUser = await getCurrentUser();

  console.log("CURRENT USER:", currentUser);

  // Handle dev pages first since they have the most restrictive access
  if (requiresDev) {
    if (!currentUser) {
      // Store the intended dev destination
      const destination = to.fullPath
      next({
        path: '/auth/login',
        query: { redirect: destination }
      })
    } else if (currentUser.uid !== 'rRcvNxC7lgaTgqkXd6UWqyJ2KuQ2') {
      console.log('not authorized', currentUser.uid);
      next('/')
    } else {
      next()
    }
  }
  // Then handle staff pages
  else if (requiresStaff) {
    if (!currentUser) {
      // Store the intended staff destination
      const destination = to.fullPath
      next({
        path: '/auth/login',
        query: { redirect: destination }
      })
    } else {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      const userData = userDoc.data()
      if (!userData || userData.userType !== 'staff') {
        next('/')
      } else {
        next()
      }
    }
  }
  // Then handle normal auth pages
  else if (requiresAuth && !currentUser) {
    // Store the intended destination
    const destination = to.fullPath
    next({
      path: '/auth/login',
      query: { redirect: destination }
    })
  }
  // Handle login/register pages when already logged in
  else if (requiresNoAuth && currentUser) {
    // If user is already logged in and tries to access login/register pages
    // Check if there's a redirect query parameter to use
    const redirectPath = to.query.redirect || '/'
    next(redirectPath)
  }
  // Allow all other pages
  else {
    next()
  }
})

export default router
