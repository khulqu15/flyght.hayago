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
  {
    path: '/optimization',
    name: 'Optimization',
    component: () => import('@/views/OptimizationPage.vue'),
    meta: { title: "Optimization - Flyght" }
  },
  {
    path: '/optimization-modul2',
    name: 'OptimizationModule2',
    component: () => import('@/views/Optimization2Page.vue'),
    meta: { title: "Optimization - Flyght" }
  },
  {
    path: '/sphere-function',
    name: 'SphereFunctionPage',
    component: () => import('@/views/SpherePage.vue'),
    meta: { title: "Sphere Optimization - Flyght" }
  },
  {
    path: '/dual',
    name: 'DualPage',
    component: () => import('@/views/DualPage.vue')
  },
  {
    path: '/underdamped',
    name: 'UnderdampedPage',
    component: () => import('@/views/UnderdampedPage.vue')
  },
  {
    path: '/hand',
    name: 'HandPage',
    component: () => import('@/views/HandPage.vue')
  },
  {
    path: '/oscillatory',
    name: 'OscillatoryPage',
    component: () => import('@/views/OscillatoryPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
