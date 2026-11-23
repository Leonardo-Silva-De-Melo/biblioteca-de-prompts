# keycloak-config

Arquivos consumidos pelo container do Keycloak e pelo proxy OIDC.

| Arquivo | Uso |
|---|---|
| `biblioteca-prompts-realm.json` | Realm importado na primeira subida (`start-dev --import-realm`) |
| `nginx-oidc-proxy.conf` | Configuração do `biblioteca-prompts-oidc-proxy` |
| `open-webui-index.html` | Página customizada servida pelo Open WebUI |

---

## O que o realm traz pronto

- Realm `biblioteca-prompts`
- Roles de aplicação: `ADMIN` e `USER` (consumidas pelo controle de acesso do frontend)
- Client `biblioteca-prompts-frontend` — público, usado pelo React via `keycloak-js`
- Client `open-webui` — confidencial, usado no SSO do Open WebUI
- Fluxos de autenticação e mappers de protocolo padrão

## O que o realm **não** traz

**Usuários.** O arquivo é publicado sem a seção `users` e sem as chaves
criptográficas do realm, de propósito: um export de Keycloak carrega hashes de
senha, e-mails e a chave privada RSA de assinatura dos tokens. Nada disso deve
viajar em repositório.

Consequências práticas na primeira subida:

1. **As chaves do realm são geradas pelo próprio Keycloak** na importação. Não há
   ação necessária. Como são novas, qualquer token emitido por uma instalação
   anterior deixa de ser válido — o que é o comportamento desejado.
2. **Os usuários precisam ser criados.** Veja abaixo.

---

## Criando o primeiro usuário

Pelo console administrativo (`http://localhost:8180`, credenciais de
`KEYCLOAK_ADMIN` / `KEYCLOAK_ADMIN_PASSWORD` do `.env`):

1. Selecione o realm `biblioteca-prompts` no seletor do canto superior esquerdo.
2. **Users → Add user** — defina username e e-mail.
3. Aba **Credentials → Set password**. Marque *Temporary* se quiser forçar a
   troca no primeiro login.
4. Aba **Role mapping → Assign role**. Filtre por *realm roles* e atribua
   `ADMIN` ou `USER`.

A role importa: o frontend libera as telas administrativas apenas para `ADMIN`.
Um usuário sem nenhuma das duas roles autentica mas não enxerga conteúdo.

Pela linha de comando, se preferir:

```bash
docker exec -it biblioteca-prompts-keycloak /opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 --realm master \
  --user "$KEYCLOAK_ADMIN" --password "$KEYCLOAK_ADMIN_PASSWORD"

docker exec -it biblioteca-prompts-keycloak /opt/keycloak/bin/kcadm.sh create users \
  -r biblioteca-prompts -s username=tecnico -s enabled=true -s email=tecnico@exemplo.org

docker exec -it biblioteca-prompts-keycloak /opt/keycloak/bin/kcadm.sh set-password \
  -r biblioteca-prompts --username tecnico --new-password 'SENHA_FORTE_AQUI' --temporary

docker exec -it biblioteca-prompts-keycloak /opt/keycloak/bin/kcadm.sh add-roles \
  -r biblioteca-prompts --uusername tecnico --rolename USER
```

---

## O client secret do Open WebUI

No realm, o segredo do client `open-webui` está como placeholder:

```json
"secret": "${env.OAUTH_CLIENT_SECRET}"
```

O Keycloak substitui `${env.VAR}` por variáveis de ambiente durante a
importação. É por isso que `OAUTH_CLIENT_SECRET` aparece tanto no serviço
`keycloak` quanto no `open-webui` do `docker-compose.yml`: os dois lados do SSO
precisam do mesmo valor.

Gere um valor próprio:

```bash
openssl rand -base64 32
```

Se o SSO do Open WebUI falhar com `invalid_client` ou `unauthorized_client`, o
primeiro ponto a verificar é a divergência entre esses dois valores. Confira o
que está registrado em **Clients → open-webui → Credentials** no console e
compare com o `.env`.

---

## Reimportação

O `--import-realm` só atua quando o realm ainda não existe. Depois da primeira
subida, o realm passa a viver no banco e alterações no JSON são ignoradas.

Para recomeçar do zero, removendo também os usuários criados:

```bash
docker compose down -v
docker compose up -d
```

O `-v` remove os volumes declarados no compose (`postgres-data` e
`open-webui-data`), que é o que força a reimportação. Para conferir os nomes
reais antes, use `docker volume ls`: o Compose prefixa com o nome do projeto,
resultando em `front-back_postgres-data`.

Isso apaga o banco da aplicação junto. Em ambiente com dados reais, exporte
antes.

---

## URLs registradas no realm

Os clients vêm configurados para `http://localhost:3000` (Open WebUI) e
`http://localhost:3001` (frontend). Ao publicar sob outro host ou domínio,
ajuste **Valid redirect URIs** e **Web origins** de cada client no console —
caso contrário o Keycloak recusa o retorno do login.
