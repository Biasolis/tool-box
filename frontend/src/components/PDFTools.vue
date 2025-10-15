<template>
  <div class="tool-page-container">
    <router-link to="/dashboard" class="back-link">&larr; Voltar ao Dashboard</router-link>
    <header class="page-title-header">
      <h1>Ferramentas de PDF</h1>
      <p>Selecione uma das ferramentas abaixo para começar.</p>
    </header>
    <main>
      <MergePdfs />
    </main>
  </div>
</template>

<script setup>
import MergePdfs from '@/components/MergePdfs.vue';
</script>

<style scoped>
.tool-page-container {
  width: 100%;
  max-width: 1200px; /* Largura mais contida para a ferramenta */
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
}
.back-link {
  text-decoration: none;
  color: #007bff;
  font-weight: bold;
  display: inline-block;
  margin-bottom: 2rem; /* Mais espaço abaixo do link */
}
.page-title-header {
  margin-bottom: 2rem;
}
.page-title-header h1 {
  margin: 0 0 0.5rem 0;
}
.page-title-header p {
  margin: 0;
  color: #6c757d;
}
</style>s