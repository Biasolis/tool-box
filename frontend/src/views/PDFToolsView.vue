<template>
  <div class="tool-page-container">
    
    <header class="page-header">
      <router-link to="/dashboard" class="nav-button">&larr; Voltar ao Dashboard</router-link>
      <a href="https://pdf-tools.consorciomagalu.com.br/" target="_blank" rel="noopener noreferrer" class="nav-button primary">
        Acessar Ferramenta Original ↗
      </a>
    </header>

    <main class="tools-hub">
      <MergePdfs class="hub-item-full" />

      <JpgToPdf class="hub-item" />
      <PngToPdf class="hub-item" />
      <SplitPdf class="hub-item" />
      
      </main>
  </div>
</template>

<script setup>
import MergePdfs from '@/components/MergePdfs.vue';
import SplitPdf from '@/components/SplitPdf.vue';
import JpgToPdf from '@/components/JpgToPdf.vue';
import PngToPdf from '@/components/PngToPdf.vue';
</script>

<style scoped>
.tool-page-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
}

/* --- ESTILOS DO NOVO CABEÇALHO --- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.nav-button {
  text-decoration: none;
  font-weight: bold;
  font-size: 0.9rem;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  border: 1px solid #007bff;
  color: #007bff;
  background-color: #fff;
  transition: all 0.2s ease-in-out;
}

.nav-button:hover {
  background-color: #f0f8ff;
}

.nav-button.primary {
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
}

.nav-button.primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}
/* --- FIM DOS ESTILOS DO CABEÇALHO --- */


.tools-hub {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 2rem;
}

.hub-item-full {
  grid-column: 1 / -1;
}
</style>