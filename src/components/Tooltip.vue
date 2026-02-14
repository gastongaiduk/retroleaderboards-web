<script setup lang="ts">
import { ref } from "vue";

defineProps({
  text: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    default: "top",
    validator: (val: string) => ["top", "bottom", "left", "right"].includes(val),
  },
});

const showTooltip = ref(false);
let timeout: ReturnType<typeof setTimeout> | null = null;

function onMouseEnter() {
  timeout = setTimeout(() => {
    showTooltip.value = true;
  }, 500);
}

function onMouseLeave() {
  if (timeout) clearTimeout(timeout);
  showTooltip.value = false;
}
</script>

<template>
  <div
    class="tooltip-wrapper"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <slot />
    <transition name="tooltip-fade">
      <span v-if="showTooltip" class="tooltip-content" :class="position">{{
        text
      }}</span>
    </transition>
  </div>
</template>

<style scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-flex;
}

.tooltip-content {
  position: absolute;
  background: #1e293b;
  color: #e2e8f0;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  z-index: 100;
  pointer-events: none;
  border: 1px solid rgba(148, 163, 184, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.tooltip-content.top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 6px;
}

.tooltip-content.bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 6px;
}

.tooltip-content.left {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 6px;
}

.tooltip-content.right {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 6px;
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.15s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}
</style>
