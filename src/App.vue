<script setup lang="ts">
import { onMounted } from "vue";
import { useUserStore } from "./stores/user.ts";

const user = useUserStore();

onMounted(() => {
  user.init();
});
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive v-if="route.meta.keepAlive" :key="route.fullPath">
      <component :is="Component" />
    </keep-alive>
    <component v-else :is="Component" />
  </router-view>
</template>

<style scoped></style>
