<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content">
      <h2 class="modal-title">{{ title }}</h2>
      <p class="modal-text">{{ text }}</p>
      <div class="modal-buttons">
        <button
          @click="confirmAction"
          class="confirm-button"
          :disabled="loading"
        >
          <i v-if="loading" class="fa fa-spinner fa-spin"></i>
          <span v-else>Confirm</span>
        </button>
        <button @click="cancelAction" class="cancel-button" :disabled="loading">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["isVisible", "title", "text", "loading"],
  methods: {
    confirmAction() {
      this.$emit("confirm");
    },
    cancelAction() {
      this.$emit("nope");
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-overlay);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--bg-surface);
  color: var(--text-primary);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-default);
  box-shadow: var(--shadow-lg);
  text-align: center;
  max-width: 360px;
  width: calc(100% - 40px);
}

.modal-title {
  color: var(--accent-primary);
  margin: 0 0 var(--space-3);
  font-size: var(--text-lg);
  font-weight: 600;
}

.modal-text {
  margin: 0 0 var(--space-5);
  font-size: var(--text-sm);
  line-height: 1.6;
  color: var(--text-secondary);
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
}

.confirm-button,
.cancel-button {
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 500;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.confirm-button {
  background-color: var(--accent-primary);
  color: white;
  min-width: 90px;
}

.confirm-button:hover:not(:disabled) {
  background-color: var(--accent-primary-hover);
}

.confirm-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cancel-button {
  background-color: var(--bg-body);
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
}

.cancel-button:hover:not(:disabled) {
  background-color: var(--bg-surface-hover);
}

.cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
