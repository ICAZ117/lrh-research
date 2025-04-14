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
  const currentUser = auth.currentUser

  // redirect to login page if not logged in and requires auth
  if (requiresAuth && !currentUser) {
    next('/auth/login')
  }
  else if (requiresStaff) {
    if (!currentUser) {
      next('/auth/login')
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
  else if (requiresNoAuth && currentUser) {
    next('/')
  }
  else {
    next()
  }
})

export default router
