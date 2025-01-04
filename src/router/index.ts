import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router';
import GameLeaderboards from '../components/GameLeaderboards.vue';
import Leaderboard from "../components/LeaderboardEntries.vue";
import Login from "../components/Login.vue";
import Home from "../components/Home.vue";
import LeaderboardsUpdates from "../components/LeaderboardsUpdates.vue";
import SingUp from "../components/SingUp.vue";
import Logout from "../components/Logout.vue";
import RaCredentials from "../components/RACredentials.vue";
import AuthCallback from "../components/AuthCallback.vue";

const routes: Array<RouteRecordRaw> = [
    { path: '/', redirect: '/home' },
    { path: '/login', name: 'Login', component: Login },
    { path: '/sign-up', name: 'SignUp', component: SingUp },
    { path: '/logout', name: 'Logout', component: Logout },
    { path: '/auth-callback', name: 'AuthCallback', component: AuthCallback },
    { path: '/home', name: 'Home', component: Home },
    { path: '/ra-credentials', name: 'RACredentials', component: RaCredentials },
    { path: '/leaderboards-updates', name: 'LeaderboardsUpdates', component: LeaderboardsUpdates },
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
    // Redirect all other paths to the home page
    { path: '/:pathMatch(.*)*',
        redirect: to => {
            return { path: '/', query: { q: to.params.pathMatch[0] } }
        },
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
});

export default router;