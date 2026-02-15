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
import MySubscriptions from "../pages/MySubscriptions.vue";
import Rivals from "../pages/Rivals.vue";
import ForgotPassword from "../pages/ForgotPassword.vue";
import SetNewPassword from "../pages/SetNewPassword.vue";
import Settings from "../pages/Settings.vue";
import MainLayout from "../layouts/MainLayout.vue";

const routes: Array<RouteRecordRaw> = [
  { path: "/", redirect: "/welcome" },
  { path: "/welcome", name: "Welcome", component: Welcome },
  { path: "/login", name: "Login", component: Login },
  { path: "/sign-up", name: "SignUp", component: SingUp },
  { path: "/logout", name: "Logout", component: Logout },
  { path: "/auth-callback", name: "AuthCallback", component: AuthCallback },
  { path: "/forgot-password", name: "ForgotPassword", component: ForgotPassword },
  { path: "/set-new-password", name: "SetNewPassword", component: SetNewPassword },
  {
    path: "/",
    component: MainLayout,
    children: [
      { path: "home", name: "Home", component: Home, meta: { keepAlive: true } },
      { path: "ra-credentials", name: "RACredentials", component: RaCredentials },
      { path: "settings", name: "Settings", component: Settings },
      {
        path: "leaderboards-updates",
        name: "LeaderboardsUpdates",
        component: LeaderboardsUpdates,
      },
      {
        path: "my-subscriptions",
        name: "MySubscriptions",
        component: MySubscriptions,
      },
      {
        path: "rivals",
        name: "Rivals",
        component: Rivals,
      },
      {
        path: "game/:id/leaderboards",
        name: "GameLeaderboards",
        component: GameLeaderboards,
        props: true,
        meta: { keepAlive: true },
      },
      {
        path: "leaderboard/:id",
        name: "Leaderboard",
        component: Leaderboard,
        props: true,
      },
    ],
  },
  // Redirect all other paths to the home page
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

export default router;
