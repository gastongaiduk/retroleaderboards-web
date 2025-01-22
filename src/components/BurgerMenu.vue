<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../stores/user.ts";
import ConfirmModal from "./ConfirmModal.vue";

const router = useRouter();
const user = useUserStore();

const isMenuVisible = ref(false);
const isLogoutModalVisible = ref(false);

const toggleMenu = (): void => {
  isMenuVisible.value = !isMenuVisible.value;
};

const navigate = (route: string): void => {
  router.push(route);
};

function showLogoutModal() {
  isLogoutModalVisible.value = true;
}

function hideLogoutModal() {
  isLogoutModalVisible.value = false;
}

const route = useRoute();
const currentRouteName = computed(() => route.name);

const props = defineProps<{
  updatesNumber: number;
}>();
</script>

<template>
  <div class="burger-menu">
    <button class="menu-toggle" @click="toggleMenu">
      <i class="fa fa-bars"></i>
      <i
        v-if="props.updatesNumber > 0"
        class="fa fa-asterisk"
        style="font-size: 50%; padding-left: 10px; vertical-align: middle"
      ></i>
    </button>

    <div v-if="isMenuVisible" class="modal-overlay" @click.self="toggleMenu">
      <div class="modal-fullscreen retro-container">
        <button class="close-menu" @click="toggleMenu">
          <i class="fa fa-times"></i>
        </button>
        <ul class="menu-list">
          <li v-if="user.isSet()" class="menu-item">
            <button
              class="menu-button"
              @click="navigate('/')"
              :disabled="currentRouteName == 'Home'"
            >
              <i class="fa fa-home"></i> Home
            </button>
          </li>
          <li v-if="user.isSet()" class="menu-item">
            <button
              class="menu-button"
              @click="navigate('/leaderboards-updates')"
              :disabled="currentRouteName == 'LeaderboardsUpdates'"
            >
              <i class="fa fa-gamepad"></i>
              Leaderboards updates
              <span v-if="props.updatesNumber > 0">
                ({{ props.updatesNumber }})
              </span>
            </button>
          </li>
          <li class="menu-item">
            <button
              class="menu-button"
              @click="navigate('/ra-credentials')"
              :disabled="currentRouteName == 'RACredentials'"
            >
              <i class="fa fa-gear"></i> RetroAchievements credentials
            </button>
          </li>
          <li class="menu-item">
            <button class="logout-button" @click="showLogoutModal">
              <i class="fa fa-sign-out"></i> Logout
            </button>
          </li>
        </ul>
      </div>
    </div>

    <ConfirmModal
      :isVisible="isLogoutModalVisible"
      title="Logout"
      text="Are you sure you want to logout?"
      @confirm="router.push('/logout')"
      @nope="hideLogoutModal"
    />
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

.burger-menu {
  position: relative;
  display: contents;
}

.menu-toggle {
  background-color: #f5a623;
  color: #1a1a2e;
  border: none;
  padding: 12px;
  cursor: pointer;
  font-size: 20px;
  border-radius: 10px;
  transition: background-color 0.3s ease;
}

.menu-toggle:hover {
  background-color: #d48821;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 1000;
}

.modal-fullscreen {
  position: absolute;
  top: 0;
  left: 0;
  width: calc(100% - 40px);
  height: calc(100% - 40px);

  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #1a1a2e;
  color: #e0e1dd;
  padding: 20px;
  border-radius: 15px;
  overflow: auto;
}

.close-menu {
  position: absolute;
  top: 15px;
  right: 15px;
  background-color: #f5a623;
  color: #1a1a2e;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 10px;
  font-size: 20px;
  transition: background-color 0.3s ease;
}

.close-menu:hover {
  background-color: #d48821;
}

.menu-list {
  list-style-type: none;
  padding-left: 0;
}

.menu-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.menu-item {
  width: 100%;
  max-width: 300px;
}

.menu-item i {
  padding-right: 10px;
}

.menu-button,
.logout-button {
  width: 100%;
  background-color: #f5a623;
  color: #1a1a2e;
  border: none;
  padding: 15px;
  cursor: pointer;
  font-size: 18px;
  border-radius: 10px;
  transition: background-color 0.3s ease;
}

.menu-button:hover,
.logout-button:hover {
  background-color: #d48821;
}

.menu-button:disabled {
  background-color: #e0e1dd;
  color: #1a1a2e;
  cursor: not-allowed;
}
</style>
