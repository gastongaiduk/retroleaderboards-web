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
  padding: 16px;
  color: #e2e8f0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.page-title {
  font-size: 17px;
  font-weight: 600;
  color: #cba34e;
  margin-bottom: 24px;
  text-align: center;
  letter-spacing: -0.01em;
}

.settings-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-item {
  background-color: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
}

.menu-item:hover {
  background-color: rgba(30, 41, 59, 0.9);
  border-color: rgba(148, 163, 184, 0.15);
}

.item-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-icon {
  width: 18px;
  text-align: center;
  color: #cba34e;
  font-size: 14px;
}

.item-arrow {
  color: #475569;
  font-size: 12px;
}

.logout {
  margin-top: 12px;
  border-color: rgba(239, 68, 68, 0.2);
}

.logout .item-icon {
  color: #ef4444;
}

.logout:hover {
  background-color: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.3);
}
</style>
