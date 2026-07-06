# Khora Frontend

Frontend web do sistema Khora, desenvolvido com Next.js, React e TypeScript.

O projeto possui uma tela de login integrada ao BFF, redirecionamento da raiz (`/`) para `/login` e uma tela temporaria de dashboard em `/dashboard`.

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
src/services/auth.ts          Cliente de autenticacao
tests/auth.test.mjs           Testes automatizados do cliente de autenticacao
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

Os testes usam o runner nativo do Node.js (`node:test`) e validam o comportamento do cliente de autenticacao:

- credenciais sao enviadas para a rota interna de autenticacao;
- erros retornados pelo BFF sao propagados para a tela.

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
BFF_BASE_URL=https://bff-khora.onrender.com
AUTH_SESSION_SECRET=troque-por-um-segredo-com-no-minimo-32-caracteres
```

`AUTH_SESSION_SECRET` e obrigatorio e deve ter no minimo 32 caracteres. Use um valor forte e diferente por ambiente.

A pagina `/confeccao` chama a rota interna `/api/ia/assessments`, e o Next.js encaminha a requisicao para:

```text
POST ${BFF_BASE_URL}/api/v1/ia/assessments
```

Esse proxy server-side evita acoplar a tela diretamente ao host do BFF e segue melhor o modelo de deploy em Vercel/Node.js.

A pagina `/login` chama a rota publica interna `/api/public/auth/signin`, e o Next.js encaminha a requisicao para:

```text
POST ${BFF_BASE_URL}/api/v1/auth/user/signin
```

No sucesso, o servidor cria um cookie `khora_session` com `httpOnly`, `secure` e `sameSite=lax`. O JWT retornado pelo BFF fica dentro da sessao assinada e nao e exposto ao frontend.

Apos autenticar, o frontend usa `fetchAuthenticatedUser()` de `src/services/authService.ts` para chamar `/api/auth/whoami`. Essa rota le o JWT da sessao httpOnly no servidor e consulta:

```text
GET ${BFF_BASE_URL}/api/v1/auth/user/whoami
```

O retorno contem apenas os dados do usuario logado necessarios para a interface, como `id`, `username`, `name`, `email` e `role`.

A pagina `/classes/[id]` chama a rota interna `/api/classrooms/{id}`. Essa rota le a sessao httpOnly, busca os membros no BFF de Turma e depois busca os usuarios no BFF Auth:

```text
GET ${BFF_BASE_URL}/api/v1/turma/classrooms/{id}
GET ${BFF_BASE_URL}/api/v1/auth/users?ids=1%2C2
```

A resposta entregue ao frontend separa `teachers` e `students` e nao retorna CPF, data de nascimento ou token.

Rotas privadas sao protegidas pelo `middleware.ts`:

```text
/dashboard
/classes
/confeccao
/provas
/api/classrooms/*
/api/ia/*
/api/turma/*
```

Rotas sob `/api/public/*` sao excecoes publicas e nao exigem sessao autenticada. Use esse prefixo somente para endpoints que precisam estar disponiveis antes do login, como signin.

Para proteger uma nova rota de pagina, adicione o prefixo em `privatePageRoutes` no `middleware.ts`. Para proteger novas APIs, mantenha-as sob um prefixo privado ja protegido ou adicione um novo prefixo em `isPrivateApi`.

Em Server Components ou Route Handlers, use as funcoes reutilizaveis:

```ts
import { getAuthSession, requireAuthSession } from "@/lib/auth/server";
```

`requireAuthSession()` redireciona para `/login` quando nao houver sessao valida. `getAuthSession()` retorna a sessao ou `null`.

Valores enviados para o BFF:

```text
assessmentType: prova | quiz | trabalho
difficulty: facil | medio | dificil
```

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
