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
  <Tooltip text="Refresh content" position="left" style="float: right">
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
  background: rgba(203, 163, 78, 0.12);
  color: #cba34e;
  border: 1px solid rgba(203, 163, 78, 0.2);
  padding: 7px 14px;
  cursor: pointer;
  font-size: 14px;
  border-radius: 8px;
  transition: all 0.2s ease;
  float: right;
}

.refresh-button:hover:not(:disabled) {
  background: rgba(203, 163, 78, 0.2);
  border-color: rgba(203, 163, 78, 0.35);
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
