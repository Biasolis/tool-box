<template>
  <div class="whiteboard-view-container">
    <div class="sidebar">
      <div class="sidebar-header">
        <router-link to="/dashboard" class="nav-button">&larr; Voltar ao Dashboard</router-link>
        <button @click="createNewWhiteboard" class="new-btn">Nova Lousa</button>
      </div>
      <div v-if="whiteboards.length > 0" class="list-container">
        <ul class="list">
          <li v-for="wb in whiteboards" :key="wb.id" @click="selectWhiteboard(wb.id)" :class="{ active: selectedWb && selectedWb.id === wb.id }">
            <div class="item-content">
              <span class="title">{{ wb.name || 'Nova Lousa' }}</span>
              <small class="date">{{ new Date(wb.updated_at).toLocaleDateString() }}</small>
            </div>
            <button @click.stop="requestDelete(wb)" class="delete-item-btn" title="Deletar Lousa">🗑️</button>
          </li>
        </ul>
      </div>
      <div v-else class="placeholder-text">Nenhuma lousa encontrada.</div>
    </div>
    <div class="main-area">
      <WhiteboardCanvas v-if="selectedWb" :key="selectedWb.id" :whiteboard-prop="selectedWb" @update:name="handleNameUpdate" @content-changed="handleContentChange"/>
      <div v-else class="placeholder-text main">Selecione uma lousa ou crie uma nova para começar.</div>
    </div>

    <ConfirmModal 
      v-if="wbToDelete"
      title="Deletar Lousa"
      :message="`Tem certeza que deseja deletar a lousa '${wbToDelete.name}'? Esta ação não pode ser desfeita.`"
      @confirm="confirmDelete"
      @cancel="wbToDelete = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';
import { debounce } from 'lodash-es';
import WhiteboardCanvas from '@/components/WhiteboardCanvas.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';

const whiteboards = ref([]);
const selectedWb = ref(null);
const wbToDelete = ref(null);

const saveWhiteboard = debounce(async () => {
  if (!selectedWb.value) return;
  try {
    const { data: savedData } = await apiClient.put(`/whiteboards/${selectedWb.value.id}`, {
      name: selectedWb.value.name,
      content: selectedWb.value.content
    });
    const index = whiteboards.value.findIndex(wb => wb.id === savedData.id);
    if (index !== -1) {
      whiteboards.value[index].name = savedData.name;
      whiteboards.value[index].updated_at = savedData.updated_at;
    }
  } catch (error) { console.error("Erro ao salvar lousa:", error); }
}, 1500);

const handleNameUpdate = (newName) => {
  if (selectedWb.value) {
    selectedWb.value.name = newName;
    saveWhiteboard();
  }
};

const handleContentChange = (newContent) => {
  if (selectedWb.value) {
    selectedWb.value.content = newContent;
    saveWhiteboard();
  }
};

const fetchWhiteboards = async () => {
    try {
        const { data } = await apiClient.get('/whiteboards');
        whiteboards.value = data;
    } catch (error) { console.error("Erro ao buscar lousas:", error); }
};

const selectWhiteboard = async (wbId) => {
    if (selectedWb.value && selectedWb.value.id === wbId) return;
    saveWhiteboard.flush();
    try {
        const { data } = await apiClient.get(`/whiteboards/${wbId}`);
        selectedWb.value = data;
    } catch (error) { console.error("Erro ao selecionar lousa:", error); }
};

const createNewWhiteboard = async () => {
    try {
        const { data: newWb } = await apiClient.post('/whiteboards', { name: 'Nova Lousa' });
        whiteboards.value.unshift(newWb);
        selectWhiteboard(newWb.id);
    } catch (error) { console.error("Erro ao criar lousa:", error); }
};

const requestDelete = (whiteboard) => {
  wbToDelete.value = whiteboard;
};

const confirmDelete = async () => {
    if (!wbToDelete.value) return;
    try {
        await apiClient.delete(`/whiteboards/${wbToDelete.value.id}`);
        whiteboards.value = whiteboards.value.filter(wb => wb.id !== wbToDelete.value.id);
        if (selectedWb.value && selectedWb.value.id === wbToDelete.value.id) {
            selectedWb.value = null;
        }
        wbToDelete.value = null;
    } catch (error) { console.error("Erro ao deletar lousa:", error); }
};

onMounted(fetchWhiteboards);
</script>

<style scoped>
.whiteboard-view-container { display: flex; height: 100%; background: #fff; }
.sidebar { width: 300px; background: #f8f9fa; border-right: 1px solid #e9ecef; display: flex; flex-direction: column; flex-shrink: 0; height: 100%; }
.sidebar-header { padding: 1rem; border-bottom: 1px solid #e9ecef; display: flex; flex-direction: column; gap: 1rem; }
.nav-button { text-decoration: none; font-weight: bold; font-size: 0.9rem; padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid #6c757d; color: #6c757d; background-color: #fff; text-align: center; }
.new-btn { width: 100%; padding: 0.75rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
.list-container { overflow-y: auto; flex-grow: 1; }
.list { list-style: none; padding: 0; margin: 0; }
.list li { padding: 1rem; cursor: pointer; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center; }
.list li:hover { background: #e2e6ea; }
.list li.active { background: #007bff; color: white; }
.list li.active .date { color: rgba(255, 255, 255, 0.7); }
.item-content { flex-grow: 1; overflow: hidden; }
.title { display: block; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.date { font-size: 0.8rem; opacity: 0.7; }
.delete-item-btn { background: none; border: none; cursor: pointer; font-size: 1rem; opacity: 0.5; transition: opacity 0.2s; padding: 0 0.5rem; }
.list li:hover .delete-item-btn { opacity: 1; }
.list li.active .delete-item-btn { color: white; }
.main-area { flex-grow: 1; display: flex; flex-direction: column; overflow: hidden; }
.placeholder-text { text-align: center; padding: 2rem; color: #6c757d; }
.placeholder-text.main { flex-grow: 1; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
</style>