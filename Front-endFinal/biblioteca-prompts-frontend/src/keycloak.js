import Keycloak from 'keycloak-js';

/**
 * Cliente Keycloak da aplicacao.
 *
 * A URL precisa ser o endereco pelo qual o NAVEGADOR alcanca o Keycloak — nao o
 * nome do servico na rede do Docker. Configure em um arquivo .env na raiz do
 * frontend (ver .env.example):
 *
 *   VITE_KEYCLOAK_URL=http://localhost:8180
 *
 * Variaveis do Vite sao resolvidas em tempo de BUILD. Ao rodar em container,
 * o valor precisa estar definido durante o `npm run build`.
 */
const keycloak = new Keycloak({
    url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180',
    realm: import.meta.env.VITE_KEYCLOAK_REALM || 'biblioteca-prompts',
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'biblioteca-prompts-frontend'
});

export default keycloak;
