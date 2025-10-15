require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3007;

// Middleware para extrair o ID do usuário
const getUserId = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) { return res.status(401).json({ error: 'Identificação de usuário ausente.' }); }
    req.userId = userId;
    next();
};

// --- ROTA DE PROJETO (QUADRO) ---
app.get('/board', getUserId, async (req, res) => {
    try {
        let projectResult = await db.query('SELECT * FROM task_projects WHERE owner_id = $1 LIMIT 1', [req.userId]);
        let project = projectResult.rows[0];

        if (!project) {
            projectResult = await db.query('INSERT INTO task_projects (owner_id, name) VALUES ($1, $2) RETURNING *', [req.userId, 'Meu Primeiro Projeto']);
            project = projectResult.rows[0];
            const defaultLists = ['A Fazer', 'Em Andamento', 'Concluído'];
            for (let i = 0; i < defaultLists.length; i++) {
                await db.query('INSERT INTO task_lists (project_id, name, position) VALUES ($1, $2, $3)', [project.id, defaultLists[i], i]);
            }
        }
        
        const listsResult = await db.query('SELECT * FROM task_lists WHERE project_id = $1 ORDER BY position', [project.id]);
        
        const tasksResult = await db.query(
            'SELECT tasks.* FROM tasks JOIN task_lists ON tasks.list_id = task_lists.id WHERE task_lists.project_id = $1 ORDER BY tasks.position',
            [project.id]
        );
        
        const checklistItemsResult = await db.query('SELECT i.* FROM task_checklist_items i JOIN tasks t ON i.task_id = t.id JOIN task_lists l ON t.list_id = l.id WHERE l.project_id = $1 ORDER BY i.position', [project.id]);
        const commentsResult = await db.query('SELECT c.*, u.email as user_email FROM task_comments c JOIN users u ON c.user_id = u.id JOIN tasks t ON c.task_id = t.id JOIN task_lists l ON t.list_id = l.id WHERE l.project_id = $1 ORDER BY c.created_at ASC', [project.id]);
        
        const tasksWithDetails = tasksResult.rows.map(task => ({
            ...task,
            checklist: checklistItemsResult.rows.filter(item => item.task_id === task.id),
            comments: commentsResult.rows.filter(comment => comment.task_id === task.id),
        }));

        const board = {
            ...project,
            lists: listsResult.rows.map(list => ({
                ...list,
                tasks: tasksWithDetails.filter(task => task.list_id === list.id)
            }))
        };
        
        res.status(200).json(board);
    } catch (err) {
        console.error('Erro ao buscar o quadro:', err);
        res.status(500).json({ error: 'Falha ao buscar o quadro.' });
    }
});

// --- ROTAS DE LISTAS (COLUNAS/LANES) ---
app.post('/lists', getUserId, async (req, res) => {
    try {
        const { project_id, name, position } = req.body;
        const { rows } = await db.query('INSERT INTO task_lists (project_id, name, position) VALUES ($1, $2, $3) RETURNING *', [project_id, name, position]);
        res.status(201).json(rows[0]);
    } catch (err) { res.status(500).json({ error: 'Falha ao criar a lista.' }); }
});

app.put('/lists/:id', getUserId, async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const { rows } = await db.query('UPDATE task_lists SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
        res.status(200).json(rows[0]);
    } catch (err) { res.status(500).json({ error: 'Falha ao atualizar a lista.' }); }
});

app.delete('/lists/:id', getUserId, async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM task_lists WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) { res.status(500).json({ error: 'Falha ao deletar a lista.' }); }
});

// --- ROTAS DE TAREFAS ---
app.post('/tasks', getUserId, async (req, res) => {
    try {
        const { list_id, content, position } = req.body;
        const { rows } = await db.query('INSERT INTO tasks (list_id, content, position) VALUES ($1, $2, $3) RETURNING *', [list_id, content, position]);
        res.status(201).json(rows[0]);
    } catch(err) { res.status(500).json({ error: 'Falha ao criar tarefa.' }); }
});

app.put('/tasks/:id/move', getUserId, async (req, res) => {
    try {
        const { id } = req.params;
        const { new_list_id, position } = req.body;
        const { rows } = await db.query('UPDATE tasks SET list_id = $1, position = $2 WHERE id = $3 RETURNING *', [new_list_id, position, id]);
        res.status(200).json(rows[0]);
    } catch(err) { res.status(500).json({ error: 'Falha ao mover tarefa.' }); }
});

app.put('/tasks/:id', getUserId, async (req, res) => {
    try {
        const { id } = req.params;
        const { content, description, due_date } = req.body;
        const { rows } = await db.query(
            'UPDATE tasks SET content = $1, description = $2, due_date = $3 WHERE id = $4 RETURNING *',
            [content, description, due_date, id]
        );
        res.status(200).json(rows[0]);
    } catch(err) { res.status(500).json({ error: 'Falha ao atualizar a tarefa.' }); }
});

app.delete('/tasks/:id', getUserId, async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) { res.status(500).json({ error: 'Falha ao deletar tarefa.' }); }
});

// --- NOVAS ROTAS ---
// Checklist
app.post('/tasks/:id/checklist', getUserId, async(req, res) => {
    const { id } = req.params;
    const { content, position } = req.body;
    try {
        const { rows } = await db.query('INSERT INTO task_checklist_items (task_id, content, position) VALUES ($1, $2, $3) RETURNING *', [id, content, position]);
        res.status(201).json(rows[0]);
    } catch(err) { res.status(500).json({ error: 'Falha ao adicionar item no checklist.' }); }
});
app.put('/checklist/:itemId', getUserId, async(req, res) => {
    const { itemId } = req.params;
    const { content, is_completed } = req.body;
    try {
        const { rows } = await db.query('UPDATE task_checklist_items SET content = $1, is_completed = $2 WHERE id = $3 RETURNING *', [content, is_completed, itemId]);
        res.status(200).json(rows[0]);
    } catch(err) { res.status(500).json({ error: 'Falha ao atualizar item do checklist.' }); }
});

// Comentários
app.post('/tasks/:id/comments', getUserId, async(req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    try {
        const { rows } = await db.query('INSERT INTO task_comments (task_id, user_id, content) VALUES ($1, $2, $3) RETURNING *', [id, req.userId, content]);
        res.status(201).json(rows[0]);
    } catch(err) { res.status(500).json({ error: 'Falha ao adicionar comentário.' }); }
});

app.listen(PORT, () => {
    console.log(`Microsserviço Tasks-Service rodando em http://localhost:${PORT}`);
});