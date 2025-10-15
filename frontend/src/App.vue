<template>
  <div class="app-layout" :class="{ 'layout-full': !shouldShowLayout }">
    <TheHeader v-if="shouldShowLayout" />
    <div class="main-content">
      <RouterView />
    </div>
    <TheFooter v-if="shouldShowLayout" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import TheHeader from '@/components/TheHeader.vue';
import TheFooter from '@/components/TheFooter.vue';

const route = useRoute();

// O Header e Footer não devem aparecer na página de login
const shouldShowLayout = computed(() => route.name !== 'login');
</script>

<style>
/* Estilos globais */
body { 
  margin: 0; 
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
  background-color: #f0f2f5;
}

/* Layout principal */
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* Quando o layout principal não for exibido (ex: página de login) */
.app-layout.layout-full {
  display: block;
}

.main-content {
  flex-grow: 1;
  overflow-y: auto; /* Adiciona scroll somente ao conteúdo principal, se necessário */
}
</style>