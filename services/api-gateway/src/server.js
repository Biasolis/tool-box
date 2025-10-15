require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');
const authRoutes = require('./routes/authRoutes');
const { verifyToken } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '20mb' }));

app.use('/api/auth', authRoutes);
app.get('/api/user/profile', verifyToken, (req, res) => {
    res.json({ message: 'Acesso a rota protegida concedido!', user: req.user });
});

// Proxy para PDF-Tools (upload de arquivos)
const pdfToolsProxy = createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^/api/pdf-tools': '' },
});
app.use('/api/pdf-tools', verifyToken, pdfToolsProxy);

// Proxy Manual para Notes-Service
const notesProxyHandler = async (req, res) => {
    try {
        const microserviceUrl = `http://localhost:3004${req.originalUrl.replace('/api', '')}`;
        const response = await axios({
            method: req.method, url: microserviceUrl, data: req.body,
            headers: { 'x-user-id': req.user.id }
        });
        if (response.status === 204) { return res.status(204).send(); }
        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) { return res.status(error.response.status).json(error.response.data); }
        res.status(502).json({ error: 'Bad Gateway', message: 'Não foi possível se comunicar com o notes-service.' });
    }
};
app.get('/api/notes', verifyToken, notesProxyHandler);
app.post('/api/notes', verifyToken, notesProxyHandler);
app.get('/api/notes/:id', verifyToken, notesProxyHandler);
app.put('/api/notes/:id', verifyToken, notesProxyHandler);
app.delete('/api/notes/:id', verifyToken, notesProxyHandler);

// Proxy Manual para Whiteboard-Service
const whiteboardProxyHandler = async (req, res) => {
    try {
        const microserviceUrl = `http://localhost:3005${req.originalUrl.replace('/api', '')}`;
        const response = await axios({
            method: req.method, url: microserviceUrl, data: req.body,
            headers: { 'x-user-id': req.user.id }
        });
        if (response.status === 204) { return res.status(204).send(); }
        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) { return res.status(error.response.status).json(error.response.data); }
        res.status(502).json({ error: 'Bad Gateway', message: 'Não foi possível se comunicar com o whiteboard-service.' });
    }
};
app.get('/api/whiteboards', verifyToken, whiteboardProxyHandler);
app.post('/api/whiteboards', verifyToken, whiteboardProxyHandler);
app.get('/api/whiteboards/:id', verifyToken, whiteboardProxyHandler);
app.put('/api/whiteboards/:id', verifyToken, whiteboardProxyHandler);
app.delete('/api/whiteboards/:id', verifyToken, whiteboardProxyHandler);

// Proxy Manual para Tasks-Service
const tasksProxyHandler = async (req, res) => {
    try {
        const microserviceUrl = `http://localhost:3007${req.originalUrl.replace('/api', '')}`;
        const response = await axios({
            method: req.method, url: microserviceUrl, data: req.body,
            headers: { 'x-user-id': req.user.id }
        });
        if (response.status === 204) { return res.status(204).send(); }
        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) { return res.status(error.response.status).json(error.response.data); }
        res.status(502).json({ error: 'Bad Gateway', message: 'Não foi possível se comunicar com o tasks-service.' });
    }
};
app.get('/api/board', verifyToken, tasksProxyHandler);
app.post('/api/tasks', verifyToken, tasksProxyHandler);
app.put('/api/tasks/:id/move', verifyToken, tasksProxyHandler);
app.put('/api/tasks/:id', verifyToken, tasksProxyHandler);
app.delete('/api/tasks/:id', verifyToken, tasksProxyHandler);
app.post('/api/lists', verifyToken, tasksProxyHandler);
app.put('/api/lists/:id', verifyToken, tasksProxyHandler);
app.delete('/api/lists/:id', verifyToken, tasksProxyHandler);
app.post('/api/tasks/:id/checklist', verifyToken, tasksProxyHandler);
app.put('/api/checklist/:itemId', verifyToken, tasksProxyHandler);
app.post('/api/tasks/:id/comments', verifyToken, tasksProxyHandler);


app.listen(PORT, () => {
    console.log(`API Gateway (local) rodando em http://localhost:${PORT}`);
});