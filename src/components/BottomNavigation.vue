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
@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

.bottom-nav {
  flex-shrink: 0;
  width: 100%;
  height: 64px;
  min-height: 64px;
  background-color: #16162a;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 2px solid rgba(245, 166, 35, 0.3);
  box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.6);
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: content-box;
}

.nav-item {
  -webkit-tap-highlight-color: transparent;
  background: none;
  border: none;
  color: rgba(224, 225, 221, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  cursor: pointer;
  padding: 8px 0;
  transition: color 0.2s ease;
  gap: 4px;
}

.nav-item.active {
  color: #f5a623;
}

.nav-icon {
  font-size: 22px;
  line-height: 1;
}

.nav-label {
  font-size: 8px;
  font-family: "Press Start 2P", cursive;
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
  top: -6px;
  right: -10px;
  background-color: #ff3b30;
  color: white;
  border-radius: 10px;
  padding: 1px 5px;
  font-size: 9px;
  min-width: 14px;
  text-align: center;
  font-weight: bold;
  border: 2px solid #16162a;
  font-family: "Press Start 2P", cursive;
  line-height: 1.2;
}

@media (hover: hover) {
  .nav-item:hover {
    color: #ffd700;
  }
}
</style>
