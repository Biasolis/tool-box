<template>
  <div class="dashboard-container">
    <main class="tools-grid">
      <router-link to="/tools/pdf-tools" class="tool-card-link">
        <div class="tool-card">
          <h3>Ferramentas de PDF</h3>
          <p>Unir, separar, converter e muito mais. Clique para acessar.</p>
          <span class="card-action-button">Acessar Ferramenta</span>
        </div>
      </router-link>
      <router-link to="/tools/notes" class="tool-card-link">
        <div class="tool-card">
          <h3>Bloco de Notas</h3>
          <p>Crie e edite notas com um editor de texto rico, no estilo Notion. Suas anotações são salvas automaticamente.</p>
          <span class="card-action-button">Acessar Bloco de Notas</span>
        </div>
      </router-link>
      <router-link to="/tools/whiteboard" class="tool-card-link">
        <div class="tool-card">
          <h3>Lousa Digital</h3>
          <p>Desenhe, escreva e adicione formas em uma lousa interativa. Suas ideias são salvas automaticamente.</p>
          <span class="card-action-button">Acessar Lousa</span>
        </div>
      </router-link>
      <router-link to="/tools/tasks" class="tool-card-link">
        <div class="tool-card">
          <h3>Tarefas (Kanban)</h3>
          <p>Organize suas tarefas em um quadro Kanban visual, movendo cartões entre colunas.</p>
          <span class="card-action-button">Acessar Tarefas</span>
        </div>
      </router-link>
    </main>
  </div>
</template>

<script setup>
// Sem scripts necessários
</script>

<style scoped>
.dashboard-container { padding: 2rem; width: 100%; max-width: 1400px; margin: 0 auto; box-sizing: border-box; }
main.tools-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; align-items: stretch; }
@media (max-width: 1200px) { main.tools-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { main.tools-grid { grid-template-columns: 1fr; } }
.tool-card-link { text-decoration: none; color: inherit; display: flex; }
.tool-card { background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; min-height: 250px; }
.tool-card p { flex-grow: 1; color: #555; margin-top: 1rem; margin-bottom: 1.5rem; }
.card-action-button { width: 100%; box-sizing: border-box; display: inline-block; margin-top: auto; padding: 0.75rem 1.5rem; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; text-align: center; font-size: 1rem; transition: background-color 0.2s; }
.card-action-button:hover { background-color: #0056b3; }
</style>