<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import ConfirmModal from "../components/ConfirmModal.vue";

const router = useRouter();
const isLogoutModalVisible = ref(false);

const goToCredentials = () => {
  router.push("/ra-credentials");
};

const showLogoutModal = () => {
  isLogoutModalVisible.value = true;
};

const hideLogoutModal = () => {
  isLogoutModalVisible.value = false;
};

const logout = () => {
  router.push("/logout");
};
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">Settings</h1>

    <div class="settings-menu">
      <button class="menu-item" @click="goToCredentials">
        <div class="item-content">
          <i class="fa fa-gear item-icon"></i>
          <span>RetroAchievements Credentials</span>
        </div>
        <i class="fa fa-chevron-right item-arrow"></i>
      </button>

      <button class="menu-item logout" @click="showLogoutModal">
        <div class="item-content">
          <i class="fa fa-sign-out item-icon"></i>
          <span>Logout</span>
        </div>
      </button>
    </div>

    <!-- Confirm Logout Modal -->
    <ConfirmModal
      :isVisible="isLogoutModalVisible"
      title="Logout"
      text="Are you sure you want to logout?"
      @confirm="logout"
      @nope="hideLogoutModal"
    />
  </div>
</template>

<style scoped>
.page-container {
  padding: var(--space-4);
  color: var(--text-primary);
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.page-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--accent-primary);
  margin-bottom: var(--space-6);
  text-align: center;
  letter-spacing: -0.01em;
}

.settings-menu {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.menu-item {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-primary);
  font-size: var(--text-base);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  width: 100%;
  text-align: left;
}

.menu-item:hover {
  background-color: var(--bg-surface-hover);
  border-color: var(--border-strong);
}

.item-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.item-icon {
  width: 18px;
  text-align: center;
  color: var(--accent-primary);
  font-size: var(--text-lg);
}

.item-arrow {
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.logout {
  margin-top: var(--space-3);
  border-color: var(--accent-red-bg);
}

.logout .item-icon {
  color: var(--accent-red);
}

.logout:hover {
  background-color: var(--accent-red-bg);
  border-color: var(--accent-red);
}

@media (min-width: 768px) {
  .page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-6);
  }
  .page-title {
    font-size: var(--text-2xl);
  }
  .settings-menu {
    max-width: 480px;
    margin: 0 auto;
  }
}
</style>
