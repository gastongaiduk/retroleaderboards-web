<script setup lang="ts">
import { onMounted } from "vue";
import { useMediaQuery } from "@vueuse/core";
import BottomNavigation from "../components/BottomNavigation.vue";
import SidebarNavigation from "../components/SidebarNavigation.vue";
import { useUpdatesStore } from "../stores/updates";

const updatesStore = useUpdatesStore();
const isDesktop = useMediaQuery("(min-width: 768px)");

onMounted(() => {
  updatesStore.fetchUpdates();
});
</script>

<template>
  <div class="main-layout">
    <SidebarNavigation v-if="isDesktop" />
    <div class="content-area">
      <router-view v-slot="{ Component, route }">
        <keep-alive v-if="route.meta.keepAlive" :key="route.fullPath">
          <component :is="Component" />
        </keep-alive>
        <component v-else :is="Component" />
      </router-view>
    </div>
    <BottomNavigation v-if="!isDesktop" />
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  height: 100dvh;
  background-color: var(--bg-body);
  overflow: hidden;
}

.content-area {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (min-width: 768px) {
  .content-area {
    padding: var(--space-4) var(--space-6);
  }
}
</style>
