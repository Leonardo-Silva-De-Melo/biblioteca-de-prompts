# Plano de Implementação: Single Sign-On (SSO) com Keycloak e Open WebUI

Este documento descreve os passos exatos de infraestrutura para conectar o Open WebUI ao Keycloak. Com essa configuração, o usuário fará login apenas uma vez na Biblioteca de Prompts (React) e o Open WebUI, embutido no Iframe, fará login automático de forma invisível.

## 1. Configuração no Keycloak (Criação do Cliente)

Você precisará criar um "Cliente" no Keycloak exclusivamente para o Open WebUI se comunicar com ele.

1. Acesse o painel de administração do seu Keycloak (ex: `http://localhost:8080/admin`).
2. Selecione o realm que você já usa para a Biblioteca de Prompts (ex: `biblioteca-prompts`).
3. Vá em **Clients** (Clientes) e clique em **Create client** (Criar cliente).
4. Preencha os dados básicos:
   - **Client ID:** `openwebui`
   - **Client Type:** `OpenID Connect`
5. Na tela seguinte (Capability config):
   - Ative a opção **Client authentication** (Isso é crucial, pois gerará a senha secreta que o Open WebUI precisa).
   - Deixe "Standard flow" ativado.
6. Na tela de Configurações de Login:
   - **Valid redirect URIs:** Coloque a URL onde o seu Open WebUI roda + `/oauth/oidc/callback`. Exemplo: `http://localhost:3000/oauth/oidc/callback` (Ajuste a porta se o seu Open WebUI estiver em outra).
   - **Web origins:** `+` (ou a URL do Open WebUI).
7. Salve o cliente.
8. Vá na aba **Credentials** do cliente `openwebui` recém-criado e copie o **Client Secret** (Segredo do Cliente). Você precisará dele no próximo passo.

## 2. Configuração no Docker (Open WebUI)

Agora precisamos dizer ao Open WebUI para usar o Keycloak como provedor de autenticação. Se você estiver rodando o Open WebUI via `docker-compose.yml`, você deve adicionar as seguintes variáveis de ambiente (`environment`) no serviço do Open WebUI:

```yaml
services:
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    # ... suas configurações atuais (portas, volumes) ...
    environment:
      - ENABLE_OAUTH_SIGNUP=true
      - OAUTH_CLIENT_ID=openwebui
      - OAUTH_CLIENT_SECRET=cole_aqui_o_secret_do_keycloak
      # A URL base do seu realm no Keycloak:
      - OPENID_PROVIDER_URL=http://localhost:8080/realms/biblioteca-prompts/.well-known/openid-configuration
      # Configurações opcionais para forçar o login único:
      - OAUTH_PROVIDER_NAME=Keycloak UERJ
      - WEBUI_AUTH=True
```

*Nota sobre a URL do Keycloak no Docker:* Se o Open WebUI e o Keycloak estiverem rodando no mesmo Docker Compose, em vez de `localhost`, a URL do `OPENID_PROVIDER_URL` talvez precise usar o nome do container do Keycloak na rede interna do Docker (ex: `http://keycloak:8080/...`).

## 3. O Que Acontece na Prática? (A Mágica do SSO)

Você não precisará mexer em **nada** no código React (`biblioteca-prompts-frontend`). O fluxo ocorrerá naturalmente através dos cookies do navegador:

1. O usuário acessa a Biblioteca de Prompts (React) e faz login no Keycloak. 
2. O navegador salva um Cookie de Sessão Ativa do Keycloak.
3. O usuário clica no botão "Chat Interativo". O React abre a página com o Iframe do Open WebUI.
4. O Open WebUI carrega no Iframe, percebe que o usuário não está logado, e redireciona o Iframe para a tela de login do Keycloak.
5. **O Pulo do Gato:** O Keycloak recebe o redirecionamento, checa os Cookies do navegador e percebe: *"Opa, esse cara já se logou na Biblioteca de Prompts agora pouco!"*.
6. O Keycloak imediatamente aprova a requisição e joga o Iframe de volta para o Open WebUI.
7. O Open WebUI carrega a tela de chat logado com o nome do usuário.

**Tempo que isso leva:** Tudo isso no passo 4 a 6 acontece em milissegundos. Para o usuário que está usando a Biblioteca de Prompts, o Iframe carrega um "loading" rápido e a tela do chat já aparece logada e pronta para o uso, sem pedir senha!
