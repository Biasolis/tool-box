<template>
  <div class="kanban-board">
    <draggable
      v-model="board.lists"
      item-key="id"
      class="board-draggable-area"
      ghost-class="ghost-column"
      handle=".column-header"
    >
      <template #item="{ element: list }">
        <KanbanColumn 
          :list="list"
          @rename-list="name => $emit('rename-list', { listId: list.id, name })"
          @delete-list="$emit('delete-list', list)"
          @add-task="content => $emit('add-task', { listId: list.id, content })"
          @delete-task="taskId => $emit('delete-task', taskId)"
          @move-task="$emit('move-task', $event)"
          @open-task-details="task => $emit('open-task-details', task)"
        />
      </template>
    </draggable>
    <div class="new-column-creator">
      <form v-if="isCreatingList" @submit.prevent="onAddList" class="new-list-form">
        <input v-model="newListName" placeholder="Insira o título da lista..." ref="newListInput" @blur="cancelAddList"/>
        <button type="submit">Adicionar Lista</button>
      </form>
      <button v-else @click="startCreatingList" class="add-list-btn">+ Adicionar outra lista</button>
    </div>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable';
import KanbanColumn from './KanbanColumn.vue';
import { ref, nextTick } from 'vue';

const props = defineProps({ board: Object });
const emit = defineEmits([
  'add-list', 'rename-list', 'delete-list', 
  'add-task', 'update-task', 'delete-task', 
  'move-task', 'open-task-details'
]);

const newListName = ref('');
const isCreatingList = ref(false);
const newListInput = ref(null);

const startCreatingList = async () => {
  isCreatingList.value = true;
  await nextTick();
  newListInput.value.focus();
};

const onAddList = () => {
  if (!newListName.value.trim()) {
    isCreatingList.value = false;
    return;
  }
  emit('add-list', newListName.value);
  newListName.value = '';
  isCreatingList.value = false;
};

const cancelAddList = () => {
    if (newListName.value.trim() === '') {
        isCreatingList.value = false;
    }
};
</script>

<style scoped>
.kanban-board, .board-draggable-area {
  height: 100%;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.ghost-column {
  background-color: rgba(0,0,0,0.1);
  border-radius: 8px;
}
.new-column-creator {
  flex-shrink: 0;
  width: 300px;
}
.add-list-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  background: hsla(0,0%,100%,.24);
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  color: #fff;
  font-weight: bold;
}
.add-list-btn:hover {
  background: hsla(0,0%,100%,.32);
}
.new-list-form input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #007bff;
  border-radius: 8px;
  box-sizing: border-box;
  margin-bottom: 0.5rem;
}
.new-list-form button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>