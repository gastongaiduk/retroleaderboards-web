import {createRouter, createWebHistory} from 'vue-router';
import Home from '../components/Home.vue';
import GameLeaderboards from '../components/GameLeaderboards.vue';
import Leaderboard from "../components/Leaderboard.vue";

const routes = [
    {path: '/', redirect: '/home'},
    {path: '/home', name: 'Home', component: Home},
    {path: '/:title/leaderboards/:id/:', name: 'GameLeaderboards', component: GameLeaderboards, props: true},
    {path: '/leaderboard/:title/:id', name: 'Leaderboard', component: Leaderboard, props: true},
];

const router = createRouter({
    history: createWebHistory(import.meta.env.VITE_BASE_URL),
    routes,
});

export default router;