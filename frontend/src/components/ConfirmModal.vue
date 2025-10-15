<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal-content">
      <h4>{{ title }}</h4>
      <p>{{ message }}</p>
      <div class="modal-actions">
        <button @click="$emit('cancel')" class="btn secondary">Cancelar</button>
        <button @click="$emit('confirm')" class="btn danger">Confirmar Exclusão</button>
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  title: { type: String, default: 'Confirmar Ação' },
  message: { type: String, required: true },
});
defineEmits(['confirm', 'cancel']);
</script>
<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); width: 100%; max-width: 400px; }
h4 { margin-top: 0; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
.btn { padding: 0.5rem 1rem; border-radius: 4px; border: none; font-weight: bold; cursor: pointer; }
.btn.secondary { background-color: #6c757d; color: white; }
.btn.danger { background-color: #dc3545; color: white; }
</style>