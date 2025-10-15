/* eslint-env node */
module.exports = {
  // Define o ambiente do código (navegador, Node.js, etc.)
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  
  // A parte mais importante: estende as regras recomendadas para Vue 3
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential', // Pode ser 'vue3-recommended' para regras mais estritas
  ],
  
  // Define o parser para entender a sintaxe mais moderna do JavaScript
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  
  // Declara que estamos usando o plugin do Vue
  plugins: [
    'vue',
  ],

  // Aqui podemos adicionar ou sobrescrever regras específicas no futuro
  rules: {
    'vue/multi-word-component-names': 'off', // Desliga a regra que exige nomes de componente com múltiplas palavras
  },
};