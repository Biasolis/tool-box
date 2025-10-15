require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Aumentado o limite para notas grandes
const PORT = process.env.PORT || 3024;

const getUserId = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) { return res.status(401).json({ error: 'Identificação de usuário ausente.' }); }
    req.userId = userId;
    next();
};

app.get('/notes', getUserId, async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, title, updated_at FROM notes WHERE user_id = $1 ORDER BY updated_at DESC', [req.userId]);
        res.status(200).json(rows);
    } catch (error) { res.status(500).json({ error: 'Falha ao buscar notas.' }); }
});

app.get('/notes/:id', getUserId, async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query('SELECT * FROM notes WHERE id = $1 AND user_id = $2', [id, req.userId]);
        if (rows.length === 0) { return res.status(404).json({ error: 'Nota não encontrada.' }); }
        res.status(200).json(rows[0]);
    } catch (error) { res.status(500).json({ error: 'Falha ao buscar nota.' }); }
});

app.post('/notes', getUserId, async (req, res) => {
    try {
        // MUDANÇA: Agora o conteúdo padrão é uma string vazia ''.
        const { rows } = await db.query(
            'INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
            [req.userId, '', ''] 
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Erro ao criar nota:', error);
        res.status(500).json({ error: 'Falha ao criar nota.' });
    }
});

app.put('/notes/:id', getUserId, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const { rows } = await db.query(
            'UPDATE notes SET title = $1, content = $2 WHERE id = $3 AND user_id = $4 RETURNING id, title, updated_at',
            // Garante que o conteúdo seja sempre uma string
            [title, String(content || ''), id, req.userId]
        );
        if (rows.length === 0) { return res.status(404).json({ error: 'Nota não encontrada para atualizar.' }); }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar nota:', error);
        res.status(500).json({ error: 'Falha ao atualizar nota.' });
    }
});

app.delete('/notes/:id', getUserId, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM notes WHERE id = $1 AND user_id = $2', [id, req.userId]);
        if (result.rowCount === 0) { return res.status(404).json({ error: 'Nota não encontrada para deletar.' }); }
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar nota:', error);
        res.status(500).json({ error: 'Falha ao deletar nota.' });
    }
});

app.listen(PORT, () => {
    console.log(`Microsserviço Notes-Service rodando em http://localhost:${PORT}`);
});