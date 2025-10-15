import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

// Cria uma instância do axios com a URL base da nossa API
const apiClient = axios.create({
  baseURL: '/api'
});

// Isso é um "interceptor". Ele executa um código ANTES de cada requisição ser enviada.
apiClient.interceptors.request.use(
  (config) => {
    // Pega o store de autenticação
    const authStore = useAuthStore();
    const token = authStore.token;

    // Se o token existir, o anexa ao cabeçalho Authorization
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
