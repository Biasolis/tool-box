require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));
const PORT = process.env.PORT || 3005;

const getUserId = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) { return res.status(401).json({ error: 'Identificação de usuário ausente.' }); }
    req.userId = userId;
    next();
};

// Listar todas as lousas do usuário
app.get('/whiteboards', getUserId, async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, name, updated_at FROM whiteboards WHERE owner_id = $1 ORDER BY updated_at DESC', [req.userId]);
        res.status(200).json(rows);
    } catch (err) { res.status(500).json({ error: 'Falha ao buscar lousas.' }); }
});

// Criar uma nova lousa
app.post('/whiteboards', getUserId, async (req, res) => {
    try {
        const { name } = req.body;
        const { rows } = await db.query(
            'INSERT INTO whiteboards (owner_id, name) VALUES ($1, $2) RETURNING *',
            [req.userId, name || 'Nova Lousa']
        );
        res.status(201).json(rows[0]);
    } catch (err) { res.status(500).json({ error: 'Falha ao criar lousa.' }); }
});

// Buscar uma lousa específica
app.get('/whiteboards/:id', getUserId, async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query('SELECT * FROM whiteboards WHERE id = $1 AND owner_id = $2', [id, req.userId]);
        if (rows.length === 0) { return res.status(404).json({ error: 'Lousa não encontrada.' }); }
        res.status(200).json(rows[0]);
    } catch (err) { res.status(500).json({ error: 'Falha ao buscar lousa.' }); }
});

// Atualizar (salvar) uma lousa
app.put('/whiteboards/:id', getUserId, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, content } = req.body;
        const { rows } = await db.query(
            'UPDATE whiteboards SET name = $1, content = $2 WHERE id = $3 AND owner_id = $4 RETURNING id, name, updated_at',
            [name, content, id, req.userId]
        );
        if (rows.length === 0) { return res.status(404).json({ error: 'Lousa não encontrada.' }); }
        res.status(200).json(rows[0]);
    } catch (err) { res.status(500).json({ error: 'Falha ao salvar lousa.' }); }
});

// ROTA PARA DELETAR UMA LOUSA
app.delete('/whiteboards/:id', getUserId, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM whiteboards WHERE id = $1 AND owner_id = $2', [id, req.userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Lousa não encontrada para deletar.' });
        }
        res.status(204).send(); // Sucesso, sem conteúdo para retornar
    } catch (err) {
        console.error('Erro ao deletar lousa:', err);
        res.status(500).json({ error: 'Falha ao deletar lousa.' });
    }
});


app.listen(PORT, () => {
    console.log(`Microsserviço Whiteboard-Service rodando em http://localhost:${PORT}`);
});