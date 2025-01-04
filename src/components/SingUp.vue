<script setup lang="ts">
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {supabase} from "../utils/supabaseClient.ts";
import {useUserStore} from '../stores/user'

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

  const {data, error} = await supabase.auth.signUp({
    email: emailInput.value,
    password: passInput.value,
    options: {
      emailRedirectTo: import.meta.env.VITE_APP_URL + '/#/auth-callback'
    }
  })

  if (error) {
    console.log(error);
    alert("Error, please try again later")
    loading.value = false;
    return;
  }

  if (data.user?.confirmation_sent_at) {
    alert("Confirmation email sent, login after confirming your registration")
  }

  await router.push("/login");
}

onMounted(() => {
  if (user.isLoggedIn()) {
    router.push("/")
  }
});
</script>
<template>
  <div class="retro-container">
    <h1 class="retro-title">Sign-up</h1>
    <form @submit.prevent="handleSubmit" class="user-form">
      <div class="form-group">
        <label for="email" class="form-label">Email:</label>
        <input type="text" id="email" v-model="emailInput" class="form-input" required>
      </div>
      <div class="form-group">
        <label for="pass" class="form-label">Password:</label>
        <input type="password" id="pass" v-model="passInput" class="form-input" required>
      </div>
      <div class="form-group">
        <label for="pass-confirm" class="form-label">Confirm password:</label>
        <input type="password" id="pass-confirm" v-model="passConfirmInput" class="form-input" required>
      </div>
      <div class="actions">
        <span class="clickable link">
          <a @click="router.push('login')">Or login <i class="fa fa-arrow-right"></i></a>
        </span>
        <button type="submit" class="form-button" :disabled="loading">
          <i v-if="loading" class="fa fa-spinner fa-spin"></i>
          <span v-else>Submit</span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.retro-container {
  background-color: #1a1a2e;
  color: #e0e1dd;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.5);
  font-family: 'Press Start 2P', cursive;
}

.retro-title {
  font-size: 24px;
  color: #f5a623;
  text-align: center;
}

.user-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-label {
  display: flex;
  align-items: center;
}

.form-input {
  width: calc(100% - 20px);
  padding: 10px;
  border-radius: 5px;
  border: none;
}

.form-button {
  background-color: #f5a623;
  color: #1a1a2e;
  border: none;
  padding: 10px;
  cursor: pointer;
  font-size: 16px;
  border-radius: 10px;
  float: right;
}

.form-button:hover {
  background-color: #d48821;
}

.clickable {
  cursor: pointer;
}

.link {
  float: left;
}

.actions {
  min-height: 2.5rem;
}

@media (min-width: 768px) {
  .retro-container {
    width: calc(100% - 40px);
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
