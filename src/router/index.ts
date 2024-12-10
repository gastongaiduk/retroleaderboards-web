import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router';
import RecentlyPlayedGames from '../components/RecentlyPlayedGames.vue';
import GameLeaderboards from '../components/GameLeaderboards.vue';
import Leaderboard from "../components/LeaderboardEntries.vue";
import Authenticate from "../components/Authenticate.vue";

const routes: Array<RouteRecordRaw> = [
    { path: '/', redirect: '/games' },
    { path: '/games', name: 'Games', component: RecentlyPlayedGames },
    { path: '/login', name: 'Login', component: Authenticate },
    {
        path: '/game/:id/leaderboards',
        name: 'GameLeaderboards',
        component: GameLeaderboards,
        props: true,
    },
    {
        path: '/leaderboard/:id',
        name: 'Leaderboard',
        component: Leaderboard,
        props: true,
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;