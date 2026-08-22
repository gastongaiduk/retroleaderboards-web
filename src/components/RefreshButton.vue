<script setup lang="ts">
import Tooltip from "./Tooltip.vue";
import { ref } from "vue";

const emit = defineEmits(["click"]);

const props = defineProps({
  loadingState: {
    type: Boolean,
    required: true,
  },
});

const loading = ref<boolean>(false);

function clickAction() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    emit("click");
  }, 1000);
}
</script>

<template>
  <Tooltip text="Refresh content" position="left">
    <button
      class="refresh-button"
      @click="clickAction"
      :disabled="props.loadingState || loading"
    >
      <i v-if="props.loadingState || loading" class="fa fa-spinner fa-spin"></i>
      <i v-else class="fa fa-refresh"></i>
    </button>
  </Tooltip>
</template>

<style scoped>
.refresh-button {
  background: rgba(233, 69, 96, 0.1);
  color: var(--accent-primary);
  border: 1px solid var(--border-accent);
  padding: 7px 14px;
  cursor: pointer;
  font-size: var(--text-base);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.refresh-button:hover:not(:disabled) {
  background: rgba(233, 69, 96, 0.15);
  border-color: var(--accent-primary);
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
