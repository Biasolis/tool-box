import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import DashboardView from '@/views/DashboardView.vue';
import PDFToolsView from '@/views/PDFToolsView.vue';
import NotesView from '@/views/NotesView.vue';
import WhiteboardView from '@/views/WhiteboardView.vue';
import TasksView from '@/views/TasksView.vue';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/tools/pdf-tools', name: 'pdf-tools', component: PDFToolsView, meta: { requiresAuth: true } },
    { path: '/tools/notes', name: 'notes', component: NotesView, meta: { requiresAuth: true } },
    { path: '/tools/whiteboard', name: 'whiteboard', component: WhiteboardView, meta: { requiresAuth: true } },
    { path: '/tools/tasks', name: 'tasks', component: TasksView, meta: { requiresAuth: true } },
    { path: '/', redirect: to => { const auth = useAuthStore(); return auth.isAuthenticated ? '/dashboard' : '/login'; } }
  ]
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router;