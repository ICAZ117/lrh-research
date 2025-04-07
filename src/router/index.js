import { createRouter, createWebHistory } from 'vue-router'
import { getAuth } from 'firebase/auth'
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
  // {
  //   path: '/research-portal',
  //   name: 'ResearchPortal',
  //   component: () => import('../views/research/Dashboard.vue'),
  //   meta: { requiresAuth: true }
  // },
  // {
  //   path: '/research-portal/new',
  //   name: 'NewProject',
  //   component: () => import('../views/research/NewProject.vue'),
  //   meta: { requiresAuth: true, requiresStaff: true }
  // },
  // {
  //   path: '/research-portal/:projectId',
  //   name: 'ProjectDetails',
  //   component: () => import('../views/research/ProjectDetails.vue'),
  //   meta: { requiresAuth: true }
  // },
  // {
  //   path: '/auth/login',
  //   name: 'Login',
  //   component: () => import('../views/auth/Login.vue')
  // },
  // {
  //   path: '/auth/register',
  //   name: 'Register',
  //   component: () => import('../views/auth/Register.vue')
  // },
  // {
  //   path: '/auth/forgot-password',
  //   name: 'ForgotPassword',
  //   component: () => import('../views/auth/ForgotPassword.vue')
  // },
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
  const currentUser = auth.currentUser

  if (requiresAuth && !currentUser) {
    next('/auth/login')
  } else if (requiresStaff) {
    // Check if user is staff (implement this logic)
    next()
  } else {
    next()
  }
})

export default router
