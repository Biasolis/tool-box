import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import router from '@/router';

// O axios usará o proxy do vite.config.js para as chamadas /api
const apiClient = axios.create({ baseURL: '/api' });

export const useAuthStore = defineStore('auth', () => {
    // State
    const token = ref(localStorage.getItem('token') || null);
    const user = ref(JSON.parse(localStorage.getItem('user')) || null);

    // Adiciona o token aos cabeçalhos de todas as requisições se ele existir
    if (token.value) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    }

    // Getters
    const isAuthenticated = computed(() => !!token.value);

    // Actions
    async function login(email, password) {
        try {
            const { data } = await apiClient.post('/auth/login', { email, password });
            
            // Armazena no state
            token.value = data.token;
            user.value = data.user;

            // Armazena no localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Adiciona o token ao cabeçalho do axios para futuras requisições
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            
            // Redireciona para o dashboard
            router.push('/dashboard');
        } catch (error) {
            // Lança o erro para ser tratado no componente
            throw error.response.data.error || 'Erro desconhecido no login.';
        }
    }

    function logout() {
        token.value = null;
        user.value = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete apiClient.defaults.headers.common['Authorization'];
        router.push('/login');
    }

    return { token, user, isAuthenticated, login, logout };
});