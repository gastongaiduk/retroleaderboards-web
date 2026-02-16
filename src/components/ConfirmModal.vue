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
        <button
          @click="cancelAction"
          class="cancel-button"
          :disabled="loading"
        >
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
  background-color: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #1e293b;
  color: #e2e8f0;
  padding: 24px;
  border-radius: 14px;
  border: 1px solid rgba(203, 163, 78, 0.15);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  text-align: center;
  max-width: 360px;
  width: calc(100% - 40px);
}

.modal-title {
  color: #cba34e;
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
}

.modal-text {
  margin: 0 0 20px;
  font-size: 13px;
  line-height: 1.6;
  color: #94a3b8;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.confirm-button,
.cancel-button {
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.confirm-button {
  background-color: #cba34e;
  color: #0f172a;
  min-width: 90px;
}

.confirm-button:hover:not(:disabled) {
  background-color: #b8923f;
}

.confirm-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cancel-button {
  background-color: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.cancel-button:hover:not(:disabled) {
  background-color: rgba(148, 163, 184, 0.2);
}

.cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
