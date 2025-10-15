<template>
  <div class="notes-view-container">
    <div class="notes-sidebar">
      <div class="sidebar-header">
        <router-link to="/dashboard" class="nav-button">&larr; Voltar ao Dashboard</router-link>
        <button @click="createNewNote" class="new-note-btn">Nova Nota</button>
      </div>
      <div v-if="notes.length > 0" class="notes-list-container">
        <ul class="notes-list">
          <li 
            v-for="note in notes" 
            :key="note.id" 
            @click="selectNote(note.id)"
            :class="{ active: selectedNote && selectedNote.id === note.id }"
          >
            <span class="note-title">{{ note.title || 'Nota sem título' }}</span>
            <small class="note-date">{{ new Date(note.updated_at).toLocaleDateString() }}</small>
          </li>
        </ul>
      </div>
      <div v-else class="no-notes-found">
        <p>Nenhuma nota encontrada. Crie sua primeira nota!</p>
      </div>
    </div>
    <div class="note-editor-area">
      <NoteEditor 
        v-if="selectedNote" 
        :key="selectedNote.id"
        :note="selectedNote"
        :save-status="saveStatus"
        @update:title="handleFieldUpdate('title', $event)"
        @update:content="handleFieldUpdate('content', $event)"
        @request-delete="showDeleteModal = true" 
      />
      <div v-else class="no-note-selected">
        <p>Selecione uma nota para editar ou crie uma nova.</p>
      </div>
    </div>

    <ConfirmModal 
      v-if="showDeleteModal"
      title="Confirmar Exclusão"
      message="Tem certeza que deseja deletar esta nota? Esta ação não pode ser desfeita."
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';
import { debounce } from 'lodash-es';
import NoteEditor from '@/components/NoteEditor.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';

const notes = ref([]);
const selectedNote = ref(null);
const saveStatus = ref('Salvo');
const showDeleteModal = ref(false);

const saveNote = debounce(async () => {
  if (!selectedNote.value) return;
  saveStatus.value = 'Salvando...';
  try {
    const { data: updatedNoteData } = await apiClient.put(`/notes/${selectedNote.value.id}`, {
      title: selectedNote.value.title || 'Nota sem título',
      content: selectedNote.value.content
    });
    
    const index = notes.value.findIndex(n => n.id === updatedNoteData.id);
    if (index !== -1) {
      notes.value[index].title = updatedNoteData.title;
      notes.value[index].updated_at = updatedNoteData.updated_at;
    }
    saveStatus.value = 'Salvo';
  } catch (error) { console.error("Erro ao salvar nota:", error); saveStatus.value = 'Falha ao salvar'; }
}, 1500);

const handleFieldUpdate = (field, value) => {
    if (selectedNote.value) {
        selectedNote.value[field] = value;
        saveStatus.value = 'Não salvo';
        saveNote();
    }
};

const confirmDelete = async () => {
    if (!selectedNote.value) return;
    try {
        await apiClient.delete(`/notes/${selectedNote.value.id}`);
        notes.value = notes.value.filter(n => n.id !== selectedNote.value.id);
        selectedNote.value = null;
        showDeleteModal.value = false;
    } catch (error) { console.error("Erro ao deletar nota:", error); }
};

const fetchNotes = async () => {
    try {
        const { data } = await apiClient.get('/notes');
        notes.value = data;
    } catch (error) { console.error("Erro ao buscar notas:", error); }
};

const selectNote = async (noteId) => {
    if (selectedNote.value && selectedNote.value.id === noteId) return;
    if (saveStatus.value !== 'Salvo') { saveNote.flush(); }
    try {
        const { data } = await apiClient.get(`/notes/${noteId}`);
        selectedNote.value = data;
        saveStatus.value = 'Salvo';
    } catch (error) { console.error("Erro ao selecionar nota:", error); }
};

const createNewNote = async () => {
    try {
        const { data: newNote } = await apiClient.post('/notes', {});
        notes.value.unshift(newNote);
        selectNote(newNote.id);
    } catch (error) { console.error("Erro ao criar nota:", error); }
};

onMounted(fetchNotes);
</script>

<style scoped>
.notes-view-container { 
  display: flex; 
  /* CORREÇÃO: Voltamos para height: 100% para remover a barra de rolagem principal */
  height: 100%;
  background: #fff; 
}
.notes-sidebar { 
  width: 300px; 
  background: #f8f9fa; 
  border-right: 1px solid #e9ecef; 
  display: flex; 
  flex-direction: column; 
  flex-shrink: 0;
  height: 100%;
}
.sidebar-header { 
  padding: 1rem; 
  border-bottom: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.nav-button {
  text-decoration: none; font-weight: bold; font-size: 0.9rem; padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid #6c757d; color: #6c757d; background-color: #fff; transition: all 0.2s ease-in-out; text-align: center;
}
.nav-button:hover { background-color: #e2e6ea; }
.new-note-btn { width: 100%; padding: 0.75rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
.new-note-btn:hover { background: #0056b3; }
.notes-list-container { overflow-y: auto; flex-grow: 1; }
.notes-list { list-style: none; padding: 0; margin: 0; }
.notes-list li { padding: 1rem; cursor: pointer; border-bottom: 1px solid #e9ecef; }
.notes-list li:hover { background: #e2e6ea; }
.notes-list li.active { background: #007bff; color: white; }
.notes-list li.active .note-date { color: rgba(255, 255, 255, 0.7); }
.note-title { display: block; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.note-date { font-size: 0.8rem; opacity: 0.7; }
.no-notes-found { text-align: center; padding: 2rem; color: #6c757d; }
.note-editor-area { 
  flex-grow: 1; 
  display: flex; 
  flex-direction: column;
  overflow: hidden; 
}
.no-note-selected { flex-grow: 1; display: flex; align-items: center; justify-content: center; color: #6c757d; font-size: 1.2rem; }
</style>