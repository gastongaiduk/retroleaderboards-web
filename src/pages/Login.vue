<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../utils/supabaseClient.ts";
import { useUserStore } from "../stores/user.ts";
import { captureEvent } from "../utils/posthog";
import axios from "axios";

const router = useRouter();
const user = useUserStore();

const emailInput = ref("");
const passInput = ref("");
const loading = ref(false);

async function handleRACredentials() {
  const options = {
    method: "GET",
    url: import.meta.env.VITE_SUPABASE_URL + "/functions/v1/get-ra-credentials",
    headers: {
      Authorization: "Bearer " + user.token,
    },
  };

  try {
    const { data } = await axios.request(options);
    if (data.data) {
      user.set(data.data.username, data.data.api_key);
    }
  } catch (error) {
    console.error("Error while fetching RA credentials:", error);
  }
}

async function handleSubmit() {
  loading.value = true;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passInput.value,
  });

  if (error) {
    captureEvent("login_submitted", { success: false, error: error.message });
    alert(error.message);
    loading.value = false;
    return;
  }

  captureEvent("login_submitted", { success: true });

  user.login(data.user.id, data.session.access_token);

  await handleRACredentials();
  await router.push("/");
}

onMounted(async () => {
  if (user.isLoggedIn()) {
    loading.value = true;
    await handleRACredentials();
    await router.push("/");
  }
});
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <a href="#/welcome" class="back-link">
        <i class="fa fa-arrow-left"></i> Back
      </a>
      <header class="auth-header">
        <h1 class="auth-title">Log in</h1>
        <p class="auth-subtitle">Welcome back to Retro Leaderboards</p>
      </header>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            type="email"
            id="email"
            v-model="emailInput"
            class="form-input"
            placeholder="you@example.com"
            required
            autocomplete="email"
          />
        </div>
        <div class="form-group">
          <label for="pass" class="form-label">Password</label>
          <input
            type="password"
            id="pass"
            v-model="passInput"
            class="form-input"
            required
            autocomplete="current-password"
          />
        </div>
        <button type="submit" class="btn btn-submit" :disabled="loading">
          <i v-if="loading" class="fa fa-spinner fa-spin"></i>
          <span v-else>Log in</span>
        </button>
      </form>

      <p class="auth-extra">
        <button
          type="button"
          class="link-button"
          @click="router.push('/forgot-password')"
        >
          Forgot password?
        </button>
      </p>
      <p class="auth-footer">
        Don't have an account?
        <button
          type="button"
          class="link-button"
          @click="router.push('/sign-up')"
        >
          Sign up
        </button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  height: 100vh;
  height: 100dvh;
  background-color: var(--bg-body);
  color: var(--text-primary);
  display: flex;
  padding: var(--space-6) var(--space-4);
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.auth-card {
  width: 100%;
  max-width: 380px;
  margin: auto;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 28px 24px;
  box-shadow: var(--shadow-lg);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--accent-primary);
  text-decoration: none;
  margin-bottom: 1.25rem;
  font-weight: 500;
}

.back-link:hover {
  color: var(--accent-primary-hover);
}

.auth-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.auth-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent-primary);
  margin: 0 0 6px;
  letter-spacing: -0.01em;
}

.auth-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.auth-form {
  margin-bottom: 1.25rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 12px;
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
  font-size: 14px;
  color: var(--text-primary);
  background-color: var(--bg-body);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-input::placeholder {
  color: var(--text-muted);
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(233, 69, 96, 0.08);
}

.btn-submit {
  width: 100%;
  margin-top: 4px;
  font-size: 14px;
  font-weight: 600;
  padding: 11px 24px;
  background-color: var(--accent-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-submit:hover:not(:disabled) {
  background-color: var(--accent-primary-hover);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-extra {
  text-align: center;
  margin: 0 0 0.75rem;
}

.auth-footer {
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-default);
}

.link-button {
  font-size: 13px;
  font-weight: 500;
  color: var(--accent-primary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 2px;
}

.link-button:hover {
  color: var(--accent-primary-hover);
  text-decoration: underline;
}
</style>
