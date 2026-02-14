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
  if (data.session && data.user) {
    user.login(data.user.id, data.session.access_token);
  }
  await router.push("/");
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

      <form @submit.prevent="handleSubmit" class="auth-form">
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
</style>
