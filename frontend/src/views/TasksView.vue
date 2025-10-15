<template>
  <div class="tasks-view-container">
    <header class="tasks-header">
      <router-link to="/dashboard" class="nav-button">&larr; Voltar ao Dashboard</router-link>
      <h1 class="board-title">{{ board.name || 'Quadro de Tarefas' }}</h1>
    </header>
    <main v-if="board.lists" class="board-wrapper">
      <KanbanBoard 
        :board="board" 
        @add-list="addList"
        @rename-list="renameList"
        @delete-list="requestDeleteList"
        @add-task="addTask"
        @update-task="updateTask"
        @delete-task="requestDeleteTask"
        @move-task="moveTask"
        @open-task-details="openTaskDetails"
      />
    </main>
    <div v-else class="loading">
      Carregando quadro...
    </div>

    <TaskDetailModal 
      v-if="selectedTask" 
      :task="selectedTask" 
      @close="selectedTask = null" 
      @task-updated="updateTask" 
      @add-comment="addComment"
      @add-checklist-item="addChecklistItem"
      @update-checklist-item="updateChecklistItem"
    />
    <ConfirmModal 
      v-if="listToDelete" 
      title="Deletar Lista"
      :message="`Deletar a lista '${listToDelete.name}' irá apagar permanentemente todas as suas tarefas. Tem certeza?`" 
      @confirm="confirmDeleteList" 
      @cancel="listToDelete = null" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';
import KanbanBoard from '@/components/KanbanBoard.vue';
import TaskDetailModal from '@/components/TaskDetailModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';

const board = ref({});
const selectedTask = ref(null);
const listToDelete = ref(null);

const fetchBoard = async () => {
  try {
    const { data } = await apiClient.get('/board');
    board.value = data;
  } catch (err) { console.error("Erro ao buscar quadro:", err); }
};

const openTaskDetails = (task) => {
  const list = board.value.lists.find(l => l.tasks.some(t => t.id === task.id));
  if (list) {
    const freshTask = list.tasks.find(t => t.id === task.id);
    selectedTask.value = freshTask;
  }
};

const requestDeleteList = (list) => {
  listToDelete.value = list;
};

const addList = async (name) => {
  try {
    await apiClient.post('/lists', { project_id: board.value.id, name, position: board.value.lists.length });
    await fetchBoard();
  } catch(err) { console.error("Erro ao adicionar lista", err); }
};

const renameList = async ({ listId, name }) => {
  try {
    await apiClient.put(`/lists/${listId}`, { name });
    const list = board.value.lists.find(l => l.id === listId);
    if (list) list.name = name;
  } catch(err) { console.error("Erro ao renomear lista", err); }
};

const confirmDeleteList = async () => {
  if (!listToDelete.value) return;
  try {
    await apiClient.delete(`/lists/${listToDelete.value.id}`);
    listToDelete.value = null;
    await fetchBoard();
  } catch(err) { console.error("Erro ao deletar lista", err); }
};

const addTask = async ({ listId, content }) => {
  try {
    const list = board.value.lists.find(l => l.id === listId);
    if (list) {
      await apiClient.post('/tasks', { list_id: listId, content, position: list.tasks.length });
      await fetchBoard();
    }
  } catch(err) { console.error("Erro ao adicionar tarefa", err); }
};

const updateTask = async (task) => {
  try {
    await apiClient.put(`/tasks/${task.id}`, task);
    selectedTask.value = null;
    await fetchBoard();
  } catch(err) { console.error("Erro ao atualizar tarefa", err); }
};

const requestDeleteTask = async (taskId) => {
  try {
    await apiClient.delete(`/tasks/${taskId}`);
    await fetchBoard();
  } catch(err) { console.error("Erro ao deletar tarefa", err); }
};

const moveTask = async ({ taskId, newListId, newPosition }) => {
    try {
        await apiClient.put(`/tasks/${taskId}/move`, { new_list_id: newListId, position: newPosition });
        await fetchBoard();
    } catch(err) { console.error("Erro ao mover tarefa", err); }
};

const addComment = async ({ taskId, content }) => {
  try {
    await apiClient.post(`/tasks/${taskId}/comments`, { content });
    await fetchBoard();
    const list = board.value.lists.find(l => l.tasks.some(t => t.id === taskId));
    const freshTask = list.tasks.find(t => t.id === taskId);
    selectedTask.value = freshTask;
  } catch(err) { console.error("Erro ao adicionar comentário", err); }
};

const addChecklistItem = async ({ taskId, content }) => {
  try {
    const task = board.value.lists.flatMap(l => l.tasks).find(t => t.id === taskId);
    if (task) {
      await apiClient.post(`/tasks/${taskId}/checklist`, { content, position: task.checklist.length });
      await fetchBoard();
      const list = board.value.lists.find(l => l.tasks.some(t => t.id === taskId));
      const freshTask = list.tasks.find(t => t.id === taskId);
      selectedTask.value = freshTask;
    }
  } catch(err) { console.error("Erro ao adicionar item de checklist", err); }
};

const updateChecklistItem = async (item) => {
  try {
    await apiClient.put(`/checklist/${item.id}`, item);
    const task = board.value.lists.flatMap(l => l.tasks).find(t => t.id === item.task_id);
    if (task) {
        const itemIndex = task.checklist.findIndex(i => i.id === item.id);
        if (itemIndex !== -1) {
            task.checklist[itemIndex].is_completed = item.is_completed;
        }
    }
  } catch(err) { console.error("Erro ao atualizar item de checklist", err); }
};

onMounted(fetchBoard);
</script>

<style scoped>
.tasks-view-container { 
  display: flex; 
  flex-direction: column; 
  height: 100%;
  background-color: #0079bf; /* Cor de fundo estilo Trello */
  overflow: hidden;
}
.tasks-header { 
  padding: 0.75rem 2rem; 
  flex-shrink: 0; 
  background-color: rgba(0,0,0,0.15); 
  display: flex; 
  align-items: center; 
  gap: 2rem; 
  color: white;
}
.board-title { 
  margin: 0; 
  font-size: 1.5rem;
}
.nav-button { 
  text-decoration: none; 
  font-weight: bold; 
  font-size: 0.9rem; 
  padding: 0.5rem 1rem; 
  border-radius: 4px; 
  border: 1px solid rgba(255,255,255,0.5); 
  color: white; 
  background-color: rgba(255,255,255,0.1); 
}
.nav-button:hover {
  background-color: rgba(255,255,255,0.2);
}
.board-wrapper { 
  flex-grow: 1; 
  overflow-x: auto; 
  overflow-y: hidden;
  padding: 1.5rem; 
}
.loading { 
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem; 
  color: #fff; 
}
</style>