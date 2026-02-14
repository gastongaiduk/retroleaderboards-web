<script setup lang="ts">
import { onMounted } from 'vue';
import BottomNavigation from '../components/BottomNavigation.vue';
import { useUpdatesStore } from '../stores/updates';

const updatesStore = useUpdatesStore();

onMounted(() => {
  updatesStore.fetchUpdates();
});
</script>

<template>
  <div class="main-layout">
    <div class="content-area">
      <router-view v-slot="{ Component, route }">
        <keep-alive v-if="route.meta.keepAlive" :key="route.fullPath">
          <component :is="Component" />
        </keep-alive>
        <component v-else :is="Component" />
      </router-view>
    </div>
    <BottomNavigation />
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh; /* overrides 100vh on supporting browsers — handles mobile browser chrome */
  background-color: #1a1a2e;
  overflow: hidden;
}

.content-area {
  flex: 1;
  min-height: 0; /* critical: allows flex child to shrink below content size */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
