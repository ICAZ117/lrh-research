import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useResearchStore } from '../stores/research'
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
    component: () => import('../views/codebook/Codebook.vue')
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
    path: '/research-portal/:id/edit',
    name: 'EditProject',
    component: () => import('../views/research/EditProject.vue'),
    meta: { requiresAuth: true, requiresStaff: true },
    beforeEnter: async (to, from, next) => {
      const authStore = useAuthStore()
      const researchStore = useResearchStore()

      if (!authStore.isStaff) {
        next('/research-portal')
        return
      }

      try {
        await researchStore.fetchProject(to.params.id)
        if (!researchStore.currentProject) {
          next('/research-portal')
        } else {
          next()
        }
      } catch (error) {
        next('/research-portal')
      }
    }
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
    path: '/auth/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue')
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue')
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
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresStaff = to.matched.some(record => record.meta.requiresStaff)

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/auth/login')
  } else if (requiresStaff && !authStore.isStaff) {
    next('/')
  } else {
    next()
  }
})

export default router
