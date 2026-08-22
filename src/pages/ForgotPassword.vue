<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../utils/supabaseClient.ts";
import { captureEvent } from "../utils/posthog";

const router = useRouter();
const emailInput = ref("");
const loading = ref(false);
const sent = ref(false);
const errorMessage = ref("");

async function handleSubmit() {
  if (!emailInput.value.trim()) return;
  loading.value = true;
  errorMessage.value = "";
  const redirectTo = `${import.meta.env.VITE_APP_URL || window.location.origin}/#/auth-callback`;

  const { error } = await supabase.auth.resetPasswordForEmail(
    emailInput.value.trim(),
    {
      redirectTo,
    },
  );

  loading.value = false;
  if (error) {
    captureEvent("password_reset_requested", {
      success: false,
      error: error.message,
    });
    errorMessage.value = error.message;
    return;
  }
  captureEvent("password_reset_requested", { success: true });
  sent.value = true;
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <a href="#/login" class="back-link">
        <i class="fa fa-arrow-left"></i> Back
      </a>
      <header class="auth-header">
        <h1 class="auth-title">Reset password</h1>
        <p class="auth-subtitle">
          Enter your email and we'll send you a link to set a new password.
        </p>
      </header>

      <form v-if="!sent" @submit.prevent="handleSubmit" class="auth-form">
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
        <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
        <button type="submit" class="btn btn-submit" :disabled="loading">
          <i v-if="loading" class="fa fa-spinner fa-spin"></i>
          <span v-else>Send reset link</span>
        </button>
      </form>

      <div v-else class="auth-success">
        <p><i class="fa fa-check-circle"></i> Check your email</p>
        <p class="auth-success-text">
          If an account exists for <strong>{{ emailInput }}</strong
          >, we've sent a password reset link. Please check your inbox and spam
          folder.
        </p>
        <p class="auth-success-note">
          Didn't receive an email? Make sure the email address is correct or try
          again.
        </p>
        <button
          type="button"
          class="link-button"
          @click="router.push('/login')"
        >
          Back to log in
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
}

.auth-success p:first-child {
  font-size: 15px;
  font-weight: 600;
  color: var(--accent-primary);
  margin: 0 0 12px;
}

.auth-success p:first-child i {
  margin-right: 6px;
}

.auth-success-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 0 1rem;
}

.auth-success-note {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0 0 1rem;
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
