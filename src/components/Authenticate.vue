<script setup lang="ts">
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";

import { useUserStore } from '../stores/user'

const router = useRouter();
const user = useUserStore();

const usernameInput = ref("");
const keyInput = ref("");

function handleSubmit() {
  user.set(usernameInput.value, keyInput.value);
  router.push("/");
}

onMounted( () => {
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
        <label for="key" class="form-label">API KEY:</label>
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
  display: block;
  margin-bottom: 5px;
}

.form-input {
  width: calc(100% - 20px);
  padding: 10px;
  border-radius: 5px;
  border: none;
}

.form-button {
  background-color: #f5a623; /* Button color */
  color: #1a1a2e; /* Text color */
  border: none; /* No border */
  padding: 10px; /* Button padding */
  cursor: pointer; /* Pointer cursor on hover */
  font-size: 16px; /* Button font size */
  border-radius:10px; /* Rounded corners */
}

.form-button:hover {
  background-color:#d48821; /* Darker orange on hover */
}

/* Media query for desktop screens*/
@media (min-width :768 px) {
  .retro-container{
    width :calc(100%-40 px);/* Full width minus padding/margin for centering*/
    max-width :1200 px ;/* Set a maximum width for larger screens*/
    margin-left :auto ;/* Center the container horizontally*/
    margin-right :auto ;/* Center the container horizontally*/
  }
}
</style>