<template>
  <div class="login-container">
    <div class="login-box">
      <img src="@/assets/images/logo.png" alt="Tool-Box Logo" class="login-logo" />
      <h2 class="login-title">Tool-Box</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required autocomplete="email" />
        </div>
        <div class="form-group">
          <label for="password">Senha</label>
          <input type="password" id="password" v-model="password" required autocomplete="current-password" />
        </div>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const authStore = useAuthStore();

async function handleLogin() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    await authStore.login(email.value, password.value);
  } catch (error) {
    errorMessage.value = error;
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.login-container { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  height: 100vh; 
  background-color: #f0f2f5; 
}
.login-box {
  padding: 2.5rem; 
  background: white; 
  border-radius: 8px; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
  width: 100%; 
  max-width: 400px;
  text-align: center;
}
.login-logo {
  height: 60px; /* Ajuste conforme necessário */
  margin-bottom: 1rem;
}
.login-title {
  margin-top: 0;
  margin-bottom: 2rem;
}
.form-group { 
  margin-bottom: 1.5rem; 
  text-align: left;
}
label { 
  display: block; 
  margin-bottom: 0.5rem; 
  font-weight: bold; 
}
input { 
  width: 100%; 
  padding: 0.75rem; 
  border: 1px solid #ccc; 
  border-radius: 4px; 
  box-sizing: border-box; 
}
button { 
  width: 100%; 
  padding: 0.75rem; 
  background-color: #007bff; 
  color: white; 
  border: none; 
  border-radius: 4px; 
  cursor: pointer; 
  font-size: 1rem; 
  font-weight: bold;
}
button:disabled { 
  background-color: #a0cfff; 
}
.error-message { 
  color: #dc3545; 
  margin-bottom: 1rem; 
}
</style>