# Khora Frontend

Frontend web do sistema Khora, desenvolvido com Next.js, React e TypeScript.

O projeto possui uma tela de login com autenticacao simulada, redirecionamento da raiz (`/`) para `/login` e uma tela temporaria de dashboard em `/dashboard`.

## Stack

- Node.js 22
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint 9
- Docker multi-stage com imagem `node:22-alpine`
- Deploy via Vercel ou imagem Docker no Render

## Estrutura principal

```text
src/app/page.tsx              Redireciona / para /login
src/app/login/page.tsx        Tela de login
src/app/dashboard/page.tsx    Dashboard temporario
src/services/auth.ts          Login simulado
tests/auth.test.mjs           Testes automatizados do login simulado
docker/Dockerfile             Build Docker de producao
vercel.json                   Configuracao de build da Vercel
.github/workflows/ci.yml      CI, scan Trivy, Docker Hub e deploy Render
```

## Desenvolvimento local

Instale as dependencias:

```bash
npm ci
```

Rode o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev          # Inicia o Next.js em modo desenvolvimento
npm run lint         # Executa ESLint
npm run typecheck    # Valida TypeScript sem gerar arquivos
npm test             # Executa testes com node:test
npm run build        # Gera build de producao do Next.js
npm run start        # Inicia o app usando next start
npm run test:vercel  # Executa lint, typecheck, testes e build
```

O script recomendado para validar antes de deploy e:

```bash
npm run test:vercel
```

## Testes

Os testes usam o runner nativo do Node.js (`node:test`) e validam o comportamento do login simulado:

- credenciais validas retornam token Bearer;
- senha com menos de 6 caracteres rejeita o login.

Arquivo de teste:

```text
tests/auth.test.mjs
```

## Build para Vercel

A Vercel usa o arquivo `vercel.json`:

```json
{
  "framework": "nextjs",
  "installCommand": "npm ci",
  "buildCommand": "npm run test:vercel"
}
```

Isso faz o deploy falhar caso lint, typecheck, testes ou build falhem.

### Variaveis de ambiente

Configure a URL do BFF nos ambientes de preview e producao:

```text
BFF_BASE_URL=https://bff-khora.localhost
```

A pagina `/confeccao` chama a rota interna `/api/assessments`, e o Next.js encaminha a requisicao para:

```text
POST ${BFF_BASE_URL}/api/v1/assessments
```

Esse proxy server-side evita acoplar a tela diretamente ao host do BFF e segue melhor o modelo de deploy em Vercel/Node.js.

## Build Docker

O Dockerfile fica em:

```text
docker/Dockerfile
```

Build local:

```bash
docker build -f docker/Dockerfile -t khora-frontend .
```

Execucao local:

```bash
docker run --rm -p 8080:8080 khora-frontend
```

Configuracao de runtime no container:

```text
NODE_ENV=production
HOSTNAME=0.0.0.0
PORT=8080
```

O `next.config.ts` usa:

```ts
output: "standalone"
```

Por isso o container copia `.next/standalone` e inicia com:

```bash
node server.js
```

## CI/CD

O workflow `.github/workflows/ci.yml` executa:

1. `npm ci`
2. `npm run test:vercel`
3. scan de vulnerabilidades com Trivy
4. build e push da imagem Docker para Docker Hub
5. trigger de deploy no Render via API

Secrets esperados no GitHub Actions:

```text
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
RENDER_API_KEY
RENDER_SERVICE_ID
```

Imagem Docker configurada no workflow:

```text
fivamkhora/frontend
```

## Render

O deploy no Render e acionado pelo workflow depois que a imagem Docker e publicada.

Para evitar erro 502, confirme no Render se o servico esta configurado para usar a mesma porta do container:

```text
8080
```

O container tambem define `HOSTNAME=0.0.0.0`, necessario para expor o servidor corretamente dentro da plataforma.
