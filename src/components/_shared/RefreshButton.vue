<script setup lang="ts">
import Tooltip from "./Tooltip.vue";
import {ref} from "vue";

const emit = defineEmits(['click'])

const props = defineProps({
  loadingState: {
    type: Boolean,
    required: true
  },
})

const loading = ref<boolean>(false);

function clickAction() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    emit('click');
  }, 1000);
}
</script>

<template>
  <Tooltip text="Refresh content" position="left" style="float: right">
    <button class="refresh-button" @click="clickAction" :disabled="props.loadingState || loading">
      <i v-if="props.loadingState || loading" class="fa fa-spinner fa-spin"></i>
      <i v-else class="fa fa-refresh"></i>
    </button>
  </Tooltip>
</template>

<style scoped>
.refresh-button {
  background-color: #f5a623;
  color: #1a1a2e;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  border-radius: 10px;
}

.refresh-button:hover {
  background-color: #d48821;
}

.refresh-button {
  float: right;
}
</style>
