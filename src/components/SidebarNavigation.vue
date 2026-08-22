<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useUpdatesStore } from "../stores/updates.ts";
import { useRecentGamesStore } from "../stores/recentGames.ts";
import { useUserStore } from "../stores/user.ts";

const router = useRouter();
const route = useRoute();
const updateStore = useUpdatesStore();
const recentGamesStore = useRecentGamesStore();
const user = useUserStore();

const isActive = (path: string) => route.path === path;

const goTo = (path: string) => {
  if (route.path === path && path === "/home") {
    recentGamesStore.useScrollToTop();
    return;
  }
  router.push(path);
};
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <img src="/logo.svg" alt="Retro Leaderboards" class="sidebar-logo" />
      <span class="sidebar-brand">Retro Leaderboards</span>
    </div>

    <nav class="sidebar-nav">
      <button
        class="nav-item"
        :class="{ active: isActive('/home') }"
        @click="goTo('/home')"
      >
        <i class="fa fa-home nav-icon"></i>
        <span class="nav-label">Home</span>
      </button>
      <button
        class="nav-item"
        :class="{ active: isActive('/friends') }"
        @click="goTo('/friends')"
      >
        <i class="fa fa-users nav-icon"></i>
        <span class="nav-label">Friends</span>
      </button>
      <button
        class="nav-item"
        :class="{ active: isActive('/rivals') }"
        @click="goTo('/rivals')"
      >
        <i class="fa fa-trophy nav-icon"></i>
        <span class="nav-label">Rivals</span>
      </button>
      <button
        class="nav-item"
        :class="{ active: isActive('/leaderboards-updates') }"
        @click="goTo('/leaderboards-updates')"
      >
        <div class="icon-container">
          <i class="fa fa-bell nav-icon"></i>
          <span v-if="updateStore.updatesNumber > 0" class="badge">
            {{ updateStore.updatesNumber }}
          </span>
        </div>
        <span class="nav-label">Updates</span>
      </button>
      <button
        class="nav-item"
        :class="{ active: isActive('/settings') }"
        @click="goTo('/settings')"
      >
        <i class="fa fa-gear nav-icon"></i>
        <span class="nav-label">Settings</span>
      </button>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info">
        <span class="username">{{ user.username }}</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100%;
  background-color: var(--bg-surface);
  border-right: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-default);
}

.sidebar-logo {
  width: 32px;
  height: 32px;
}

.sidebar-brand {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--accent-gold);
}

.sidebar-nav {
  flex: 1;
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  width: 100%;
  text-align: left;
}

.nav-item:hover {
  background-color: var(--bg-surface-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background-color: var(--bg-surface-active);
  color: var(--accent-primary);
  border-left: 3px solid var(--accent-primary);
  padding-left: calc(var(--space-4) - 3px);
}

.nav-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.nav-label {
  flex: 1;
}

.icon-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.badge {
  position: absolute;
  top: -6px;
  right: -10px;
  background-color: var(--accent-primary);
  color: white;
  border-radius: var(--radius-sm);
  padding: 1px 5px;
  font-size: 10px;
  font-weight: 600;
  min-width: 16px;
  text-align: center;
}

.sidebar-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--border-default);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.username {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
}
</style>
