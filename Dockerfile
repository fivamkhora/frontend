# ==========================================
# Etapa 1: Dependências (deps)
# Objetivo: Baixar os pacotes do Node.js
# ==========================================
FROM node:22-alpine AS deps
WORKDIR /app
# Copia apenas os arquivos de controle de pacotes para otimizar o cache do Docker
COPY package.json package-lock.json* ./
# Instala as dependências do projeto
RUN npm ci

# ==========================================
# Etapa 2: Builder (builder)
# Objetivo: Compilar o código React/TypeScript
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app
# Copia as dependências instaladas na etapa anterior
COPY --from=deps /app/node_modules ./node_modules
# Copia o restante do código-fonte do projeto
COPY . .
# Roda o comando de build do Next.js (que gera a pasta .next)
RUN npm run build

# ==========================================
# Etapa 3: Runner (runner)
# Objetivo: Rodar a aplicação em produção
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

# Atualiza pacotes do sistema para mitigar vulnerabilidades da imagem base (3C, 26H)
RUN apk update && apk upgrade --no-cache

# Define que o ambiente é de produção
ENV NODE_ENV=production
ENV PORT=3000

# Copia os arquivos necessários para rodar a aplicação
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

# Inicia o servidor otimizado gerado pelo standalone
CMD ["node", "server.js"]