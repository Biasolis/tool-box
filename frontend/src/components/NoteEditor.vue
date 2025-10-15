<template>
  <div class="editor-container" v-if="note">
    <div class="editor-header">
      <input 
        type="text" 
        :value="note.title" 
        @input="$emit('update:title', $event.target.value)" 
        class="title-input" 
        placeholder="Título da Nota" 
      />
      <div class="header-actions">
        <span class="save-status" :class="statusColor">{{ saveStatus }}</span>
        <button @click="$emit('request-delete')" class="delete-btn">Deletar</button>
      </div>
    </div>
    
    <QuillEditor 
      theme="snow"
      :content="note.content || ''"
      @update:content="$emit('update:content', $event)"
      :toolbar="toolbarOptions"
      contentType="html"
      class="quill-editor"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import 'quill-better-table/dist/quill-better-table.css';

const props = defineProps({
  note: Object,
  saveStatus: String,
});

defineEmits(['update:title', 'update:content', 'request-delete']);

const toolbarOptions = [
  [{ 'header': [1, 2, 3, false] }],
  [{ 'size': ['small', false, 'large', 'huge'] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  ['link', 'image', 'table'],
  ['clean']
];

const statusColor = computed(() => {
  if (props.saveStatus === 'Salvando...') return 'is-saving';
  if (props.saveStatus === 'Não salvo') return 'is-unsaved';
  return 'is-saved';
});
</script>

<style scoped>
.editor-container { 
  display: flex; 
  flex-direction: column; 
  height: 100%; 
  background-color: #fff;
  overflow: hidden; 
}

.editor-header { 
  padding: 1rem 2rem; 
  border-bottom: 1px solid #e9ecef; 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  gap: 1rem; 
  flex-shrink: 0;
}
.title-input { font-size: 1.5rem; font-weight: bold; border: none; outline: none; width: 100%; }
.header-actions { display: flex; align-items: center; gap: 1rem; flex-shrink: 0; }
.delete-btn { background-color: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.save-status { font-size: 0.9rem; font-weight: bold; transition: color 0.3s; width: 100px; text-align: right; }
.save-status.is-saved { color: #6c757d; }
.save-status.is-unsaved { color: #fd7e14; }
.save-status.is-saving { color: #007bff; }

.quill-editor {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
}

:deep(.ql-toolbar) {
  flex-shrink: 0;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
}

:deep(.ql-container) {
  flex-grow: 1;
  overflow-y: auto;
  border: none !important;
}

:deep(.ql-editor) { 
  background-color: #fff; 
  font-size: 1rem; 
  line-height: 1.6; 
  padding: 1.5rem 2rem;
}
:deep(.ql-editor.ql-blank::before) { content: 'Comece a escrever sua nota aqui...'; font-style: normal; color: #aaa; left: 2rem; }
</style>