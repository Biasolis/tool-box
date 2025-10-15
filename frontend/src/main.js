import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// --- Início da Configuração do PDF.js ---
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
// Alterado de pdf.worker.js para pdf.worker.mjs
import PdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Define globalmente onde a biblioteca deve encontrar seu worker.
pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker;
// --- Fim da Configuração do PDF.js ---

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')