<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo-container">
        <img src="@/assets/images/logo.png" alt="Tool-Box Logo" class="logo" />
        <span class="app-title">Tool-Box</span>
      </div>
      <div class="user-info">
        <span>Bem-vindo, {{ userEmail }}!</span>
        <button @click="handleLogout">Sair</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const userEmail = computed(() => authStore.user?.email || 'Usuário');

function handleLogout() {
  authStore.logout();
}
</script>

<style scoped>
.app-header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 2rem; /* Altura diminuída */
  flex-shrink: 0;
  z-index: 10;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}
.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.logo {
  height: 35px; /* Ajuste a altura do logo conforme necessário */
  width: auto;
}
.app-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}
button {
  padding: 0.4rem 0.8rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}
</style>