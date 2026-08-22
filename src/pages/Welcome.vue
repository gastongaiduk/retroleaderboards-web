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
        <img src="/logo.svg" alt="Retro Leaderboards" class="hero-logo" />
        <h1 class="hero-title">Retro Leaderboards</h1>
        <p class="hero-subtitle">
          The competitive companion for RetroAchievements.<br />
          Track your rank, challenge your friends, and never let a rival beat
          you quietly.
        </p>
      </header>

      <section class="features">
        <div class="feature feature-highlight">
          <span class="feature-icon highlight"
            ><i class="fa fa-trophy"></i
          ></span>
          <h3>Rivalry Dashboard</h3>
          <p>
            See exactly who's beating you — and where. Expand any friend to get
            a full breakdown of wins and losses across every leaderboard.
          </p>
        </div>
        <div class="feature">
          <span class="feature-icon"><i class="fa fa-bar-chart"></i></span>
          <h3>Leaderboard comparison</h3>
          <p>
            Your scores side by side with your friends' — highlighted so you
            instantly know where you stand.
          </p>
        </div>
        <div class="feature">
          <span class="feature-icon"><i class="fa fa-bell"></i></span>
          <h3>Score alerts</h3>
          <p>
            Follow the games you care about. Get notified the moment a friend
            surpasses your score.
          </p>
        </div>
        <div class="feature">
          <span class="feature-icon"><i class="fa fa-gamepad"></i></span>
          <h3>Powered by RA</h3>
          <p>
            Companion for
            <a
              href="https://retroachievements.org"
              target="_blank"
              rel="noopener"
              >RetroAchievements</a
            >. Connect with your username and API key — stored encrypted.
          </p>
        </div>
      </section>

      <section class="cta">
        <p class="cta-text">Ready to compete?</p>
        <div class="cta-buttons">
          <button
            type="button"
            class="btn btn-primary"
            @click="router.push('/sign-up')"
          >
            Create account
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            @click="router.push('/login')"
          >
            Log in
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
        <p>
          <router-link to="/privacy">Privacy Policy</router-link>
        </p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.welcome-page {
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

.welcome-content {
  max-width: 640px;
  width: 100%;
  margin: auto;
}

.hero {
  text-align: center;
  margin-bottom: 2rem;
}

.hero-logo {
  width: 72px;
  height: 72px;
  border-radius: 0;
  object-fit: cover;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 20px rgba(203, 163, 78, 0.15));
}

.hero-title {
  font-size: clamp(1.5rem, 5vw, 2rem);
  font-weight: 700;
  color: var(--accent-primary);
  margin: 0 0 1rem;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0 auto;
  max-width: 420px;
}

.features {
  display: grid;
  gap: var(--space-3);
  margin-bottom: 2rem;
}

.feature {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  text-align: center;
  transition: border-color 0.2s ease;
}

.feature:hover {
  border-color: var(--border-strong);
}

.feature-highlight {
  border-color: var(--border-accent);
  background-color: var(--bg-surface);
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgba(233, 69, 96, 0.1);
  color: var(--accent-primary);
  border-radius: var(--radius-md);
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.feature-icon.highlight {
  background-color: rgba(233, 69, 96, 0.18);
  box-shadow: 0 0 12px rgba(233, 69, 96, 0.12);
}

.feature h3 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
}

.feature p {
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0;
}

.feature a {
  color: var(--accent-primary);
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
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 1rem;
}

.cta-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.btn {
  font-size: 13px;
  font-weight: 600;
  padding: 12px 28px;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.01em;
}

.btn:active {
  transform: scale(0.98);
}

.btn-primary {
  background-color: var(--accent-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--accent-primary-hover);
}

.btn-secondary {
  background-color: transparent;
  color: var(--accent-primary);
  border: 1.5px solid var(--accent-primary);
}

.btn-secondary:hover {
  background-color: rgba(233, 69, 96, 0.1);
}

.footer {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-default);
}

.footer p {
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-muted);
  margin: 0;
}

.footer a {
  color: var(--accent-primary);
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}

@media (min-width: 600px) {
  .features {
    grid-template-columns: repeat(2, 1fr);
  }

  .feature-highlight {
    grid-column: 1 / -1;
  }

  .feature {
    padding: 1.5rem;
  }
}
</style>
