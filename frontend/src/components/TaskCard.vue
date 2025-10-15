<template>
  <div class="task-card">
    <p>{{ task.content }}</p>
    <div class="card-footer">
      <div class="card-icons">
        <span v-if="task.description" title="Esta tarefa tem uma descrição">📄</span>
        <span v-if="task.due_date" class="due-date" :class="dueDateClass" title="Data de entrega">
          📅 {{ formattedDate }}
        </span>
        <span v-if="task.checklist && task.checklist.length > 0" class="checklist-progress" title="Progresso do checklist">
          ✔️ {{ checklistProgress }}
        </span>
      </div>
      <button @click.stop="$emit('delete-task')" class="delete-btn" title="Deletar tarefa">🗑️</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({ task: Object });
defineEmits(['delete-task']);

const formattedDate = computed(() => {
  if (!props.task.due_date) return '';
  const date = new Date(props.task.due_date);
  date.setDate(date.getDate() + 1);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
});

const dueDateClass = computed(() => {
    if (!props.task.due_date) return '';
    const today = new Date();
    const dueDate = new Date(props.task.due_date);
    today.setHours(0,0,0,0);
    dueDate.setHours(0,0,0,0);
    
    if (dueDate < today) return 'overdue';
    if (dueDate.getTime() === today.getTime()) return 'due-today';
    return 'due-later';
});

const checklistProgress = computed(() => {
  if (!props.task.checklist || props.task.checklist.length === 0) return '';
  const total = props.task.checklist.length;
  const completed = props.task.checklist.filter(item => item.is_completed).length;
  return `${completed}/${total}`;
});
</script>

<style scoped>
.task-card {
  position: relative;
  background-color: #fff;
  padding: 1rem;
  border-radius: 4px;
  box-shadow: 0 1px 1px rgba(0,0,0,0.1);
  margin-bottom: 0.5rem;
  cursor: grab;
}
.task-card:hover .delete-btn {
  opacity: 1;
}
.task-card p {
  margin: 0 0 0.75rem 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.delete-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 0.8rem;
  padding: 0.25rem;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-icons {
  display: flex;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: #5e6c84;
}
.due-date, .checklist-progress {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 2px 6px;
  border-radius: 3px;
}
.due-date.overdue { background-color: #ffebe6; color: #bf2600; }
.due-date.due-today { background-color: #fff0b3; color: #974f0c; }
.checklist-progress { background-color: #dfe1e6; }
</style>