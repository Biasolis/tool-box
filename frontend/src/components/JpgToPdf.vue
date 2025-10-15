<template>
  <div class="tool-card">
    <div class="card-header">
      <h3>JPG para PDF</h3>
      <p>Converta uma ou mais imagens JPG em um único arquivo PDF.</p>
    </div>

    <div class="card-content">
      <div v-if="files.length === 0" class="file-input-area" @click="triggerFileInput">
        <input type="file" ref="fileInput" @change="handleFileSelect" multiple accept="image/jpeg" style="display: none;" />
        <button class="action-btn secondary">Escolher arquivos</button>
        <span>Nenhum arquivo escolhido</span>
      </div>
      <div v-else class="file-list-area">
        <ul>
          <li v-for="(file, index) in files" :key="file.name + index">
            <span>{{ file.name }}</span>
            <button @click="removeFile(index)" class="remove-btn">✖</button>
          </li>
        </ul>
      </div>
    </div>
    
    <div class="card-footer">
      <button @click="convertToPdf" :disabled="isLoading || files.length === 0" class="action-btn primary">
        {{ isLoading ? 'Convertendo...' : 'Converter para PDF' }}
      </button>
    </div>
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const files = ref([]);
const isLoading = ref(false);
const error = ref(null);
const fileInput = ref(null);

const triggerFileInput = () => fileInput.value.click();
const removeFile = (index) => files.value.splice(index, 1);

const handleFileSelect = (event) => {
  error.value = null;
  const newFiles = Array.from(event.target.files);
  files.value.push(...newFiles);
  event.target.value = '';
};

const convertToPdf = async () => {
  if (files.value.length === 0) return;
  isLoading.value = true;
  error.value = null;

  const formData = new FormData();
  files.value.forEach(file => {
    formData.append('files', file);
  });

  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Usuário não autenticado.');

    const response = await axios.post('/api/pdf-tools/jpg-to-pdf', formData, {
      headers: { 'Authorization': `Bearer ${token}` },
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'convertido.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    files.value = [];

  } catch (err) {
    console.error('ERRO ao converter para PDF:', err);
    error.value = err.response?.data?.error || err.message || 'Falha ao processar arquivo.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Reutilizando estilos consistentes */
.tool-card { background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden; display: flex; flex-direction: column; }
.card-header { padding: 1.5rem; }
.card-header h3 { margin: 0 0 0.5rem 0; }
.card-header p { margin: 0; color: #6c757d; font-size: 0.9rem; }
.card-content { padding: 1.5rem; flex-grow: 1; border-top: 1px solid #e9ecef; border-bottom: 1px solid #e9ecef; }
.file-input-area { display: flex; align-items: center; justify-content: center; gap: 1rem; cursor: pointer; }
.file-input-area span { color: #6c757d; }
.file-list-area ul { list-style: none; padding: 0; margin: 0; max-height: 150px; overflow-y: auto; }
.file-list-area li { display: flex; justify-content: space-between; align-items: center; background: #f8f9fa; padding: 0.5rem; border-radius: 4px; margin-bottom: 0.5rem; font-size: 0.9rem;}
.card-footer { padding: 1rem 1.5rem; display: flex; justify-content: flex-end; }
.remove-btn { background: none; border: none; color: red; cursor: pointer; font-size: 1rem; }
.error-message { color: #dc3545; padding: 0 1.5rem 1rem 1.5rem; }

.action-btn { padding: 0.75rem 1.5rem; border-radius: 4px; border: 1px solid; cursor: pointer; font-weight: bold; font-size: 0.9rem; }
.action-btn.primary { background-color: #dc3545; color: white; border-color: #dc3545; } /* Cor Vermelha */
.action-btn.primary:hover { background-color: #c82333; border-color: #c82333; }
.action-btn.primary:disabled { background-color: #f5c6cb; border-color: #f5c6cb; cursor: not-allowed; }
.action-btn.secondary { background-color: #fff; color: #6c757d; border-color: #ccc; }
.action-btn.secondary:hover { background-color: #f8f9fa; }
</style>