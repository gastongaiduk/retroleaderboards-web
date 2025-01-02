<script setup lang="ts">
import {onMounted} from "vue";
import {useUserStore} from "./stores/user.ts";

const user = useUserStore();

onMounted(() => {
  user.init();
});
</script>

<template>
  <router-view></router-view>
</template>

<style scoped>
</style>
