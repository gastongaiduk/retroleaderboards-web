import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '../components/Home.vue';
import GameLeaderboards from '../components/GameLeaderboards.vue';
import Leaderboard from "../components/Leaderboard.vue";
import Authenticate from "../components/Authenticate.vue";

// Define the routes with type annotations
const routes: Array<RouteRecordRaw> = [
    { path: '/', redirect: '/home' },
    { path: '/home', name: 'Home', component: Home },
    { path: '/login', name: 'Login', component: Authenticate },
    {
        path: '/:title/leaderboards/:id/',
        name: 'GameLeaderboards',
        component: GameLeaderboards,
        props: true,
    },
    {
        path: '/leaderboard/:title/:id',
        name: 'Leaderboard',
        component: Leaderboard,
        props: true,
    },
];

// Create the router with type annotations
const router = createRouter({
    history: createWebHistory(import.meta.env.VITE_BASE_URL as string),
    routes,
});

export default router;