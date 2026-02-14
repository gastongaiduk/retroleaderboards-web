<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const props = withDefaults(
  defineProps<{ to?: string }>(),
  { to: undefined },
);

function goBack() {
  if (props.to) {
    router.push(props.to);
  } else {
    router.back();
  }
}
</script>

<template>
  <button class="back-button" @click="goBack">
    <i class="fa fa-arrow-left" aria-hidden="true"></i> Back
  </button>
</template>

<style scoped>
.back-button {
  background: rgba(203, 163, 78, 0.12);
  color: #cba34e;
  border: 1px solid rgba(203, 163, 78, 0.2);
  padding: 7px 14px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.back-button:hover {
  background: rgba(203, 163, 78, 0.2);
  border-color: rgba(203, 163, 78, 0.35);
}
</style>
