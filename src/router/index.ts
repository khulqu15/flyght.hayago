import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import SimulationPage from '@/views/SimulationPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: { title: "Planner - Flyght" }
  },
  {
    path: '/simulation',
    name: 'Simulation',
    component: SimulationPage,
    meta: { title: "Simulation - Flyght" }
  },
  {
    path: '/control',
    name: 'Control',
    component: () => import('@/views/ControlPage.vue'),
    meta: { title: "Control - Flyght" }
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
