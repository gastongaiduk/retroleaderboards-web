<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { useUserStore } from "../stores/user.ts";
import { captureEvent } from "../utils/posthog";
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
    captureEvent("ra_credentials_saved", { success: true });
  } catch (error) {
    let errorMessage = error.response.data.error;

    if (errorMessage.includes("JWT expired")) {
      captureEvent("ra_credentials_saved", {
        success: false,
        error_reason: "session_expired",
      });
      await router.push("/logout");
    }

    if (
      errorMessage.includes("duplicate key value violates unique constraint")
    ) {
      captureEvent("ra_credentials_saved", {
        success: false,
        error_reason: "duplicate_username",
      });
      alert(
        "Username already assigned to a user. Contact the administrator if you need assistance.",
      );
      loading.value = false;
      return;
    }

    captureEvent("ra_credentials_saved", {
      success: false,
      error_reason: "other",
    });
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
  color: var(--text-primary);
  padding: var(--space-4);
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.page-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--accent-primary);
  text-align: center;
  margin: 0 0 var(--space-6);
  letter-spacing: -0.01em;
}

.user-form {
  max-width: 400px;
  margin: 0 auto var(--space-5);
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: flex;
  align-items: center;
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.form-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  font-size: var(--text-base);
  color: var(--text-primary);
  background-color: var(--bg-body);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  transition:
    border-color var(--transition-normal),
    box-shadow var(--transition-normal);
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(233, 69, 96, 0.1);
}

.form-button {
  width: 100%;
  margin-top: var(--space-1);
  font-size: var(--text-base);
  font-weight: 600;
  padding: 11px 24px;
  background-color: var(--accent-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.form-button:hover:not(:disabled) {
  background-color: var(--accent-primary-hover);
}

.form-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.link-icon {
  color: var(--accent-primary);
  padding-right: 8px;
  font-size: var(--text-sm);
  text-decoration: none;
}

.link-icon:hover {
  color: var(--accent-primary-hover);
}

@media (min-width: 768px) {
  .page-container {
    max-width: var(--content-max-width);
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
