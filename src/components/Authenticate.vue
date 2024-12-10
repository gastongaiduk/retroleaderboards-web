<script setup lang="ts">
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";

import {useUserStore} from '../stores/user'

const router = useRouter();
const user = useUserStore();

const usernameInput = ref("");
const keyInput = ref("");

function handleSubmit() {
  user.set(usernameInput.value, keyInput.value);
  router.push("/");
}

onMounted(() => {
  if (user.isSet()) {
    router.push("/")
  }
});
</script>
<template>
  <div class="retro-container">
    <h1 class="retro-title">Authenticate</h1>
    <form @submit.prevent="handleSubmit" class="user-form">
      <div class="form-group">
        <label for="username" class="form-label">Username:</label>
        <input type="text" id="username" v-model="usernameInput" class="form-input" required>
      </div>
      <div class="form-group">
        <label for="key" class="form-label">
          Web API Key:
          <a href="https://retroachievements.org/settings" target="_blank" class="link-icon">
            🔗
          </a>
        </label>
        <input type="password" id="key" v-model="keyInput" class="form-input" required>
      </div>
      <button type="submit" class="form-button">Submit</button>
    </form>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.retro-container {
  background-color: #1a1a2e;
  color: #e0e1dd;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.5);
  font-family: 'Press Start 2P', cursive;
}

.retro-title {
  font-size: 24px;
  color: #f5a623;
  text-align: center;
}

.user-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-label {
  display: flex;
  align-items: center;
}

.form-input {
  width: calc(100% - 20px);
  padding: 10px;
  border-radius: 5px;
  border: none;
}

.form-button {
  background-color: #f5a623;
  color: #1a1a2e;
  border: none;
  padding: 10px;
  cursor: pointer;
  font-size: 16px;
  border-radius:10px;
}

.form-button:hover {
  background-color:#d48821;
}

.link-icon {
  margin-left: 8px;
}

@media (min-width :768 px) {
  .retro-container{
    width :calc(100%-40 px);
    max-width :1200 px ;
    margin-left :auto ;
    margin-right :auto ;
  }
}
</style>
