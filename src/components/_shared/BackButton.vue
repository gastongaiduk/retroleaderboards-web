<script setup lang="ts">
import {useRouter} from "vue-router";

const router = useRouter();

function goBack() {
  router.back();
}

</script>

<template>
  <button class="back-button" @click="goBack"><i class="fa fa-arrow-left" aria-hidden="true"></i> Back</button>
</template>

<style scoped>
.back-button {
  background-color: #f5a623;
  color: #1a1a2e;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  border-radius: 10px;
}

.back-button:hover {
  background-color: #d48821;
}
</style>
