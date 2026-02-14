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
  background: rgba(2, 6, 23, 0.7);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 998;
}

.menu-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  max-width: 80vw;
  height: 100%;
  background: #1e293b;
  border-left: 1px solid rgba(203, 163, 78, 0.1);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.4);
  z-index: 999;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.menu-title {
  font-size: 16px;
  font-weight: 600;
  color: #cba34e;
  margin: 0;
}

.close-button {
  background: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
}

.menu-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: none;
  border-radius: 8px;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  width: 100%;
  text-align: left;
  transition: all 0.15s ease;
}

.menu-item:hover {
  background: rgba(148, 163, 184, 0.08);
  color: #e2e8f0;
}

.menu-item.active {
  background: rgba(203, 163, 78, 0.1);
  color: #cba34e;
}

.menu-item-icon {
  width: 18px;
  text-align: center;
  font-size: 14px;
}

.badge {
  background-color: #ef4444;
  color: white;
  border-radius: 8px;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 600;
  margin-left: auto;
}

.menu-footer {
  border-top: 1px solid rgba(148, 163, 184, 0.08);
  padding-top: 12px;
}

.logout-item {
  color: #f87171;
}

.logout-item:hover {
  background: rgba(239, 68, 68, 0.08);
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
