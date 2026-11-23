# ── ETAPA 1: BUILD ──────────────────────────────────────────────
# Imagem com Node 20 para compilar o React
FROM node:20-alpine AS build

WORKDIR /app

# Copia package.json primeiro (Docker cacheia as dependências)
# Se o package.json não mudar, ele não roda npm install de novo
COPY package.json package-lock.json* ./
RUN npm install

# Copia o restante do projeto
COPY . .

# Gera o build de produção (substitui o npm run dev)
RUN npm run build

# ── ETAPA 2: RUNTIME ─────────────────────────────────────────────
# Nginx: servidor web leve para servir os arquivos do React
FROM nginx:alpine

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia nossa configuração personalizada
COPY nginx.conf /etc/nginx/conf.d/

# Copia o build gerado na etapa anterior para o Nginx servir
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
