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
  <div class="header-actions">
    <button
      v-if="user.isSet()"
      class="home-button"
      @click="navigate('/home')"
      :disabled="currentRouteName == 'Home'"
      title="Back to Home"
    >
      <i class="fa fa-home"></i>
    </button>
    <div class="burger-menu">
      <button class="menu-toggle" @click="toggleMenu">
        <i class="fa fa-bars"></i>
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="isMenuVisible"
        class="modal-overlay burger-menu-overlay"
        style="position: fixed; inset: 0; z-index: 2147483647; background-color: rgba(0, 0, 0, 0.8);"
        @click="toggleMenu"
      >
        <div class="modal-fullscreen retro-container">
          <ul class="menu-list">
            <li v-if="user.isSet()" class="menu-item">
              <button
                class="menu-button"
                @click="navigate('/my-subscriptions')"
                :disabled="currentRouteName == 'MySubscriptions'"
              >
                <i class="fa fa-star"></i>
                My game subscriptions
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
    </Teleport>

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

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  flex-wrap: nowrap;
  flex-shrink: 0;
}

.home-button,
.menu-toggle {
  width: 48px;
  height: 48px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: none;
  cursor: pointer;
  font-size: 20px;
  border-radius: 10px;
  transition: background-color 0.3s ease;
}

.home-button {
  background-color: #f5a623;
  color: #1a1a2e;
}

.home-button:hover:not(:disabled) {
  background-color: #d48821;
}

.home-button:disabled {
  background-color: #e0e1dd;
  color: #1a1a2e;
  cursor: not-allowed;
}

.burger-menu {
  position: relative;
  flex-shrink: 0;
}

.menu-toggle {
  background-color: #f5a623;
  color: #1a1a2e;
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
