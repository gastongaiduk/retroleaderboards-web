<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../utils/supabaseClient.ts";
import { useUserStore } from "../stores/user.ts";

const router = useRouter();
const user = useUserStore();
const passwordInput = ref("");
const passwordConfirmInput = ref("");
const loading = ref(false);
const errorMessage = ref("");
const success = ref(false);

function getRedirectPath(): string {
  if (!user.isLoggedIn()) {
    return "/welcome";
  }
  if (!user.isSet()) {
    return "/ra-credentials";
  }
  return "/home";
}

async function handleSubmit() {
  if (passwordInput.value !== passwordConfirmInput.value) {
    errorMessage.value = "Passwords do not match";
    return;
  }
  if (passwordInput.value.length < 6) {
    errorMessage.value = "Password must be at least 6 characters";
    return;
  }
  loading.value = true;
  errorMessage.value = "";

  const { data, error } = await supabase.auth.updateUser({
    password: passwordInput.value,
  });

  loading.value = false;
  if (error) {
    errorMessage.value = error.message;
    return;
  }
  if (data.user) {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      user.login(data.user.id, sessionData.session.access_token);
    }
  }
  success.value = true;
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <header class="auth-header">
        <h1 class="auth-title">Set new password</h1>
        <p class="auth-subtitle">
          Choose a new password for your account.
        </p>
      </header>

      <form v-if="!success" @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="password" class="form-label">New password</label>
          <input
            type="password"
            id="password"
            v-model="passwordInput"
            class="form-input"
            required
            autocomplete="new-password"
            minlength="6"
          />
        </div>
        <div class="form-group">
          <label for="password-confirm" class="form-label">Confirm new password</label>
          <input
            type="password"
            id="password-confirm"
            v-model="passwordConfirmInput"
            class="form-input"
            required
            autocomplete="new-password"
            minlength="6"
          />
        </div>
        <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
        <button type="submit" class="btn btn-submit" :disabled="loading">
          <i v-if="loading" class="fa fa-spinner fa-spin"></i>
          <span v-else>Update password</span>
        </button>
      </form>

      <div v-else class="auth-success">
        <div class="success-icon">
          <i class="fa fa-check-circle"></i>
        </div>
        <p class="success-title">Password updated!</p>
        <p class="success-text">
          Your password has been changed successfully.
        </p>
        <button type="button" class="btn btn-submit" @click="router.push(getRedirectPath())">
          Continue
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background-color: #0f172a;
  background-image:
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(203, 163, 78, 0.06), transparent),
    radial-gradient(ellipse 60% 40% at 80% 100%, rgba(203, 163, 78, 0.04), transparent);
  color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  box-sizing: border-box;
}

.auth-card {
  width: 100%;
  max-width: 380px;
  background-color: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(203, 163, 78, 0.1);
  border-radius: 14px;
  padding: 28px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.auth-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.auth-title {
  font-size: 20px;
  font-weight: 700;
  color: #cba34e;
  margin: 0 0 6px;
  letter-spacing: -0.01em;
}

.auth-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.6;
}

.auth-form {
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
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

.form-error {
  font-size: 12px;
  color: #f87171;
  margin: 0 0 0.75rem;
  line-height: 1.5;
}

.btn-submit {
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

.btn-submit:hover:not(:disabled) {
  background-color: #b8923f;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-success {
  text-align: center;
  padding: 8px 0;
}

.success-icon {
  font-size: 40px;
  color: #4ade80;
  margin-bottom: 16px;
  animation: scaleIn 0.4s ease;
}

@keyframes scaleIn {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}

.success-title {
  font-size: 18px;
  font-weight: 700;
  color: #cba34e;
  margin: 0 0 8px;
}

.success-text {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.6;
  margin: 0 0 24px;
}
</style>
