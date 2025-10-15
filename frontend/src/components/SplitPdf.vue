<template>
  <div class="tool-card">
    <div class="card-header">
      <h3>Separar PDF</h3>
      <p>Extrai todas as páginas de um PDF em arquivos separados (em um .zip).</p>
    </div>

    <div class="card-content">
      <div v-if="!file" class="file-input-area" @click="triggerFileInput">
        <input type="file" ref="fileInput" @change="handleFileSelect" accept=".pdf" style="display: none;" />
        <button class="action-btn secondary">Escolher arquivo</button>
        <span>Nenhum arquivo escolhido</span>
      </div>
      <div v-else class="file-selected-area">
        <span>{{ file.name }}</span>
        <button @click="clearFile" class="remove-btn">✖</button>
      </div>
    </div>
    
    <div class="card-footer">
      <button @click="splitPdf" :disabled="isLoading || !file" class="action-btn primary">
        {{ isLoading ? 'Separando...' : 'Separar Páginas' }}
      </button>
    </div>
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const file = ref(null);
const isLoading = ref(false);
const error = ref(null);
const fileInput = ref(null);

const triggerFileInput = () => fileInput.value.click();
const clearFile = () => file.value = null;

const handleFileSelect = (event) => {
  error.value = null;
  if (event.target.files.length > 0) {
    file.value = event.target.files[0];
  }
  event.target.value = '';
};

const splitPdf = async () => {
  if (!file.value) return;
  isLoading.value = true;
  error.value = null;

  const formData = new FormData();
  formData.append('file', file.value);

  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Usuário não autenticado.');

    const response = await axios.post('/api/pdf-tools/split', formData, {
      headers: { 'Authorization': `Bearer ${token}` },
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'paginas_separadas.zip');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    file.value = null;

  } catch (err) {
    console.error('ERRO ao separar PDF:', err);
    error.value = err.response?.data?.error || err.message || 'Falha ao processar arquivo.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Usando estilos semelhantes ao MergePdfs para consistência */
.tool-card { background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden; display: flex; flex-direction: column; }
.card-header { padding: 1.5rem; }
.card-header h3 { margin: 0 0 0.5rem 0; }
.card-header p { margin: 0; color: #6c757d; font-size: 0.9rem; }
.card-content { padding: 1.5rem; flex-grow: 1; display: flex; align-items: center; justify-content: center; border-top: 1px solid #e9ecef; border-bottom: 1px solid #e9ecef; }
.file-input-area, .file-selected-area { display: flex; align-items: center; gap: 1rem; }
.file-input-area span { color: #6c757d; }
.file-selected-area { background: #f0f2f5; padding: 0.5rem 1rem; border-radius: 4px; }
.card-footer { padding: 1rem 1.5rem; display: flex; justify-content: flex-end; }
.remove-btn { background: none; border: none; color: red; cursor: pointer; font-size: 1rem; }
.error-message { color: #dc3545; padding: 0 1.5rem 1rem 1.5rem; }

.action-btn { padding: 0.75rem 1.5rem; border-radius: 4px; border: 1px solid; cursor: pointer; font-weight: bold; font-size: 0.9rem; transition: background-color 0.2s, color 0.2s; }
.action-btn.primary { background-color: #17a2b8; color: white; border-color: #17a2b8; } /* Cor azul-petróleo para diferenciar */
.action-btn.primary:hover { background-color: #138496; border-color: #138496; }
.action-btn.primary:disabled { background-color: #88d9e6; border-color: #88d9e6; cursor: not-allowed; }
.action-btn.secondary { background-color: #fff; color: #6c757d; border-color: #ccc; }
.action-btn.secondary:hover { background-color: #f8f9fa; }
</style>