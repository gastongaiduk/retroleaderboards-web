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
    validator: (val: string) =>
      ["top", "bottom", "left", "right"].includes(val),
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
  background: var(--bg-surface);
  color: var(--text-primary);
  padding: 6px 10px;
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: 500;
  white-space: nowrap;
  z-index: 100;
  pointer-events: none;
  border: 1px solid var(--border-default);
  box-shadow: var(--shadow-md);
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
  transition: opacity var(--transition-fast);
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}
</style>
