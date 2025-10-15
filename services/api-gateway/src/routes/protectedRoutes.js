const express = require('express');
const router = express.Router();

// Rota de exemplo que retorna os dados do usuário autenticado
router.get('/profile', (req, res) => {
    // req.user foi adicionado pelo middleware verifyToken
    res.json({
        message: 'Você acessou uma rota protegida!',
        user: req.user
    });
});

module.exports = router;