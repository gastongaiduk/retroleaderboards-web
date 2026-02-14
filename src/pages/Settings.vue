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
  <div class="retro-container">
    <h1 class="retro-title">Settings</h1>
    
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
@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

.retro-container {
  padding: 16px;
  color: #e0e1dd;
  font-family: "Press Start 2P", cursive;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.retro-title {
  font-size: 20px;
  color: #f5a623;
  margin-bottom: 30px;
  text-align: center;
}

.settings-menu {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.menu-item {
  background-color: #2a2a40;
  border: 1px solid #3a3a50;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #e0e1dd;
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  text-align: left;
}

.menu-item:hover {
  background-color: #353550;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.item-icon {
  width: 20px;
  text-align: center;
  color: #f5a623;
}

.item-arrow {
  color: #666;
}

.logout {
  margin-top: 20px;
  border-color: #ff3b30;
}

.logout .item-icon {
  color: #ff3b30;
}

.logout:hover {
  background-color: rgba(255, 59, 48, 0.1);
}
</style>
