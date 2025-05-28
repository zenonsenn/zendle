import { createRouter, createWebHistory } from 'vue-router'
import GameView from '../views/GameView.vue'
import BlogView from '../views/BlogView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'game',
            component: GameView,
        },
        {
            path: '/blog',
            name: 'blog',
            component: BlogView,
        },
    ],
})

export default router
