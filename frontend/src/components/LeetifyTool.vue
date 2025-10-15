<template>
  <div class="tool-card">
    <h3>Gerador Leetspeak</h3>
    <div class="card-content">
      <p class="description">Transforme uma palavra ou frase em uma senha mais forte usando substituições Leetspeak.</p>
      <div class="form-group">
        <label for="leet-input">Texto Original</label>
        <input type="text" id="leet-input" v-model="text" placeholder="ex: MinhaSenhaSuperSecreta" />
        <small :class="{ 'is-invalid': text.length > 0 && text.length < 12 }">
          Mínimo de 12 caracteres. ({{ text.length }}/12)
        </small>
      </div>
      <div class="checkbox-group">
          <label>
            <input type="checkbox" v-model="addExtraChars" /> Aumentar Segurança
            <small class="inline-desc">(adiciona símbolos e números extras ao final)</small>
          </label>
      </div>
    </div>
    
    <div class="card-actions">
      <button @click="processText" :disabled="isLoading || text.length < 12" class="action-button">
        {{ isLoading ? 'Convertendo...' : 'Converter' }}
      </button>
      <div v-if="result" class="result">
        <label>Resultado:</label>
        <input type="text" :value="result" readonly />
        <button @click="copyToClipboard" class="copy-btn" title="Copiar">📋</button>
      </div>
       <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const text = ref('');
const result = ref('');
const addExtraChars = ref(true); // Nova opção, habilitada por padrão
const isLoading = ref(false);
const error = ref(null);

const processText = async () => {
  isLoading.value = true;
  error.value = null;
  result.value = '';
  
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Usuário não autenticado.');

    // Adiciona a nova opção ao payload
    const payload = { 
      text: text.value,
      addExtraChars: addExtraChars.value 
    };

    const response = await axios.post('/api/password-generator/leetify', payload, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    result.value = response.data.leetText;
  } catch (err) {
    console.error(`ERRO ao converter para Leet:`, err);
    error.value = err.response?.data?.error || `Falha ao converter.`;
  } finally {
    isLoading.value = false;
  }
};

const copyToClipboard = () => {
  navigator.clipboard.writeText(result.value);
};
</script>

<style scoped>
.tool-card { display: flex; flex-direction: column; height: 100%; }
.card-content { flex-grow: 1; }
.card-actions { margin-top: auto; padding-top: 1rem; border-top: 1px solid #f0f0f0; }
h3 { margin-top: 0; }
.description { font-size: 0.9rem; color: #6c757d; margin-top: -0.5rem; margin-bottom: 1.5rem; }
input[type="text"] { width: 100%; box-sizing: border-box; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-family: inherit; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
.form-group small { display: block; font-size: 0.8rem; color: #777; margin-top: 0.25rem; }
.form-group small.is-invalid { color: #dc3545; font-weight: bold; }
.checkbox-group { margin-top: 1rem; }
.checkbox-group label { display: flex; align-items: center; gap: 0.5rem; }
.checkbox-group .inline-desc { color: #555; display: inline; }

.action-button { width: 100%; padding: 0.75rem; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
.action-button:disabled { background-color: #a0cfff; cursor: not-allowed; }
.result { margin-top: 1rem; display: flex; align-items: center; gap: 0.5rem; }
.result label { font-weight: bold; }
.result input { background-color: #f0f2f5; flex-grow: 1; }
.copy-btn { padding: 0.5rem; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
.error-message { color: #dc3545; margin-top: 1rem; }
</style>