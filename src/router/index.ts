import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import GameLeaderboards from "../pages/GameLeaderboards.vue";
import Leaderboard from "../pages/LeaderboardEntries.vue";
import Login from "../pages/Login.vue";
import Home from "../pages/Home.vue";
import LeaderboardsUpdates from "../pages/LeaderboardsUpdates.vue";
import SingUp from "../pages/SingUp.vue";
import Logout from "../pages/Logout.vue";
import RaCredentials from "../pages/RACredentials.vue";
import AuthCallback from "../pages/AuthCallback.vue";
import Welcome from "../pages/Welcome.vue";

const routes: Array<RouteRecordRaw> = [
  { path: "/", redirect: "/welcome" },
  { path: "/welcome", name: "Welcome", component: Welcome },
  { path: "/login", name: "Login", component: Login },
  { path: "/sign-up", name: "SignUp", component: SingUp },
  { path: "/logout", name: "Logout", component: Logout },
  { path: "/auth-callback", name: "AuthCallback", component: AuthCallback },
  { path: "/home", name: "Home", component: Home, meta: { keepAlive: true } },
  { path: "/ra-credentials", name: "RACredentials", component: RaCredentials },
  {
    path: "/leaderboards-updates",
    name: "LeaderboardsUpdates",
    component: LeaderboardsUpdates,
  },
  {
    path: "/game/:id/leaderboards",
    name: "GameLeaderboards",
    component: GameLeaderboards,
    props: true,
    meta: { keepAlive: true },
  },
  {
    path: "/leaderboard/:id",
    name: "Leaderboard",
    component: Leaderboard,
    props: true,
  },
  // Redirect all other paths to the home page
  {
    path: "/:pathMatch(.*)*",
    redirect: (to) => {
      return { path: "/", query: { q: to.params.pathMatch[0] } };
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

export default router;
