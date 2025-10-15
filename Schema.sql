-- =============================================================================
-- ARQUIVO DE SCHEMA COMPLETO PARA A APLICAÇÃO TOOL-BOX
-- Este script cria todas as tabelas necessárias para os microsserviços.
-- =============================================================================

-- Habilita a extensão para gerar UUIDs (Identificadores Únicos Universais)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- FUNÇÃO DE TRIGGER REUTILIZÁVEL
-- Função para atualizar o campo 'updated_at' automaticamente em qualquer tabela.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- SEÇÃO 1: CORE - AUTENTICAÇÃO E USUÁRIOS
-- Tabela principal que armazena as informações de todos os usuários.
-- =============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'local', -- ex: 'local', 'google', 'ldap'
    provider_id VARCHAR(255), -- ID do usuário em provedores externos
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Aplica o trigger na tabela de usuários
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();


-- =============================================================================
-- SEÇÃO 2: FERRAMENTA - BLOCO DE NOTAS (NOTES)
-- Armazena as notas criadas pelos usuários.
-- =============================================================================

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Sem Título',
    content TEXT, -- Alterado para TEXT para armazenar HTML
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Aplica o trigger na tabela de notas
CREATE TRIGGER set_timestamp_notes
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();


-- =============================================================================
-- SEÇÃO 3: FERRAMENTA - LOUSA DIGITAL (WHITEBOARD)
-- Armazena as lousas digitais e seu conteúdo.
-- =============================================================================

CREATE TABLE whiteboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'Nova Lousa',
    content JSONB, -- JSONB para armazenar o estado do canvas (fabric.js)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Aplica o trigger na tabela de lousas
CREATE TRIGGER set_timestamp_whiteboards
BEFORE UPDATE ON whiteboards
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();


-- =============================================================================
-- SEÇÃO 4: FERRAMENTA - TAREFAS (KANBAN)
-- Estrutura de múltiplas tabelas para o quadro Kanban.
-- =============================================================================

-- Tabela 4.1: Projetos (o quadro principal de um usuário)
CREATE TABLE task_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'Novo Projeto',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela 4.2: Listas/Colunas (ex: "A Fazer", "Em Andamento")
CREATE TABLE task_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES task_projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    position SMALLINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela 4.3: Tarefas (os cards)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID NOT NULL REFERENCES task_lists(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    position SMALLINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela 4.4: Itens de Checklist dentro de uma tarefa
CREATE TABLE task_checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    position SMALLINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela 4.5: Comentários em uma tarefa
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Aplica os triggers nas tabelas de tarefas
CREATE TRIGGER set_timestamp_task_projects
BEFORE UPDATE ON task_projects
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_task_lists
BEFORE UPDATE ON task_lists
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_tasks
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_task_checklist_items
BEFORE UPDATE ON task_checklist_items
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_task_comments
BEFORE UPDATE ON task_comments
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();


-- =============================================================================
-- SEÇÃO 5: ÍNDICES PARA OTIMIZAÇÃO DE PERFORMANCE
-- Adiciona índices nas chaves estrangeiras para acelerar as consultas.
-- =============================================================================

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_whiteboards_owner_id ON whiteboards(owner_id);
CREATE INDEX idx_task_projects_owner_id ON task_projects(owner_id);
CREATE INDEX idx_task_lists_project_id ON task_lists(project_id);
CREATE INDEX idx_tasks_list_id ON tasks(list_id);
CREATE INDEX idx_task_checklist_items_task_id ON task_checklist_items(task_id);
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_comments_user_id ON task_comments(user_id);

-- =============================================================================
-- SEÇÃO 6: DADOS INICIAIS
-- Adiciona um usuário padrão para fins de teste e demonstração.
-- =============================================================================

-- A senha é 'admin'
INSERT INTO users (email, password_hash) VALUES
('admin@toolbox.com', '$2a$10$v2/104y.T.4C1zJ.p.a21uGWn9G2b3m5z/pEa9M.kS2j3a.i4a2eG');


-- =============================================================================
-- FIM DO SCRIPT
-- =============================================================================