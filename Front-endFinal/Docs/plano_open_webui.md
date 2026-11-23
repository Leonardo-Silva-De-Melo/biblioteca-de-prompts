# Integração Open WebUI + Keycloak + Ollama

Registro da decisão de integrar a interface de chat (Open WebUI) à stack do
projeto, com autenticação delegada ao Keycloak e inferência no Ollama.
A integração está implementada; este documento preserva o desenho e as razões
das escolhas, que não são evidentes a partir do `docker-compose.yml`.

---

## 1. Posição do Ollama na stack

O plano original previa o Ollama como container da própria stack, de modo que um
único `docker-compose up -d` subisse banco, backend, frontend, Keycloak,
interface de chat e motor de inferência.

**Essa decisão foi revista.** No `docker-compose.yml` atual o serviço `ollama`
está comentado, e a stack aponta para um servidor de inferência externo via
`OLLAMA_BASE_URL`. O motivo é a GPU: o container só faz sentido se a máquina que
roda a stack tiver GPU exposta ao Docker. Sem isso, a diretiva de reserva de
dispositivo é ignorada em silêncio pelo Compose e o Ollama passa a inferir em
CPU — o sintoma é resposta na ordem de minutos, sem nenhum erro no log.

Concentrar a GPU em um único host atende também à premissa institucional: os
dados permanecem na rede interna, e um só equipamento serve toda a equipe.

O bloco comentado continua no compose como caminho documentado para quem rodar
a stack em máquina com GPU — basta descomentá-lo, reativar o volume
`ollama-data` e apontar `OLLAMA_BASE_URL` para `http://biblioteca-prompts-ollama:11434`.

## 2. Configuração do Open WebUI

Variáveis relevantes do serviço `open-webui`:

| Variável | Papel |
|---|---|
| `OLLAMA_BASE_URL` | endereço do servidor de inferência |
| `ENABLE_OAUTH_SIGNUP=true` | cria a conta local no primeiro login via OIDC |
| `OAUTH_CLIENT_ID=open-webui` | identificador do cliente no realm |
| `OAUTH_CLIENT_SECRET` | vem do `.env`; nunca literal no compose |
| `OPENID_PROVIDER_URL` | documento de descoberta OIDC |
| `OAUTH_PROVIDER_NAME=Biblioteca de Prompts` | rótulo exibido no botão de login |
| `OAUTH_AUTO_REDIRECT=true` | dispensa o clique intermediário no botão |
| `ENABLE_LOGIN_FORM=false` | remove o formulário local de usuário e senha |

As duas últimas são o que torna o SSO efetivo em lugar de opcional:
`ENABLE_LOGIN_FORM=false` fecha a autenticação local, e sem isso continuaria
existindo um caminho de acesso fora do controle do Keycloak — contas criadas
dentro do Open WebUI, sem vínculo com o diretório institucional.

O `OPENID_PROVIDER_URL` aponta para o proxy NGINX, não diretamente para o
Keycloak. A razão está em `arquitetura-oidc.md`: navegador e container resolvem
nomes de rede de formas diferentes, e o documento de descoberta precisa devolver
endereços distintos para cada consumidor.

## 3. Cliente no Keycloak

O cliente `open-webui` faz parte do realm importado
(`keycloak-config/biblioteca-prompts-realm.json`) — não precisa ser criado à mão. O que o
realm **não** traz é o segredo, substituído por um *placeholder* resolvido na
importação a partir de `OAUTH_CLIENT_SECRET`. Ver
`keycloak-config/README.md`.

Para criá-lo manualmente, em instalação que não use o realm importado:

1. **Clients** → **Create client**, identificador `open-webui`.
2. Ativar **Client authentication** (torna o cliente confidencial; sem isso o
   fluxo não emite segredo).
3. Em **Valid redirect URIs**, `http://<host>:3000/oauth/oidc/callback`.
4. Copiar o segredo da aba **Credentials** para `OAUTH_CLIENT_SECRET` no `.env`.

O caminho do *redirect URI* é imposto pelo Open WebUI; divergência nesse campo
produz erro de `invalid_redirect_uri` no Keycloak, e não no Open WebUI — o que
torna a origem do problema pouco óbvia.

## 4. Gestão de modelos

O download de modelos é feito pela interface, em **Painel de Controle (Admin)**
→ **Models** → campo *Pull a model from Ollama.com*, informando o identificador
(`llama3.2`, `mistral`, `qwen2.5`). O Open WebUI repassa a ordem ao Ollama, que
baixa e grava no volume de dados do servidor de inferência.

Duas consequências operacionais:

- Os modelos ocupam de 2 GB a 8 GB cada. O volume cresce rápido quando se
  testam vários; conferir o espaço do host antes de acumular.
- Quem tem o papel de administrador no Open WebUI pode baixar qualquer modelo
  público. Isso é conveniente para avaliação e é um ponto de atenção para uso
  institucional: a decisão de qual modelo serve a equipe passa a depender de
  quem detém esse papel.
