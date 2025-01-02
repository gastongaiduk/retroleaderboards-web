<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content">
      <h2 class="modal-title">{{title}}</h2>
      <p class="modal-text">{{text}}</p>
      <div class="modal-buttons">
        <button @click="confirmAction" class="confirm-button">Confirm</button>
        <button @click="cancelAction" class="cancel-button">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['isVisible', 'title', 'text'],
  methods: {
    confirmAction() {
      this.$emit('confirm');
    },
    cancelAction() {
      this.$emit('nope');
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(26, 26, 46, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  font-family: 'Press Start 2P', cursive;
}

.modal-content {
  background-color: #1a1a2e;
  color: #e0e1dd;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.5);
  text-align: center;
}

.modal-title {
  color: #f5a623;
  margin-bottom: 20px;
  font-size: 20px;
}

.modal-text {
  margin-bottom: 20px;
  font-size: 16px;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.confirm-button,
.cancel-button {
  background-color: #f5a623;
  color: #1a1a2e;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  border-radius: 10px;
  font-family: 'Press Start 2P', cursive;
  transition: background-color 0.3s ease;
}

.confirm-button:hover,
.cancel-button:hover {
  background-color: #d48821;
}
</style>
