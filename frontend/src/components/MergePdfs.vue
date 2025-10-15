<template>
  <div class="merge-pdfs-tool tool-card"> <div class="card-header">
      <div class="header-content">
        <h3>Unir PDFs</h3>
        <p>Selecione múltiplos arquivos PDF. Arraste e solte as pré-visualizações para reordenar.</p>
      </div>
      <div class="actions">
        <button @click="triggerFileInput" class="action-btn secondary">Adicionar Arquivos</button>
        <button @click="mergePdfs" :disabled="isLoading || files.length < 2" class="action-btn primary">
            {{ isLoading ? 'Unindo...' : 'Unir PDFs' }}
        </button>
      </div>
    </div>

    <div class="card-content">
      <div 
        class="drop-zone"
        :class="{ 'drag-over': isDragOver, 'has-files': files.length > 0 }"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
      >
        <input type="file" ref="fileInput" @change="handleFileSelect" multiple accept=".pdf" style="display: none;" />
        
        <div v-if="files.length === 0" class="empty-state" @click="triggerFileInput">
          <p>Arraste e solte os arquivos PDF aqui ou clique para selecionar</p>
        </div>

        <draggable 
          v-model="files" 
          class="previews-grid"
          item-key="id"
          @start="isDragging = true"
          @end="isDragging = false"
        >
          <template #item="{ element, index }">
            <div class="pdf-preview-card">
              <div class="preview-index">{{ index + 1 }}</div>
              <canvas :ref="el => setCanvasRef(el, index)"></canvas>
              <div class="preview-name">{{ element.name }}</div>
              <button @click.stop="removeFile(index)" class="remove-btn">✖</button>
            </div>
          </template>
        </draggable>
      </div>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
// O <script setup> permanece o mesmo
import { ref, watch } from 'vue';
import axios from 'axios';
import draggable from 'vuedraggable';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

const files = ref([]);
const isDragOver = ref(false);
const isLoading = ref(false);
const error = ref(null);
const fileInput = ref(null);
const isDragging = ref(false);
let canvasRefs = [];

const setCanvasRef = (el, index) => { if (el) { canvasRefs[index] = el; } };

const renderPdfPreview = async (file, index) => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const pdf = await pdfjsLib.getDocument({ data: e.target.result }).promise;
      const page = await pdf.getPage(1);
      const canvas = canvasRefs[index];
      if (!canvas) return;
      const context = canvas.getContext('2d');
      const viewport = page.getViewport({ scale: 0.5 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport: viewport }).promise;
    } catch(err) { console.error("Erro ao renderizar preview do PDF:", err); }
  };
  reader.readAsArrayBuffer(file);
};

watch(files, (newFiles) => {
  canvasRefs = [];
  setTimeout(() => { newFiles.forEach((fileObj, index) => { renderPdfPreview(fileObj.file, index); }); }, 0);
}, { deep: true });

const addFiles = (fileList) => {
  error.value = null;
  const newFiles = Array.from(fileList).filter(file => file.type === 'application/pdf').map(file => ({ id: self.crypto.randomUUID(), file: file, name: file.name }));
  files.value.push(...newFiles);
};

const handleDrop = (event) => { isDragOver.value = false; addFiles(event.dataTransfer.files); };
const triggerFileInput = () => { fileInput.value.click(); };
const handleFileSelect = (event) => { addFiles(event.target.files); event.target.value = ''; };
const removeFile = (index) => { files.value.splice(index, 1); };

const mergePdfs = async () => {
  isLoading.value = true;
  error.value = null;
  const formData = new FormData();
  files.value.forEach(fileObj => { formData.append('files', fileObj.file); });
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Usuário não autenticado.');
    const response = await axios.post('/api/pdf-tools/merge', formData, { headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }, responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'unido.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    files.value = [];
  } catch (err) {
    console.error('ERRO ao juntar PDFs:', err);
    error.value = err.response?.data?.error || err.message || 'Falha ao processar arquivos.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Estilos ajustados para o layout de hub */
.tool-card { background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.card-header { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e9ecef; }
.card-header h3 { margin: 0; }
.card-header p { margin: 0; color: #6c757d; font-size: 0.9rem; }
.card-content { padding: 1.5rem; }
.actions { display: flex; gap: 1rem; }
.action-btn { padding: 0.75rem 1.5rem; border-radius: 4px; border: 1px solid; cursor: pointer; font-weight: bold; font-size: 0.9rem; }
.action-btn.primary { background-color: #007bff; color: white; border-color: #007bff; }
.action-btn.primary:disabled { background-color: #a0cfff; border-color: #a0cfff; cursor: not-allowed; }
.action-btn.secondary { background-color: #fff; color: #6c757d; border-color: #ccc; }
.drop-zone { border: 2px dashed #ccc; border-radius: 8px; padding: 1rem; cursor: pointer; min-height: 200px; }
.drop-zone.has-files { border-style: solid; }
.drop-zone.drag-over { background-color: #f0f8ff; border-color: #007bff; }
.previews-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; }
.pdf-preview-card { position: relative; border: 1px solid #ddd; border-radius: 4px; padding: 0.5rem; background: white; cursor: grab; }
.preview-index { position: absolute; top: 8px; left: 8px; background: rgba(0, 0, 0, 0.6); color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.remove-btn { position: absolute; top: 8px; right: 8px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 1rem; z-index: 10; }
.preview-name { font-size: 0.8rem; margin-top: 0.5rem; word-break: break-all; padding: 0 0.2rem; }
canvas { width: 100%; height: auto; border: 1px solid #eee; }
.empty-state { display: flex; align-items: center; justify-content: center; height: 160px; color: #777; font-weight: bold; }
.error-message { color: #dc3545; margin-top: 1rem; }
</style>