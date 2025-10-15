const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    console.log('[DEBUG] [authMiddleware] Verificando token...');

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            // Este erro aparecerá no console do API Gateway se a variável não estiver no .env
            console.error('[ERRO FATAL] [authMiddleware] JWT_SECRET não está definido!');
            return res.status(500).json({ error: 'Erro de configuração interna do servidor.' });
        }

        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            console.warn('[AVISO] [authMiddleware] Cabeçalho de autorização ausente.');
            return res.status(401).json({ error: 'Token não fornecido.' });
        }
        
        const token = authHeader.split(' ')[1];
        if (!token) {
            console.warn('[AVISO] [authMiddleware] Token ausente no cabeçalho (formato Bearer esperado).');
            return res.status(401).json({ error: 'Formato de token inválido.' });
        }

        // Usamos a versão síncrona dentro de um try/catch para um melhor controle de erros
        const decoded = jwt.verify(token, secret);
        
        req.user = decoded;
        console.log('[DEBUG] [authMiddleware] Token verificado com sucesso para o usuário:', decoded.email);
        
        next(); // Token é válido, prossegue para o próximo middleware (o proxy)

    } catch (error) {
        console.error('[ERRO] [authMiddleware] Falha na verificação do token:', error.name, '-', error.message);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado.' });
        }
        
        return res.status(403).json({ error: 'Token inválido.' });
    }
};

module.exports = { verifyToken };