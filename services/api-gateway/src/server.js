require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');
const authRoutes = require('./routes/authRoutes');
const { verifyToken } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3020;

const corsOptions = {
  origin: 'http://localhost', // Em produção, mude para o seu domínio
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
    target: 'http://pdf-tools:3022',
    changeOrigin: true,
    pathRewrite: { '^/api/pdf-tools': '' },
});
app.use('/api/pdf-tools', verifyToken, pdfToolsProxy);

// Proxy Manual para Notes-Service
const notesProxyHandler = async (req, res) => {
    try {
        const microserviceUrl = `http://notes-service:3024${req.originalUrl.replace('/api', '')}`;
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
app.use('/api/notes', verifyToken, notesProxyHandler);

// Proxy Manual para Whiteboard-Service
const whiteboardProxyHandler = async (req, res) => {
    try {
        const microserviceUrl = `http://whiteboard-service:3025${req.originalUrl.replace('/api', '')}`;
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
app.use('/api/whiteboards', verifyToken, whiteboardProxyHandler);

// Proxy Manual para Tasks-Service
const tasksProxyHandler = async (req, res) => {
    try {
        const microserviceUrl = `http://tasks-service:3027${req.originalUrl.replace('/api', '')}`;
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
app.use('/api/board', verifyToken, tasksProxyHandler);
app.use('/api/tasks', verifyToken, tasksProxyHandler);
app.use('/api/lists', verifyToken, tasksProxyHandler);
app.use('/api/checklist', verifyToken, tasksProxyHandler);
app.use('/api/comments', verifyToken, tasksProxyHandler);


app.listen(PORT, () => {
    console.log(`API Gateway (production) rodando na porta ${PORT}`);
});