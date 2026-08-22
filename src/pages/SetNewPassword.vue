<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../utils/supabaseClient.ts";
import { useUserStore } from "../stores/user.ts";
import { captureEvent } from "../utils/posthog";

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
    captureEvent("password_reset_completed", {
      success: false,
      error: "passwords_do_not_match",
    });
    errorMessage.value = "Passwords do not match";
    return;
  }
  if (passwordInput.value.length < 6) {
    captureEvent("password_reset_completed", {
      success: false,
      error: "password_too_short",
    });
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
    captureEvent("password_reset_completed", {
      success: false,
      error: error.message,
    });
    errorMessage.value = error.message;
    return;
  }
  captureEvent("password_reset_completed", { success: true });
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
        <p class="auth-subtitle">Choose a new password for your account.</p>
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
          <label for="password-confirm" class="form-label"
            >Confirm new password</label
          >
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
        <p class="success-text">Your password has been changed successfully.</p>
        <button
          type="button"
          class="btn btn-submit"
          @click="router.push(getRedirectPath())"
        >
          Continue
        </button>
      </div>
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

.form-error {
  font-size: 12px;
  color: var(--accent-red);
  margin: 0 0 0.75rem;
  line-height: 1.5;
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

.auth-success {
  text-align: center;
  padding: 8px 0;
}

.success-icon {
  font-size: 40px;
  color: var(--accent-green);
  margin-bottom: 16px;
  animation: scaleIn 0.4s ease;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  60% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-primary);
  margin: 0 0 8px;
}

.success-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 24px;
}
</style>
