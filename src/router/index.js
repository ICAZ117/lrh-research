import { createRouter, createWebHistory } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import Home from '../views/Home.vue'

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
    path: '/codebook',
    name: 'Codebook',
    component: () => import('../views/Codebook.vue')
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

router.beforeEach(async (to, from, next) => {
  const auth = getAuth()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresStaff = to.matched.some(record => record.meta.requiresStaff)
  const requiresNoAuth = to.matched.some(record => record.meta.requiresNoAuth)
  const requiresDev = to.matched.some(record => record.meta.requiresDev)
  const currentUser = auth.currentUser

  console.log("CURRENT USER:", currentUser);

  // Handle authentication required paths
  if (requiresAuth && !currentUser) {
    // Store the intended destination
    const destination = to.fullPath
    next({
      path: '/auth/login',
      query: { redirect: destination }
    })
  }
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
  else if (requiresDev) {
    if (!currentUser) {
      // Store the intended dev destination
      const destination = to.fullPath
      next({
        path: '/auth/login',
        query: { redirect: destination }
      })
    } else {
      if (currentUser.uid !== 'rRcvNxC7lgaTgqkXd6UWqyJ2KuQ2') {
        console.log('not authorized', currentUser.uid);
        next('/')
      } else {
        next()
      }
    }
  }
  else if (requiresNoAuth && currentUser) {
    // If user is already logged in and tries to access login/register pages
    // Check if there's a redirect query parameter to use
    const redirectPath = to.query.redirect || '/'
    next(redirectPath)
  }
  else {
    next()
  }
})

export default router
