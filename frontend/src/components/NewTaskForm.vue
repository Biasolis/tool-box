<template>
  <form @submit.prevent="addTask" class="new-task-form">
    <div class="card-composer">
      <textarea v-model="content" placeholder="Insira o texto da tarefa..." @keydown.enter.prevent="addTask" ref="textareaRef"></textarea>
    </div>
    <div class="form-actions">
      <button type="submit" class="add-btn">Adicionar Tarefa</button>
      <button type="button" @click="$emit('cancel')" class="cancel-btn">✕</button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const content = ref('');
const textareaRef = ref(null);
const emit = defineEmits(['add-task', 'cancel']);
const addTask = () => {
  if (content.value.trim()) {
    emit('add-task', content.value.trim());
    content.value = '';
  }
};
onMounted(() => { if (textareaRef.value) { textareaRef.value.focus(); } });
</script>

<style scoped>
.card-composer textarea {
  width: 100%;
  box-sizing: border-box;
  border-radius: 4px;
  border: none;
  padding: 0.75rem;
  resize: vertical;
  min-height: 80px;
  box-shadow: 0 1px 1px rgba(0,0,0,0.1);
  font-family: inherit;
  font-size: 1rem;
}
.form-actions { 
  display: flex; 
  gap: 0.5rem; 
  margin-top: 0.5rem; 
  align-items: center;
}
.add-btn { 
  background: #007bff; 
  color: white; 
  border: none; 
  padding: 0.5rem 1rem; 
  border-radius: 4px; 
  cursor: pointer;
  font-weight: bold;
}
.cancel-btn { 
  background: none; 
  border: none; 
  font-size: 1.5rem; 
  cursor: pointer; 
  color: #6c757d;
  padding: 0;
  line-height: 1;
}
</style>