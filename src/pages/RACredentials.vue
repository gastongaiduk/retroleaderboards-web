<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { useUserStore } from "../stores/user.ts";
import axios from "axios";


const router = useRouter();
const user = useUserStore();

const usernameInput = ref("");
const keyInput = ref("");
const loading = ref(false);



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

});
</script>
<template>
  <div class="page-container">
    <h1 class="page-title">Set your RA credentials</h1>
    <form @submit.prevent="handleSubmit" class="user-form">
      <div class="form-group">
        <label for="username" class="form-label">Username</label>
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
          Web API Key
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
.page-container {
  background-color: #0f172a;
  color: #e2e8f0;
  padding: 16px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.page-title {
  font-size: 17px;
  font-weight: 600;
  color: #cba34e;
  text-align: center;
  margin: 0 0 24px;
  letter-spacing: -0.01em;
}

.user-form {
  max-width: 400px;
  margin: 0 auto 20px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.form-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  font-size: 14px;
  color: #e2e8f0;
  background-color: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 8px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: rgba(203, 163, 78, 0.5);
  box-shadow: 0 0 0 3px rgba(203, 163, 78, 0.08);
}

.form-button {
  width: 100%;
  margin-top: 4px;
  font-size: 14px;
  font-weight: 600;
  padding: 11px 24px;
  background-color: #cba34e;
  color: #0f172a;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.form-button:hover:not(:disabled) {
  background-color: #b8923f;
}

.form-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.link-icon {
  color: #cba34e;
  padding-right: 8px;
  font-size: 12px;
  text-decoration: none;
}

.link-icon:hover {
  color: #d4b565;
}

@media (min-width: 768px) {
  .page-container {
    width: calc(100% - 40px);
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
