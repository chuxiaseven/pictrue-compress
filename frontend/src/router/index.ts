import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/history',
      name: 'History',
      component: () => import('../views/History.vue')
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/Settings.vue')
    }
  ]
})

export default router