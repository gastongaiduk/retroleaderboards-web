<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../utils/supabaseClient.ts";
import { useUserStore } from "../stores/user.ts";

const router = useRouter();
const user = useUserStore();

const emailInput = ref("");
const passInput = ref("");
const passConfirmInput = ref("");
const loading = ref(false);

async function handleSubmit() {
  loading.value = true;
  if (passInput.value !== passConfirmInput.value) {
    alert("Passwords do not match");
    loading.value = false;
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email: emailInput.value,
    password: passInput.value,
    options: {
      emailRedirectTo: import.meta.env.VITE_APP_URL + "/#/auth-callback",
    },
  });

  if (error) {
    console.log(error);
    alert("Error, please try again later");
    loading.value = false;
    return;
  }

  if (data.user?.confirmation_sent_at) {
    alert("Confirmation email sent, login after confirming your registration");
  }

  await router.push("/login");
}

onMounted(() => {
  if (user.isLoggedIn()) {
    router.push("/");
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
        <h1 class="auth-title">Sign up</h1>
        <p class="auth-subtitle">Create your account and start competing</p>
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
            autocomplete="new-password"
            minlength="6"
          />
        </div>
        <div class="form-group">
          <label for="pass-confirm" class="form-label">Confirm password</label>
          <input
            type="password"
            id="pass-confirm"
            v-model="passConfirmInput"
            class="form-input"
            required
            autocomplete="new-password"
            minlength="6"
          />
        </div>
        <button type="submit" class="btn btn-submit" :disabled="loading">
          <i v-if="loading" class="fa fa-spinner fa-spin"></i>
          <span v-else>Sign up</span>
        </button>
      </form>

      <p class="auth-footer">
        Already have an account?
        <button type="button" class="link-button" @click="router.push('/login')">
          Log in
        </button>
      </p>
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

.auth-footer {
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(148, 163, 184, 0.08);
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
