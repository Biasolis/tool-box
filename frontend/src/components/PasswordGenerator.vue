<template>
  <div class="tool-card">
    <h3>Gerador de Senhas</h3>
    
    <div class="card-content">
      <div class="type-selector">
        <label>
          <input type="radio" value="random" v-model="passwordType" />
          Aleatória (ex: 4#gT7!pX)
        </label>
        <label>
          <input type="radio" value="leet" v-model="passwordType" />
          Modo Segurança (ex: T3rm1n@l55)
        </label>
      </div>

      <div v-if="passwordType === 'random'" class="options">
        <div class="form-group">
          <label for="randomLength">Comprimento da Senha: {{ randomOptions.length }}</label>
          <input type="range" id="randomLength" min="8" max="64" v-model.number="randomOptions.length" />
        </div>
        <div class="checkbox-group">
          <label><input type="checkbox" v-model="randomOptions.includeUppercase" /> Maiúsculas (A-Z)</label>
          <label><input type="checkbox" v-model="randomOptions.includeNumbers" /> Números (0-9)</label>
          <label><input type="checkbox" v-model="randomOptions.includeSymbols" /> Símbolos (!@#...)</label>
        </div>
      </div>

      <div v-if="passwordType === 'leet'" class="options">
        <div class="form-group">
          <label for="secureLength">Comprimento Mínimo: {{ secureOptions.length }}</label>
          <input type="range" id="secureLength" min="12" max="32" v-model.number="secureOptions.length" />
          <small>A senha final pode ser um pouco maior.</small>
        </div>
      </div>
    </div>

    <div class="card-actions">
      <button @click="generatePassword" :disabled="isLoading" class="generate-button">
        {{ isLoading ? 'Gerando...' : 'Gerar Senha' }}
      </button>
      
      <div v-if="generatedPassword" class="result">
        <input type="text" :value="generatedPassword" readonly />
        <button @click="copyToClipboard">{{ copyButtonText }}</button>
      </div>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
// O <script setup> permanece exatamente o mesmo, sem alterações.
import { ref, reactive } from 'vue';
import axios from 'axios';

const passwordType = ref('random');

const randomOptions = reactive({
  length: 16,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: true,
});

const secureOptions = reactive({
  length: 12,
  addNumberSuffix: true,
});

const isLoading = ref(false);
const error = ref(null);
const generatedPassword = ref('');
const copyButtonText = ref('Copiar');

const generatePassword = async () => {
  isLoading.value = true;
  error.value = null;
  generatedPassword.value = '';
  copyButtonText.value = 'Copiar';

  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Usuário não autenticado.');

    const payload = {
      type: passwordType.value,
      ...(passwordType.value === 'random' ? randomOptions : secureOptions)
    };
    
    const response = await axios.post('/api/password-generator/generate', payload, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    generatedPassword.value = response.data.password;
  } catch (err) {
    console.error('ERRO ao gerar senha:', err);
    error.value = err.response?.data?.error || err.message || 'Falha ao processar senha.';
  } finally {
    isLoading.value = false;
  }
};

const copyToClipboard = () => {
  navigator.clipboard.writeText(generatedPassword.value).then(() => {
    copyButtonText.value = 'Copiado!';
    setTimeout(() => { copyButtonText.value = 'Copiar'; }, 2000);
  });
};
</script>

<style scoped>
.tool-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.card-content {
  flex-grow: 1;
}
.card-actions {
  margin-top: auto;
  /* --- ADICIONADO: Espaçamento e uma linha sutil de separação --- */
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}
h3 {
  margin-top: 0;
}
.type-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}
.options { margin-top: 1.5rem; }
.form-group { margin-bottom: 1rem; }
.form-group small {
  display: block;
  font-size: 0.8rem;
  color: #777;
  margin-top: 0.25rem;
}
.checkbox-group { display: flex; flex-direction: column; gap: 1rem; } /* Aumentado o gap para mais espaço */
input[type="range"] { width: 100%; }
.result { display: flex; margin-top: 1rem; }
.result input { flex-grow: 1; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px 0 0 4px; background: #f0f2f5; font-family: monospace; }
.result button { padding: 0.5rem 1rem; border-radius: 0 4px 4px 0; border: 1px solid #ccc; border-left: 0; cursor: pointer; }
.error-message { color: #dc3545; margin-top: 1rem; }

</style>