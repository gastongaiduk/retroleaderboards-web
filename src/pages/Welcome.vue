<script lang="ts" setup>
import { useRouter } from "vue-router";
import { onMounted } from "vue";
import { useUserStore } from "../stores/user.ts";

const router = useRouter();
const user = useUserStore();

onMounted(async () => {
  if (user.isLoggedIn()) {
    await router.push("/home");
  }
});
</script>

<template>
  <div class="welcome-page">
    <div class="welcome-content">
      <header class="hero">
        <h1 class="hero-title">Retro Leaderboards</h1>
        <p class="hero-subtitle">
          Compare your RetroAchievements scores with friends. Get notified when
          someone beats you.
        </p>
      </header>

      <section class="features">
        <div class="feature">
          <span class="feature-icon"><i class="fa fa-trophy"></i></span>
          <h3>Compare leaderboards</h3>
          <p>See your scores next to your friends’ on every game you play.</p>
        </div>
        <div class="feature">
          <span class="feature-icon"><i class="fa fa-bell"></i></span>
          <h3>Game subscriptions</h3>
          <p>Subscribe to games and get updates when a friend surpasses your score.</p>
        </div>
        <div class="feature">
          <span class="feature-icon"><i class="fa fa-gamepad"></i></span>
          <h3>Powered by RA</h3>
          <p>
            Companion for
            <a href="https://retroachievements.org" target="_blank" rel="noopener"
              >RetroAchievements</a
            >. Connect with your username and API key—stored encrypted.
          </p>
        </div>
      </section>

      <section class="cta">
        <p class="cta-text">Ready to compete?</p>
        <div class="cta-buttons">
          <button type="button" class="btn btn-primary" @click="router.push('/login')">
            Log in
          </button>
          <button type="button" class="btn btn-secondary" @click="router.push('/sign-up')">
            Sign up
          </button>
        </div>
      </section>

      <footer class="footer">
        <p>
          A hobby project. Found a bug or have an idea?
          <a
            href="https://github.com/gastongaiduk/retroleaderboards-web"
            target="_blank"
            rel="noopener"
            >Open an issue on GitHub</a
          >.
        </p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

.welcome-page {
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

.welcome-content {
  max-width: 720px;
  width: 100%;
}

.hero {
  text-align: center;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: clamp(1.25rem, 4vw, 1.75rem);
  color: #f5a623;
  margin: 0 0 1.5rem;
  line-height: 1.5;
  text-shadow: 0 0 20px rgba(245, 166, 35, 0.2);
}

.hero-subtitle {
  font-size: 0.65rem;
  line-height: 1.8;
  color: #b8b9b5;
  margin: 0;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

.features {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.feature {
  background-color: rgba(34, 34, 59, 0.6);
  border: 1px solid rgba(245, 166, 35, 0.2);
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: rgba(245, 166, 35, 0.15);
  color: #f5a623;
  border-radius: 10px;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.feature h3 {
  font-size: 0.65rem;
  color: #f5a623;
  margin: 0 0 0.75rem;
}

.feature p {
  font-size: 0.6rem;
  line-height: 1.7;
  color: #e0e1dd;
  margin: 0;
}

.feature a {
  color: #d48821;
  text-decoration: none;
}

.feature a:hover {
  text-decoration: underline;
}

.cta {
  text-align: center;
  margin-bottom: 2rem;
}

.cta-text {
  font-size: 0.7rem;
  color: #e0e1dd;
  margin: 0 0 1.25rem;
}

.cta-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.btn {
  font-family: "Press Start 2P", cursive;
  font-size: 0.65rem;
  padding: 14px 24px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.btn:active {
  transform: scale(0.98);
}

.btn-primary {
  background-color: #f5a623;
  color: #1a1a2e;
}

.btn-primary:hover {
  background-color: #d48821;
}

.btn-secondary {
  background-color: transparent;
  color: #f5a623;
  border: 2px solid #f5a623;
}

.btn-secondary:hover {
  background-color: rgba(245, 166, 35, 0.15);
}

.footer {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(245, 166, 35, 0.15);
}

.footer p {
  font-size: 0.55rem;
  line-height: 1.8;
  color: #8a8b87;
  margin: 0;
}

.footer a {
  color: #d48821;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}

@media (min-width: 600px) {
  .features {
    grid-template-columns: repeat(3, 1fr);
  }

  .feature {
    padding: 1.5rem;
  }
}
</style>
