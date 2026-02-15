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
        <img src="/logo.png" alt="Retro Leaderboards" class="hero-logo" />
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
            See exactly who's beating you — and where. Expand any friend to
            get a full breakdown of wins and losses across every leaderboard.
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
      </footer>
    </div>
  </div>
</template>

<style scoped>
.welcome-page {
  height: 100vh;
  height: 100dvh;
  background-color: #0f172a;
  background-image:
    radial-gradient(
      ellipse 80% 50% at 50% -20%,
      rgba(203, 163, 78, 0.06),
      transparent
    ),
    radial-gradient(
      ellipse 60% 40% at 80% 100%,
      rgba(203, 163, 78, 0.04),
      transparent
    );
  color: #e2e8f0;
  display: flex;
  padding: 24px 16px;
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
  color: #cba34e;
  margin: 0 0 1rem;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 14px;
  line-height: 1.7;
  color: #94a3b8;
  margin: 0 auto;
  max-width: 420px;
}

.features {
  display: grid;
  gap: 12px;
  margin-bottom: 2rem;
}

.feature {
  background-color: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(203, 163, 78, 0.1);
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  transition: border-color 0.2s ease;
}

.feature:hover {
  border-color: rgba(203, 163, 78, 0.2);
}

.feature-highlight {
  border-color: rgba(203, 163, 78, 0.25);
  background-image: linear-gradient(
    135deg,
    rgba(203, 163, 78, 0.06) 0%,
    rgba(30, 41, 59, 0.6) 60%
  );
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgba(203, 163, 78, 0.1);
  color: #cba34e;
  border-radius: 10px;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.feature-icon.highlight {
  background-color: rgba(203, 163, 78, 0.18);
  box-shadow: 0 0 12px rgba(203, 163, 78, 0.12);
}

.feature h3 {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0 0 0.5rem;
}

.feature p {
  font-size: 12px;
  line-height: 1.7;
  color: #94a3b8;
  margin: 0;
}

.feature a {
  color: #cba34e;
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
  color: #e2e8f0;
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
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.01em;
}

.btn:active {
  transform: scale(0.98);
}

.btn-primary {
  background-color: #cba34e;
  color: #0f172a;
}

.btn-primary:hover {
  background-color: #b8923f;
}

.btn-secondary {
  background-color: transparent;
  color: #cba34e;
  border: 1.5px solid rgba(203, 163, 78, 0.4);
}

.btn-secondary:hover {
  background-color: rgba(203, 163, 78, 0.1);
}

.footer {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(203, 163, 78, 0.08);
}

.footer p {
  font-size: 12px;
  line-height: 1.7;
  color: #64748b;
  margin: 0;
}

.footer a {
  color: #cba34e;
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
