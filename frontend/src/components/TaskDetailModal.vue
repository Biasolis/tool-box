<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div v-if="editableTask">
        
        <div class="modal-header">
          <textarea v-model="editableTask.content" class="task-title-input" @change="saveTask"></textarea>
          <button @click="$emit('close')" class="close-btn">✕</button>
        </div>

        <div class="modal-body">
          <div class="main-col">
            <div class="detail-section">
              <label>Data de Entrega</label>
              <input type="date" v-model="editableTask.due_date" @change="saveTask" class="styled-input" />
            </div>

            <div class="detail-section">
              <label>Descrição</label>
              <textarea v-model="editableTask.description" class="styled-input description" placeholder="Adicione uma descrição mais detalhada..." @change="saveTask"></textarea>
            </div>
            
            <div v-if="editableTask.checklist" class="detail-section">
              <label>Checklist ({{ checklistProgressText }})</label>
              <div class="progress-bar">
                <div class="progress-bar-fill" :style="{ width: checklistProgress }"></div>
              </div>
              <div v-for="item in editableTask.checklist" :key="item.id" class="checklist-item">
                <input type="checkbox" v-model="item.is_completed" @change="$emit('update-checklist-item', item)" />
                <input type="text" v-model="item.content" class="checklist-item-input" />
              </div>
              <form @submit.prevent="addChecklistItem" class="add-item-form">
                <input v-model="newChecklistItem" class="styled-input" placeholder="Adicionar um item" />
                <button type="submit" class="btn secondary small-btn">Adicionar</button>
              </form>
            </div>

            <div class="detail-section">
              <label>Comentários</label>
              <div class="add-comment-form">
                <textarea v-model="newComment" class="styled-input" placeholder="Escreva um comentário..."></textarea>
                <button @click="addComment" :disabled="!newComment.trim()" class="btn primary">Salvar Comentário</button>
              </div>
              <div class="comments-list">
                <div v-for="comment in editableTask.comments" :key="comment.id" class="comment-item">
                  <div class="comment-author-date">
                      <strong>{{ comment.user_email }}</strong>
                      <small>{{ new Date(comment.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) }}</small>
                  </div>
                  <p>{{ comment.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, computed } from 'vue';

const props = defineProps({ task: Object });
const emit = defineEmits(['close', 'task-updated', 'add-comment', 'add-checklist-item', 'update-checklist-item']);

const editableTask = ref(null);
const newComment = ref('');
const newChecklistItem = ref('');

watchEffect(() => {
  if (props.task) {
    editableTask.value = JSON.parse(JSON.stringify(props.task));
    editableTask.value.due_date = editableTask.value.due_date ? new Date(editableTask.value.due_date).toISOString().split('T')[0] : null;
  }
});

const checklistProgress = computed(() => {
    if (!editableTask.value?.checklist || editableTask.value.checklist.length === 0) return '0%';
    const completed = editableTask.value.checklist.filter(i => i.is_completed).length;
    const total = editableTask.value.checklist.length;
    return `${(completed / total) * 100}%`;
});
const checklistProgressText = computed(() => {
    if (!editableTask.value?.checklist || editableTask.value.checklist.length === 0) return '0/0';
    const completed = editableTask.value.checklist.filter(i => i.is_completed).length;
    const total = editableTask.value.checklist.length;
    return `${completed}/${total}`;
});
const saveTask = () => {
  const taskToSave = { ...editableTask.value };
  if (taskToSave.due_date) {
    taskToSave.due_date = new Date(taskToSave.due_date).toISOString();
  } else {
    taskToSave.due_date = null;
  }
  emit('task-updated', taskToSave);
};
const addComment = () => {
  if (newComment.value.trim()) {
    emit('add-comment', { taskId: editableTask.value.id, content: newComment.value });
    newComment.value = '';
  }
};
const addChecklistItem = () => {
  if (newChecklistItem.value.trim()) {
    emit('add-checklist-item', { taskId: editableTask.value.id, content: newChecklistItem.value });
    newChecklistItem.value = '';
  }
};
</script>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: #f4f5f7; border-radius: 8px; width: 100%; max-width: 800px; max-height: 90vh; display: flex; flex-direction: column; position: relative; }
.close-btn { position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6c757d; border-radius: 50%; width: 32px; height: 32px; line-height: 32px; text-align: center; }
.close-btn:hover { background-color: rgba(9, 30, 66, 0.08); }
.modal-header { padding: 1.5rem; }
.modal-body { overflow-y: auto; padding: 0 1.5rem 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
.detail-section label { font-weight: bold; font-size: 0.9rem; margin-bottom: 0.5rem; display: block; color: #5e6c84; }
.styled-input, .task-title-input { background: white; border: 2px solid #dfe1e6; border-radius: 4px; padding: 0.75rem; width: 100%; box-sizing: border-box; font-size: 1rem; transition: border-color 0.2s; color: #172b4d; }
.styled-input:focus, .task-title-input:focus { border-color: #007bff; outline: none; }
.task-title-input { font-size: 1.5rem; font-weight: bold; resize: vertical; }
.description { min-height: 120px; resize: vertical; }
.progress-bar { background-color: #091e4214; border-radius: 4px; height: 8px; margin-bottom: 0.75rem; }
.progress-bar-fill { background-color: #007bff; height: 100%; border-radius: 4px; transition: width 0.3s; }
.checklist-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem; }
.checklist-item-input { flex-grow: 1; border: none; background: transparent; padding: 0.25rem; border-radius: 3px; }
.checklist-item-input:focus { background-color: white; box-shadow: inset 0 0 0 2px #007bff; }
.checklist-item span.completed { text-decoration: line-through; color: #6c757d; }
.add-item-form { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.comments-list { display: flex; flex-direction: column-reverse; gap: 1rem; margin-top: 1rem; }
.comment-item { background: white; padding: 0.75rem; border-radius: 4px; box-shadow: 0 1px 1px #091e4240; }
.comment-item p { margin: 0.25rem 0; }
.add-comment-form { display: flex; flex-direction: column; }
.add-comment-form textarea { min-height: 80px; }
.btn { padding: 0.75rem 1.5rem; border-radius: 4px; border: none; font-weight: bold; cursor: pointer; }
.btn.primary { background-color: #007bff; color: white; margin-top: 0.5rem; align-self: flex-start; }
.btn.secondary { background-color: #dfe1e6; color: #172b4d; }
.btn.small-btn { padding: 0.5rem 1rem; }
</style>