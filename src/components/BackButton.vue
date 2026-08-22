<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const props = withDefaults(defineProps<{ to?: string }>(), { to: undefined });

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
  background: rgba(233, 69, 96, 0.1);
  color: var(--accent-primary);
  border: 1px solid var(--border-accent);
  padding: 7px 14px;
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 500;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.back-button:hover {
  background: rgba(233, 69, 96, 0.15);
  border-color: var(--accent-primary);
}
</style>
