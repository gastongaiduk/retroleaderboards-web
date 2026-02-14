<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useUpdatesStore } from "../stores/updates.ts";

const router = useRouter();
const route = useRoute();
const updateStore = useUpdatesStore();

const isActive = (path: string) => route.path === path;

const goTo = (path: string) => {
  router.push(path);
};
</script>

<template>
  <nav class="bottom-nav">
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
      :class="{ active: isActive('/my-subscriptions') }"
      @click="goTo('/my-subscriptions')"
    >
      <i class="fa fa-gamepad nav-icon"></i>
      <span class="nav-label">Games</span>
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
</template>

<style scoped>
.bottom-nav {
  flex-shrink: 0;
  width: 100%;
  height: 56px;
  min-height: 56px;
  background-color: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid rgba(203, 163, 78, 0.12);
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.3);
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: content-box;
}

.nav-item {
  -webkit-tap-highlight-color: transparent;
  background: none;
  border: none;
  color: rgba(148, 163, 184, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  cursor: pointer;
  padding: 6px 0;
  transition: color 0.2s ease;
  gap: 3px;
}

.nav-item.active {
  color: #cba34e;
}

.nav-icon {
  font-size: 18px;
  line-height: 1;
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1;
  white-space: nowrap;
}

.icon-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.badge {
  position: absolute;
  top: -5px;
  right: -9px;
  background-color: #ef4444;
  color: white;
  border-radius: 8px;
  padding: 1px 4px;
  font-size: 9px;
  font-weight: 600;
  min-width: 14px;
  text-align: center;
  border: 1.5px solid #0f172a;
  line-height: 1.2;
}

@media (hover: hover) {
  .nav-item:hover {
    color: #d4b565;
  }
}
</style>
