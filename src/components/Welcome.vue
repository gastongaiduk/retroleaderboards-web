<script lang="ts" setup>
import {useRouter} from "vue-router";
import {onMounted} from "vue";
import {useUserStore} from "../stores/user.ts";

const router = useRouter();
const user = useUserStore();

onMounted(async () => {
  if (user.isLoggedIn()) {
    await router.push("/home")
  }
});
</script>

<template>
  <div class="retro-container">
    <h1>Welcome to Retro leaderboards</h1>
    <div>
      This is a companion website for <a href="https://retroachievements.org" target="_blank">RetroAchievements</a>, where you can compare leaderboards between your scores and those of your friends. You can also receive updates for specific games whenever a friend surpasses you on the leaderboard!
    </div>
    <div>
      To get started, we invite you to sign up and confirm your email address. Once you’re signed in, you’ll need to set up your RetroAchievements username and web API key, which will be securely encrypted in our database.
    </div>
    <div>
      This is a hobby project that we hope will continue to grow and improve over time. Found a bug or have a cool suggestion? We’d love to hear from you! Feel free to open an issue or start a discussion on our <a href="https://github.com/gastongaiduk/retroleaderboards-web" target="_blank">GitHub repository</a>.
    </div>
    <div>
      If you already have an account, feel free to <button @click="router.push('login')">Login</button> and continue using the website!
      <br>
      If not, we can’t wait for you to <button @click="router.push('sign-up')">Sign up</button> and start enjoying the tool!
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
h1 {
  text-align: center;
  padding-bottom: 2rem;
}
.retro-container {
  background-color: #1a1a2e;
  color: #e0e1dd;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  font-family: 'Press Start 2P', cursive;
  font-size: 0.9rem;
  line-height: 1.5rem;
}
div:not(:last-child) {
  padding-bottom: 2rem;
}
a {
  color: #d48821;
}
button {
  background-color: #f5a623;
  color: #1a1a2e;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  border-radius: 10px;
}

button:hover {
  background-color: #d48821;
}
</style>
