<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../utils/supabaseClient.ts";

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

  const { error } = await supabase.auth.resetPasswordForEmail(emailInput.value.trim(), {
    redirectTo,
  });

  loading.value = false;
  if (error) {
    errorMessage.value = error.message;
    return;
  }
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
          If an account exists for <strong>{{ emailInput }}</strong>, we've sent a password reset link. 
          Please check your inbox and spam folder.
        </p>
        <p class="auth-success-note">
          Didn't receive an email? Make sure the email address is correct or try again.
        </p>
        <button type="button" class="link-button" @click="router.push('/login')">
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
  background-color: #0f172a;
  background-image:
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(203, 163, 78, 0.06), transparent),
    radial-gradient(ellipse 60% 40% at 80% 100%, rgba(203, 163, 78, 0.04), transparent);
  color: #e2e8f0;
  display: flex;
  padding: 24px 16px;
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.auth-card {
  width: 100%;
  max-width: 380px;
  margin: auto;
  background-color: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(203, 163, 78, 0.1);
  border-radius: 14px;
  padding: 28px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #cba34e;
  text-decoration: none;
  margin-bottom: 1.25rem;
  font-weight: 500;
}

.back-link:hover {
  color: #d4b565;
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

.form-input::placeholder {
  color: #475569;
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
}

.auth-success p:first-child {
  font-size: 15px;
  font-weight: 600;
  color: #cba34e;
  margin: 0 0 12px;
}

.auth-success p:first-child i {
  margin-right: 6px;
}

.auth-success-text {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.7;
  margin: 0 0 1rem;
}

.auth-success-note {
  font-size: 12px;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 1rem;
}

.link-button {
  font-size: 13px;
  font-weight: 500;
  color: #cba34e;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 2px;
}

.link-button:hover {
  color: #d4b565;
  text-decoration: underline;
}
</style>
