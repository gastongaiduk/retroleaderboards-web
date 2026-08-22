<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref, watch } from "vue";
import { useUpdatesStore } from "../stores/updates.ts";
import ConfirmModal from "./ConfirmModal.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits(["update:modelValue"]);

const router = useRouter();
const route = useRoute();
const updateStore = useUpdatesStore();

const isLogoutModalVisible = ref(false);

const goTo = (path: string) => {
  emit("update:modelValue", false);
  router.push(path);
};

const showLogoutModal = () => {
  isLogoutModalVisible.value = true;
};

const hideLogoutModal = () => {
  isLogoutModalVisible.value = false;
};

const confirmLogout = () => {
  isLogoutModalVisible.value = false;
  emit("update:modelValue", false);
  router.push("/logout");
};

watch(
  () => route.path,
  () => {
    emit("update:modelValue", false);
  },
);
</script>

<template>
  <!-- Overlay -->
  <div
    v-if="modelValue"
    class="menu-overlay"
    @click="emit('update:modelValue', false)"
  ></div>

  <!-- Slide-in Menu -->
  <transition name="slide">
    <div v-if="modelValue" class="menu-panel">
      <div class="menu-header">
        <h2 class="menu-title">Menu</h2>
        <button class="close-button" @click="emit('update:modelValue', false)">
          <i class="fa fa-times"></i>
        </button>
      </div>

      <nav class="menu-nav">
        <button
          class="menu-item"
          :class="{ active: route.path === '/home' }"
          @click="goTo('/home')"
        >
          <i class="fa fa-home menu-item-icon"></i>
          Home
        </button>
        <button
          class="menu-item"
          :class="{ active: route.path === '/my-subscriptions' }"
          @click="goTo('/my-subscriptions')"
        >
          <i class="fa fa-gamepad menu-item-icon"></i>
          Games
        </button>
        <button
          class="menu-item"
          :class="{ active: route.path === '/leaderboards-updates' }"
          @click="goTo('/leaderboards-updates')"
        >
          <i class="fa fa-bell menu-item-icon"></i>
          Updates
          <span v-if="updateStore.updatesNumber > 0" class="badge">
            {{ updateStore.updatesNumber }}
          </span>
        </button>
        <button
          class="menu-item"
          :class="{ active: route.path === '/settings' }"
          @click="goTo('/settings')"
        >
          <i class="fa fa-gear menu-item-icon"></i>
          Settings
        </button>
      </nav>

      <div class="menu-footer">
        <button class="menu-item logout-item" @click="showLogoutModal">
          <i class="fa fa-sign-out menu-item-icon"></i>
          Logout
        </button>
      </div>

      <ConfirmModal
        :isVisible="isLogoutModalVisible"
        title="Logout"
        text="Are you sure you want to logout?"
        @confirm="confirmLogout"
        @nope="hideLogoutModal"
      />
    </div>
  </transition>
</template>

<style scoped>
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--bg-overlay);
  z-index: 998;
}

.menu-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  max-width: 80vw;
  height: 100%;
  background: var(--bg-surface);
  border-left: 1px solid var(--border-default);
  box-shadow: var(--shadow-lg);
  z-index: 999;
  display: flex;
  flex-direction: column;
  padding: var(--space-5);
  box-sizing: border-box;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.menu-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--accent-primary);
  margin: 0;
}

.close-button {
  background: var(--bg-body);
  color: var(--text-secondary);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--text-base);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
}

.close-button:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.menu-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--text-base);
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  width: 100%;
  text-align: left;
  transition: all var(--transition-fast);
}

.menu-item:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.menu-item.active {
  background: rgba(233, 69, 96, 0.1);
  color: var(--accent-primary);
}

.menu-item-icon {
  width: 18px;
  text-align: center;
  font-size: var(--text-base);
}

.badge {
  background-color: var(--accent-red);
  color: white;
  border-radius: var(--radius-md);
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 600;
  margin-left: auto;
}

.menu-footer {
  border-top: 1px solid var(--border-default);
  padding-top: var(--space-3);
}

.logout-item {
  color: var(--accent-red);
}

.logout-item:hover {
  background: var(--accent-red-bg);
}

/* slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
