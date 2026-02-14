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
          Enter your email and we’ll send you a link to set a new password.
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
@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

.auth-page {
  min-height: 100vh;
  background-color: #1a1a2e;
  background-image:
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(245, 166, 35, 0.08), transparent),
    radial-gradient(ellipse 60% 40% at 80% 100%, rgba(212, 136, 33, 0.06), transparent);
  color: #e0e1dd;
  font-family: "Press Start 2P", cursive;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  box-sizing: border-box;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background-color: rgba(34, 34, 59, 0.8);
  border: 1px solid rgba(245, 166, 35, 0.2);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.55rem;
  color: #d48821;
  text-decoration: none;
  margin-bottom: 1.5rem;
}

.back-link:hover {
  color: #f5a623;
  text-decoration: underline;
}

.auth-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.auth-title {
  font-size: 1rem;
  color: #f5a623;
  margin: 0 0 0.5rem;
}

.auth-subtitle {
  font-size: 0.55rem;
  color: #b8b9b5;
  margin: 0;
  line-height: 1.6;
}

.auth-form {
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.55rem;
  color: #e0e1dd;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  font-family: "Press Start 2P", cursive;
  font-size: 0.6rem;
  color: #e0e1dd;
  background-color: #16213e;
  border: 2px solid rgba(245, 166, 35, 0.25);
  border-radius: 10px;
  transition: border-color 0.2s ease;
}

.form-input::placeholder {
  color: #6b6c68;
}

.form-input:focus {
  outline: none;
  border-color: #f5a623;
}

.form-error {
  font-size: 0.5rem;
  color: #d9534f;
  margin: 0 0 1rem;
  line-height: 1.5;
}

.btn-submit {
  width: 100%;
  margin-top: 0.5rem;
  font-family: "Press Start 2P", cursive;
  font-size: 0.65rem;
  padding: 14px 24px;
  background-color: #f5a623;
  color: #1a1a2e;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-submit:hover:not(:disabled) {
  background-color: #d48821;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-success {
  text-align: center;
}

.auth-success p:first-child {
  font-size: 0.7rem;
  color: #f5a623;
  margin: 0 0 1rem;
}

.auth-success p:first-child i {
  margin-right: 8px;
}

.auth-success-text {
  font-size: 0.55rem;
  color: #b8b9b5;
  line-height: 1.7;
  margin: 0 0 1.25rem;
}

.auth-success-note {
  font-size: 0.5rem;
  color: #8a8b87;
  line-height: 1.6;
  margin: 0 0 1.25rem;
}

.auth-success .link-button {
  font-family: "Press Start 2P", cursive;
  font-size: 0.55rem;
  color: #f5a623;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 4px;
}

.auth-success .link-button:hover {
  color: #d48821;
  text-decoration: underline;
}
</style>
