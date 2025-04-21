<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { useUserStore } from "../stores/user.ts";
import axios from "axios";
import BurgerMenu from "../components/BurgerMenu.vue";
import { useSubscriptionUpdates } from "../composables/useSubscriptionUpdates.ts";

const router = useRouter();
const user = useUserStore();

const usernameInput = ref("");
const keyInput = ref("");
const loading = ref(false);

const { updatesNumber, fetchUpdates } = useSubscriptionUpdates();

async function handleSubmit() {
  loading.value = true;
  const options = {
    method: "POST",
    url: import.meta.env.VITE_SUPABASE_URL + "/functions/v1/set-ra-credentials",
    headers: {
      Authorization: "Bearer " + user.token,
    },
    data: { username: usernameInput.value, api_key: keyInput.value },
  };

  try {
    await axios.request(options);
    user.set(usernameInput.value, keyInput.value);
  } catch (error) {
    let errorMessage = error.response.data.error;

    if (errorMessage.includes("JWT expired")) {
      await router.push("/logout");
    }

    if (
      errorMessage.includes("duplicate key value violates unique constraint")
    ) {
      alert(
        "Username already assigned to a user. Contact the administrator if you need assistance.",
      );
      loading.value = false;
      return;
    }

    alert(error.response.data.error);
    loading.value = false;
    return;
  }

  await router.push("/");
}

onMounted(() => {
  if (!user.isLoggedIn()) {
    router.push("/login");
  }
  if (user.isSet() && user.username && user.key) {
    usernameInput.value = user.username;
    keyInput.value = user.key;
  }

  fetchUpdates();
});
</script>
<template>
  <div class="retro-container">
    <BurgerMenu :updates-number="updatesNumber"></BurgerMenu>
    <h1 class="retro-title">Set your RA credentials</h1>
    <form @submit.prevent="handleSubmit" class="user-form">
      <div class="form-group">
        <label for="username" class="form-label">Username:</label>
        <input
          type="text"
          id="username"
          v-model="usernameInput"
          class="form-input"
          required
        />
      </div>
      <div class="form-group">
        <label for="key" class="form-label">
          <a
            href="https://retroachievements.org/settings"
            target="_blank"
            class="link-icon"
          >
            <i class="fa fa-external-link"></i>
          </a>
          Web API Key:
        </label>
        <input
          type="password"
          id="key"
          v-model="keyInput"
          class="form-input"
          required
        />
      </div>
      <button type="submit" class="form-button" :disabled="loading">
        <i v-if="loading" class="fa fa-spinner fa-spin"></i>
        <span v-else>Submit</span>
      </button>
    </form>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

.retro-container {
  background-color: #1a1a2e;
  color: #e0e1dd;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.5);
  font-family: "Press Start 2P", cursive;
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
  border-radius: 10px;
}

.form-button:hover {
  background-color: #d48821;
}

.link-icon {
  color: #e0e1dd;
  padding-bottom: 5px;
  padding-right: 10px;
}

@media (min-width: 768px) {
  .retro-container {
    width: calc(100% - 40px);
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
