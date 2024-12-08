import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './middleware'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Apply the middleware

router.beforeEach(authGuard)

export default function (app) {
  app.use(router)
}
export { router }
