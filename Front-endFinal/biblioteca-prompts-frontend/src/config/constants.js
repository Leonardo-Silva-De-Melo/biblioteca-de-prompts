/**
 * Nome do usuario usado nas chamadas que registram autoria (favoritos,
 * historico, avaliacoes e comentarios).
 *
 * TODO: substituir pelo `preferred_username` do token Keycloak. Enquanto a
 * migracao nao acontece, o valor vem de VITE_NOME_USUARIO (ver .env.example)
 * para nao fixar nenhuma identidade no codigo.
 */
export const NOME_USUARIO = import.meta.env.VITE_NOME_USUARIO || 'Usuario Demonstracao';

/**
 * Categorias de prompts disponíveis na plataforma Biblioteca de Prompts.
 */
export const CATEGORIAS = [
    { nome: 'Documentação', icone: '📋' },
    { nome: 'Arquitetura', icone: '🏗️' },
    { nome: 'Desenvolvimento', icone: '💻' },
    { nome: 'Testes', icone: '🧪' },
    { nome: 'DevOps', icone: '🚀' },
    { nome: 'Banco de Dados', icone: '🗄️' },
    { nome: 'Segurança', icone: '🛡️' },
    { nome: 'Onboarding', icone: '🤝' },
];
