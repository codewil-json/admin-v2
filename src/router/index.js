import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  }
  ,
  {
    path: '/categories',
    name: 'categories',
    component: () => import('../views/CategoriesView.vue')
  },
  {
    path: '/posts',
    name: 'posts',
    component: () => import('../views/PostsView.vue')
  }
]


const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Guard global: proteger rotas (qualquer rota exceto 'login' exige autenticação)
router.beforeEach((to, from, next) => {
  const publicPages = ['login']
  const authRequired = !publicPages.includes(to.name)
  const isAuthenticated = !!localStorage.getItem('user') || !!localStorage.getItem('token')

  if (authRequired && !isAuthenticated) {
    return next({ name: 'login' })
  }

  // Impedir acesso à página de login quando já autenticado
  if (to.name === 'login' && isAuthenticated) {
    return next({ name: 'home' })
  }

  next()
})

export default router
