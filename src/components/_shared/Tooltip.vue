<script lang="ts" setup>
import { ref, defineProps } from 'vue';

const props = defineProps<{
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}>();

const position = props.position ?? 'top';
const show = ref(false);
</script>

<template>
  <div class="tooltip-container" @mouseover="show = true" @mouseleave="show = false">
    <slot></slot>
    <div v-if="show" class="tooltip" :class="position">{{ text }}</div>
  </div>
</template>

<style scoped>
.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: absolute;
  background-color: black;
  color: white;
  padding: 8px;
  border-radius: 4px;
  z-index: 1000; /* Ensures tooltip is on top */
  font-size: 12px;
  text-align: center; /* Center-aligns the text */
  white-space: normal; /* Allow text to wrap */
  word-wrap: break-word; /* Break long words if necessary */
}

.tooltip::after {
  content: '';
  position: absolute;
  border-width: 5px;
  border-style: solid;
}

/* Top position */
.tooltip.top {
  bottom: calc(100% + 8px); /* Adds spacing between tooltip and target */
  left: 50%;
  transform: translateX(-50%);
}

.tooltip.top::after {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-color: black transparent transparent transparent; /* Triangle pointing down */
}

/* Bottom position */
.tooltip.bottom {
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.tooltip.bottom::after {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-color: transparent transparent black transparent; /* Triangle pointing up */
}

/* Left position */
.tooltip.left {
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

.tooltip.left::after {
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  border-color: transparent transparent transparent black; /* Triangle pointing right */
}

/* Right position */
.tooltip.right {
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

.tooltip.right::after {
  left: -5px;
  top: 50%;
  transform: translateY(-50%);
  border-color: transparent black transparent transparent; /* Triangle pointing left */
}
</style>
