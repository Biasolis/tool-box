<template>
  <div class="kanban-column" :data-list-id="list.id">
    <header class="column-header">
      <input v-model="listName" @change="$emit('rename-list', listName)" class="column-title" />
      <button @click="$emit('delete-list')" class="delete-list-btn" title="Deletar Lista">✕</button>
    </header>
    <draggable
      :list="list.tasks"
      item-key="id"
      group="tasks"
      class="tasks-container"
      ghost-class="ghost-task"
      @change="onDragChange"
    >
      <template #item="{ element: task }">
        <TaskCard :task="task" @click="$emit('open-task-details', task)" @delete-task="$emit('delete-task', task.id)" />
      </template>
    </draggable>
    <footer class="column-footer">
      <NewTaskForm v-if="showNewTaskForm" @add-task="content => $emit('add-task', content)" @cancel="showNewTaskForm = false" />
      <button v-else @click="showNewTaskForm = true" class="add-task-btn">+ Adicionar uma tarefa</button>
    </footer>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable';
import TaskCard from './TaskCard.vue';
import NewTaskForm from './NewTaskForm.vue';
import { ref } from 'vue';

const props = defineProps({ list: Object });
const emit = defineEmits([
    'rename-list', 'delete-list', 
    'add-task', 'delete-task', 
    'move-task', 'open-task-details'
]);
const listName = ref(props.list.name);
const showNewTaskForm = ref(false);

const onDragChange = (event) => {
  if (event.added) {
    const { element, newIndex } = event.added;
    emit('move-task', { taskId: element.id, newListId: props.list.id, newPosition: newIndex });
  } else if (event.moved) {
    // Quando move dentro da mesma lista, atualiza as posições de todos os itens afetados
    // A view principal irá recarregar, o que já recalcula as posições.
  }
};
</script>

<style scoped>
.kanban-column {
  width: 300px;
  flex-shrink: 0;
  background-color: #ebecf0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  max-height: 100%;
}
.column-header {
  padding: 0.75rem 1rem;
  cursor: grab;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.column-title {
  font-weight: bold;
  border: none;
  background: transparent;
  width: 100%;
  border-radius: 4px;
  padding: 0.25rem;
  font-size: 1rem;
  color: #172b4d;
}
.column-title:focus {
  background: white;
  box-shadow: inset 0 0 0 2px #007bff;
}
.delete-list-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  color: #6c757d;
}
.delete-list-btn:hover {
  background-color: #cdd2d8;
}
.tasks-container {
  flex-grow: 1;
  padding: 0 0.5rem 0.5rem 0.5rem;
  overflow-y: auto;
  min-height: 50px;
}
.ghost-task {
  background-color: #cce5ff;
  border-radius: 4px;
}
.column-footer {
  padding: 0.5rem;
}
.add-task-btn {
  width: 100%;
  text-align: left;
  padding: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  color: #5e6c84;
}
.add-task-btn:hover {
  background: #dadbe0;
}
</style>