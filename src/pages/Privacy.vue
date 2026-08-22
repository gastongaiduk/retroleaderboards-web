<script setup lang="ts">
import BackButton from "../components/BackButton.vue";
</script>

<template>
  <div class="privacy-page">
    <div class="privacy-content">
      <BackButton to="/welcome" />

      <h1 class="privacy-title">Privacy Policy</h1>

      <section class="privacy-section">
        <h2 class="section-title">What we collect</h2>
        <p class="section-text">
          To understand how the app is used and to fix problems, we collect:
        </p>
        <ul class="section-list">
          <li>
            Usage analytics: which pages are visited and general interaction
            data.
          </li>
          <li>
            Error reports: technical details when something fails in the app.
          </li>
          <li>
            Session replays: recordings of browsing sessions used to reproduce
            issues. All text entered in input fields is masked and never
            recorded.
          </li>
        </ul>
        <p class="section-text">
          If you have an account, these events may be associated with your
          internal user identifier. We never collect or record your
          RetroAchievements API key, password, or any credentials.
        </p>
      </section>

      <section class="privacy-section">
        <h2 class="section-title">How it is processed</h2>
        <p class="section-text">
          Analytics, error tracking, and session replays are handled by
          <a href="https://posthog.com" target="_blank" rel="noopener"
            >PostHog</a
          >
          on PostHog Cloud. PostHog does not use cookies and does not sell or
          share your data with third parties. We do not use any data for
          advertising.
        </p>
      </section>

      <section class="privacy-section">
        <h2 class="section-title">Your data</h2>
        <p class="section-text">
          Your RetroAchievements API key is stored encrypted in our database (<a
            href="https://supabase.com"
            target="_blank"
            rel="noopener"
            >Supabase</a
          >) so you don't have to re-enter it every time you log in. An
          encrypted copy is also cached in your browser's local storage for the
          same reason.
        </p>
        <p class="section-text">
          Your API key is only used to fetch your RetroAchievements data and is
          never shared with third parties. Logging out deletes all locally
          stored data. Server-side data deletion is coming soon.
        </p>
        <p class="section-text">
          Questions or requests about your data?
          <a
            href="https://github.com/gastongaiduk/retroleaderboards-web"
            target="_blank"
            rel="noopener"
            >Open an issue on GitHub</a
          >.
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.privacy-page {
  min-height: 100vh;
  min-height: 100dvh;
  background-color: var(--bg-body);
  color: var(--text-primary);
  display: flex;
  padding: var(--space-6) var(--space-4);
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.privacy-content {
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
}

.privacy-title {
  font-size: clamp(1.5rem, 5vw, 2rem);
  font-weight: 700;
  color: var(--accent-primary);
  margin: 1.5rem 0;
  letter-spacing: -0.02em;
}

.privacy-section {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  margin-bottom: var(--space-3);
}

.section-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
}

.section-text {
  font-size: var(--text-sm);
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0 0 0.75rem;
}

.section-text:last-child {
  margin-bottom: 0;
}

.section-list {
  font-size: var(--text-sm);
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0 0 0.75rem;
  padding-left: 1.25rem;
}

.privacy-content a {
  color: var(--accent-primary);
  text-decoration: none;
}

.privacy-content a:hover {
  text-decoration: underline;
}
</style>
