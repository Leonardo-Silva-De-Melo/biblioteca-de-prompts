-- ==========================================================================
-- 1. Limpa as tabelas filhas (Ordem de integridade referencial)
-- ==========================================================================
DELETE FROM feedbacks;
DELETE FROM historico_uso;
DELETE FROM prompt_visualizacoes;
DELETE FROM prompt_tags;
DELETE FROM historico_edicoes;
DELETE FROM comentarios;
DELETE FROM favoritos;
DELETE FROM notificacoes;
DELETE FROM feedbacks_plataforma;

-- Com as dependentes limpas, a tabela pai pode ser truncada sem violar FK
DELETE FROM prompts;

-- ==========================================================================
-- 2. Reseta as sequências ANTES de inserir
-- (No PostgreSQL não existe ALTER COLUMN RESTART WITH — usa-se ALTER SEQUENCE)
-- ==========================================================================
ALTER SEQUENCE prompts_id_seq RESTART WITH 1;
ALTER SEQUENCE notificacoes_id_seq RESTART WITH 1;
ALTER SEQUENCE historico_edicoes_id_seq RESTART WITH 1;
ALTER SEQUENCE historico_uso_id_seq RESTART WITH 1;

-- ==========================================================================
-- 3. Insere os 10 prompts iniciais
-- (CURRENT_TIMESTAMP funciona igual no PostgreSQL)
-- ==========================================================================
INSERT INTO prompts (id, titulo, categoria, descricao, texto_prompt, autor, vezes_usado, media_avaliacao, total_avaliacoes, data_criacao, data_atualizacao)
VALUES (1, 'Template API Spring Boot', 'Desenvolvimento', 'Padronização de microserviços DGTI', 'Atue como arquiteto Java...', 'Usuario Demonstracao', 50, 5.0, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO prompts (id, titulo, categoria, descricao, texto_prompt, autor, vezes_usado, media_avaliacao, total_avaliacoes, data_criacao, data_atualizacao)
VALUES (2, 'Guia de Arquitetura UERJ', 'Arquitetura', 'Padrões de infraestrutura institucional', 'Descreva a arquitetura para...', 'Usuario Demonstracao', 32, 4.8, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO prompts (id, titulo, categoria, descricao, texto_prompt, autor, vezes_usado, media_avaliacao, total_avaliacoes, data_criacao, data_atualizacao)
VALUES (3, 'Gerador de Testes JUnit 5', 'Testes', 'Criação de suíte de testes unitários', 'Gere testes para a classe...', 'Usuario Demonstracao', 45, 5.0, 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO prompts (id, titulo, categoria, descricao, texto_prompt, autor, vezes_usado, media_avaliacao, total_avaliacoes, data_criacao, data_atualizacao)
VALUES (4, 'Dockerfile Corporativo', 'DevOps', 'Configuração de containers padronizados', 'Crie um Dockerfile otimizado para...', 'Usuario Demonstracao', 28, 4.5, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO prompts (id, titulo, categoria, descricao, texto_prompt, autor, vezes_usado, media_avaliacao, total_avaliacoes, data_criacao, data_atualizacao)
VALUES (5, 'Otimização de Queries SQL', 'Banco de Dados', 'Refatoração de consultas complexas', 'Analise o seguinte SQL e sugira...', 'Usuario Demonstracao', 35, 4.9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO prompts (id, titulo, categoria, descricao, texto_prompt, autor, vezes_usado, media_avaliacao, total_avaliacoes, data_criacao, data_atualizacao)
VALUES (6, 'Checklist de Segurança OWASP', 'Segurança', 'Validação de vulnerabilidades em código', 'Revise o código buscando falhas de...', 'Usuario Demonstracao', 22, 5.0, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO prompts (id, titulo, categoria, descricao, texto_prompt, autor, vezes_usado, media_avaliacao, total_avaliacoes, data_criacao, data_atualizacao)
VALUES (7, 'README Institucional', 'Documentação', 'Gerador de documentação de projetos', 'Gere um README.md seguindo o padrão...', 'Usuario Demonstracao', 40, 4.7, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO prompts (id, titulo, categoria, descricao, texto_prompt, autor, vezes_usado, media_avaliacao, total_avaliacoes, data_criacao, data_atualizacao)
VALUES (8, 'Script Migração Flyway', 'Banco de Dados', 'Versionamento de esquema de banco', 'Crie um script de migration para...', 'Usuario Demonstracao', 15, 4.2, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO prompts (id, titulo, categoria, descricao, texto_prompt, autor, vezes_usado, media_avaliacao, total_avaliacoes, data_criacao, data_atualizacao)
VALUES (9, 'Fluxo de Autenticação JWT', 'Segurança', 'Implementação de segurança em APIs', 'Explique o fluxo de refresh token...', 'Usuario Demonstracao', 18, 4.6, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO prompts (id, titulo, categoria, descricao, texto_prompt, autor, vezes_usado, media_avaliacao, total_avaliacoes, data_criacao, data_atualizacao)
VALUES (10, 'Guia de Onboarding Dev', 'Onboarding', 'Manual para novos desenvolvedores DGTI', 'Crie um roteiro de boas-vindas para...', 'Usuario Demonstracao', 12, 5.0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==========================================================================
-- 4. Histórico de uso
-- DATEADD(MINUTE, -15, CURRENT_TIMESTAMP) no H2
-- vira NOW() - INTERVAL '15 minutes' no PostgreSQL
-- ==========================================================================
INSERT INTO historico_uso (prompt_id, usuario, data_uso)
VALUES (1, 'Usuario Demonstracao', CURRENT_TIMESTAMP);

INSERT INTO historico_uso (prompt_id, usuario, data_uso)
VALUES (3, 'Usuario Demonstracao', NOW() - INTERVAL '15 minutes');

INSERT INTO historico_uso (prompt_id, usuario, data_uso)
VALUES (5, 'Usuario Demonstracao', NOW() - INTERVAL '2 hours');

-- ==========================================================================
-- 5. Notificações
-- DATEADD(MINUTE, -30, CURRENT_TIMESTAMP) no H2
-- vira NOW() - INTERVAL '30 minutes' no PostgreSQL
-- ==========================================================================
INSERT INTO notificacoes (usuario, tipo, titulo, mensagem, prompt_id, link_acao, lida, criada_em)
VALUES ('Usuario Demonstracao', 'AVALIACAO', 'Nova avaliação ⭐', 'Carlos Eduardo (DevOps) deu 5 estrelas para o seu "Template API Spring Boot"!', 1, '/prompts/1', FALSE, CURRENT_TIMESTAMP);

INSERT INTO notificacoes (usuario, tipo, titulo, mensagem, prompt_id, link_acao, lida, criada_em)
VALUES ('Usuario Demonstracao', 'COMENTARIO', 'Novo comentário 💬', 'Mariana Souza comentou: "Excelente abordagem para os testes de integração!"', 3, '/prompts/3', FALSE, NOW() - INTERVAL '30 minutes');

INSERT INTO notificacoes (usuario, tipo, titulo, mensagem, prompt_id, link_acao, lida, criada_em)
VALUES ('Usuario Demonstracao', 'RESPOSTA', 'Nova resposta ↩️', 'Felipe Santos respondeu ao seu comentário sobre otimização de queries.', 5, '/prompts/5', FALSE, NOW() - INTERVAL '2 hours');

INSERT INTO notificacoes (usuario, tipo, titulo, mensagem, prompt_id, link_acao, lida, criada_em, lida_em)
VALUES ('Usuario Demonstracao', 'SISTEMA', 'Bem-vindo à Biblioteca de Prompts 🚀', 'Seu perfil foi ativado com sucesso. Explore a biblioteca de arquitetura DGTI.', NULL, '/', TRUE, NOW() - INTERVAL '1 day', CURRENT_TIMESTAMP);

INSERT INTO notificacoes (usuario, tipo, titulo, mensagem, prompt_id, link_acao, lida, criada_em)
VALUES ('Usuario Demonstracao', 'AVALIACAO', 'Nova avaliação ⭐', 'Rodrigo Alves deu 4 estrelas para o seu "Guia de Arquitetura UERJ"!', 2, '/prompts/2', FALSE, NOW() - INTERVAL '5 minutes');

INSERT INTO notificacoes (usuario, tipo, titulo, mensagem, prompt_id, link_acao, lida, criada_em)
VALUES ('Usuario Demonstracao', 'COMENTARIO', 'Novo comentário 💬', 'Patricia Lima comentou: "Esse Dockerfile economizou muito tempo no nosso deploy!"', 4, '/prompts/4', FALSE, NOW() - INTERVAL '20 minutes');

INSERT INTO notificacoes (usuario, tipo, titulo, mensagem, prompt_id, link_acao, lida, criada_em)
VALUES ('Usuario Demonstracao', 'AVALIACAO', 'Nova avaliação ⭐', 'Bruno Figueiredo deu 5 estrelas para o seu "Checklist de Segurança OWASP"!', 6, '/prompts/6', FALSE, NOW() - INTERVAL '45 minutes');

INSERT INTO notificacoes (usuario, tipo, titulo, mensagem, prompt_id, link_acao, lida, criada_em)
VALUES ('Usuario Demonstracao', 'COMENTARIO', 'Novo comentário 💬', 'Amanda Costa comentou: "Usei esse README e meu projeto ficou muito mais profissional!"', 7, '/prompts/7', FALSE, NOW() - INTERVAL '3 hours');

INSERT INTO notificacoes (usuario, tipo, titulo, mensagem, prompt_id, link_acao, lida, criada_em)
VALUES ('Usuario Demonstracao', 'RESPOSTA', 'Nova resposta ↩️', 'Thiago Neves respondeu ao seu comentário sobre o fluxo de autenticação JWT.', 9, '/prompts/9', FALSE, NOW() - INTERVAL '6 hours');

-- ==========================================================================
-- 6. Histórico de edições (versão inicial de cada prompt)
-- ==========================================================================
INSERT INTO historico_edicoes (prompt_id, numero_versao, texto_versao, motivo_edicao, editado_por, data_edicao)
VALUES (1, 1, 'Atue como arquiteto Java...', 'Criação inicial', 'Usuario Demonstracao', CURRENT_TIMESTAMP);

INSERT INTO historico_edicoes (prompt_id, numero_versao, texto_versao, motivo_edicao, editado_por, data_edicao)
VALUES (2, 1, 'Descreva a arquitetura para...', 'Criação inicial', 'Usuario Demonstracao', CURRENT_TIMESTAMP);

INSERT INTO historico_edicoes (prompt_id, numero_versao, texto_versao, motivo_edicao, editado_por, data_edicao)
VALUES (3, 1, 'Gere testes para a classe...', 'Criação inicial', 'Usuario Demonstracao', CURRENT_TIMESTAMP);

INSERT INTO historico_edicoes (prompt_id, numero_versao, texto_versao, motivo_edicao, editado_por, data_edicao)
VALUES (4, 1, 'Crie um Dockerfile otimizado para...', 'Criação inicial', 'Usuario Demonstracao', CURRENT_TIMESTAMP);

INSERT INTO historico_edicoes (prompt_id, numero_versao, texto_versao, motivo_edicao, editado_por, data_edicao)
VALUES (5, 1, 'Analise o seguinte SQL e sugira...', 'Criação inicial', 'Usuario Demonstracao', CURRENT_TIMESTAMP);

INSERT INTO historico_edicoes (prompt_id, numero_versao, texto_versao, motivo_edicao, editado_por, data_edicao)
VALUES (6, 1, 'Revise o código buscando falhas de...', 'Criação inicial', 'Usuario Demonstracao', CURRENT_TIMESTAMP);

INSERT INTO historico_edicoes (prompt_id, numero_versao, texto_versao, motivo_edicao, editado_por, data_edicao)
VALUES (7, 1, 'Gere um README.md seguindo o padrão...', 'Criação inicial', 'Usuario Demonstracao', CURRENT_TIMESTAMP);

INSERT INTO historico_edicoes (prompt_id, numero_versao, texto_versao, motivo_edicao, editado_por, data_edicao)
VALUES (8, 1, 'Crie um script de migration para...', 'Criação inicial', 'Usuario Demonstracao', CURRENT_TIMESTAMP);

INSERT INTO historico_edicoes (prompt_id, numero_versao, texto_versao, motivo_edicao, editado_por, data_edicao)
VALUES (9, 1, 'Explique o fluxo de refresh token...', 'Criação inicial', 'Usuario Demonstracao', CURRENT_TIMESTAMP);

INSERT INTO historico_edicoes (prompt_id, numero_versao, texto_versao, motivo_edicao, editado_por, data_edicao)
VALUES (10, 1, 'Crie um roteiro de boas-vindas para...', 'Criação inicial', 'Usuario Demonstracao', CURRENT_TIMESTAMP);

-- ==========================================================================
-- 7. Reseta as sequências para o próximo ID correto após os inserts
-- (Substitui os ALTER TABLE ... ALTER COLUMN ID RESTART WITH do H2)
-- ==========================================================================
ALTER SEQUENCE prompts_id_seq RESTART WITH 100;
ALTER SEQUENCE historico_edicoes_id_seq RESTART WITH 100;
ALTER SEQUENCE notificacoes_id_seq RESTART WITH 100;
ALTER SEQUENCE historico_uso_id_seq RESTART WITH 100;