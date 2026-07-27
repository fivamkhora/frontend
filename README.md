# Khora Frontend

Frontend web do sistema educacional Khora, desenvolvido com Next.js, React e TypeScript. A aplicacao integra autenticacao, gestao de turmas e usuarios, criacao de provas com IA, aplicacao de avaliacoes e acompanhamento de resultados.

## Apoio de IA na interface

A construcao visual das telas e dos HTMLs de referencia contou com apoio de IA usando o Stitch, do Google:

```text
https://stitch.withgoogle.com/
```

## Stack

- Node.js 22
- Next.js 15 com App Router
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint 9
- Docker multi-stage com imagem `node:22-alpine`
- Deploy via Vercel ou imagem Docker no Render

## Paginas e funcoes

### Acesso e painel

| Rota | Funcao |
| --- | --- |
| `/` | Redireciona para a pagina de login. |
| `/login` | Autentica o usuario pelo BFF e inicia uma sessao segura. |
| `/dashboard` | Exibe o painel inicial adequado ao perfil Administrador, Professor ou Aluno. |

### Provas e avaliacoes

| Rota | Funcao |
| --- | --- |
| `/confeccao` | Inicia a criacao de uma prova a partir do material e das configuracoes informadas pelo professor. |
| `/confeccao/[id]` | Carrega uma prova existente, permite gerar revisoes por IA, reorganizar questoes e respostas e imprimir prova ou gabarito. |
| `/provas` | Lista as provas criadas pela API de IA e permite abrir uma prova para edicao. |
| `/atribuirprova` | Seleciona uma prova, turmas e periodo de aplicacao para publicar uma avaliacao. |
| `/atribuirprova/[Id]` | Fluxo por turma para consultar provas disponiveis e aplicar uma prova ainda nao vinculada. |
| `/avaliacoes` | Lista avaliacoes atribuidas e apresenta acoes conforme o perfil do usuario. |
| `/provas/[examId]/realize` | Permite ao aluno responder e enviar uma avaliacao. |
| `/provas/[examId]/resultado` | Exibe o resultado e a revisao das respostas de uma avaliacao realizada. |
| `/notas` | Exibe ao aluno suas entregas, notas e situacoes das avaliacoes. |

### Turmas e desempenho

| Rota | Funcao |
| --- | --- |
| `/classes` | Lista as turmas vinculadas ao professor autenticado. |
| `/classes/[id]` | Exibe os dados e os membros de uma turma. |
| `/alunos/mock/desempenho` | Tela demonstrativa, com dados mockados, para visualizacao do desempenho academico de um aluno. |

### Secretaria

| Rota | Funcao |
| --- | --- |
| `/secretaria` | Central de acesso aos recursos administrativos. |
| `/secretaria/usuarios` | Lista usuarios cadastrados no BFF. |
| `/secretaria/usuarios/novo` | Cadastra um novo usuario. |
| `/secretaria/usuarios/[id]` | Consulta e edita os dados de um usuario. |
| `/secretaria/classes` | Lista todas as turmas e oferece acesso a criacao e configuracao. |
| `/secretaria/classes/configuracao` | Cria ou edita uma turma e vincula ou remove professores e alunos. |

### Visibilidade por perfil

O menu lateral adapta as opcoes ao `role` retornado pela autenticacao:

- `Administrador`: secretaria, turmas, confeccao, provas, atribuicao de provas, avaliacoes e desempenho.
- `Professor`: turmas, confeccao, provas, atribuicao de provas, avaliacoes e desempenho.
- `Aluno`: avaliacoes e minhas notas.

O dashboard possui uma apresentacao especifica para cada perfil. A protecao de acesso nao depende apenas do menu: as rotas privadas exigem uma sessao valida no middleware.

## Estrutura principal

```text
src/app/                         Paginas e Route Handlers do App Router
src/app/_components/             Layout e navegacao compartilhados
src/app/api/                     Proxies server-side para o BFF
src/context/AuthContext.tsx      Estado do usuario autenticado no cliente
src/lib/auth/                    Criacao e validacao da sessao assinada
src/lib/bff.ts                   Configuracao centralizada do BFF
src/services/authService.ts      Operacoes reutilizaveis de autenticacao
src/services/classroomService.ts Operacoes reutilizaveis de turmas
src/services/secretariaService.ts Operacoes administrativas reutilizaveis
src/services/date.ts             Formatacao da data exibida no dashboard
middleware.ts                    Protecao das paginas e APIs privadas
tests/auth.test.mjs              Testes automatizados de autenticacao
docker/Dockerfile                Build Docker de producao
vercel.json                      Configuracao de build da Vercel
.github/workflows/ci.yml         CI, scan Trivy, Docker Hub e deploy Render
```

## Integracao com o BFF

As telas chamam Route Handlers internos do Next.js. Esses handlers leem a sessao no servidor e encaminham a requisicao para `BFF_BASE_URL`, evitando expor o host do BFF, o JWT ou outros dados sensiveis no codigo do navegador.

Principais grupos de rotas internas:

| Prefixo | Responsabilidade |
| --- | --- |
| `/api/public/auth/signin` | Login publico e criacao da sessao. |
| `/api/auth/*` | Consulta do usuario autenticado e logout. |
| `/api/ia/*` | Criacao, listagem e revisao de provas pela API de IA. |
| `/api/avaliacao/*` | Provas publicadas, questoes, respostas e entregas. |
| `/api/classrooms/*` e `/api/turma/*` | Consulta de turmas e membros. |
| `/api/secretaria/*` | Usuarios, professores, alunos e configuracao de turmas. |

Exemplos de encaminhamento:

```text
POST /api/public/auth/signin
  -> POST ${BFF_BASE_URL}/api/v1/auth/user/signin

GET /api/auth/whoami
  -> GET ${BFF_BASE_URL}/api/v1/auth/user/whoami

POST /api/ia/assessments
  -> POST ${BFF_BASE_URL}/api/v1/ia/assessments

POST /api/ia/revisions
  -> POST ${BFF_BASE_URL}/api/v1/ia/assessments/{id}/revisions
```

Os valores enviados para geracao de provas seguem os formatos:

```text
assessmentType: prova | quiz | trabalho
difficulty: facil | medio | dificil
```

## Autenticacao e seguranca

No login, o servidor armazena o JWT retornado pelo BFF dentro do cookie `khora_session`, configurado com `httpOnly`, `secure` em producao e `sameSite=lax`. O segredo usado para assinar a sessao vem de `AUTH_SESSION_SECRET`.

Apos autenticar, `fetchAuthenticatedUser()` em `src/services/authService.ts` consulta `/api/auth/whoami`. O frontend recebe apenas os dados necessarios para a interface, como `id`, `username`, `name`, `email` e `role`.

Rotas privadas sao protegidas pelo `middleware.ts`, incluindo:

```text
/dashboard
/alunos
/avaliacoes
/classes
/confeccao
/notas
/provas
/secretaria
/api/avaliacao/*
/api/classrooms/*
/api/ia/*
/api/secretaria/*
/api/turma/*
```

Rotas sob `/api/public/*` sao excecoes publicas e devem ser usadas apenas por operacoes disponiveis antes do login.

Para proteger uma nova pagina, adicione seu prefixo em `privatePageRoutes` e no `matcher` de `middleware.ts`. Para uma nova API, use um prefixo privado existente ou inclua o novo prefixo em `isPrivateApi` e no `matcher`.

Em Server Components ou Route Handlers, use as funcoes reutilizaveis:

```ts
import { getAuthSession, requireAuthSession } from "@/lib/auth/server";
```

`requireAuthSession()` redireciona para `/login` quando nao houver sessao valida. `getAuthSession()` retorna a sessao ou `null`.

## Variaveis de ambiente

Configure nos ambientes local, preview e producao:

```text
BFF_BASE_URL=https://bff-khora.onrender.com
AUTH_SESSION_SECRET=troque-por-um-segredo-com-no-minimo-32-caracteres
```

`AUTH_SESSION_SECRET` e obrigatorio, deve ter no minimo 32 caracteres e precisa ser diferente em cada ambiente.

## Desenvolvimento local

Instale as dependencias:

```bash
npm ci
```

Rode o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Scripts

```bash
npm run dev          # Inicia o Next.js em modo desenvolvimento
npm run lint         # Executa ESLint
npm run typecheck    # Valida TypeScript sem gerar arquivos
npm test             # Executa testes com node:test
npm run build        # Gera o build de producao do Next.js
npm run start        # Inicia o app usando next start
npm run test:vercel  # Executa lint, typecheck, testes e build
```

Antes do deploy, execute:

```bash
npm run test:vercel
```

## Testes

Os testes usam o runner nativo do Node.js (`node:test`) e validam o cliente de autenticacao, incluindo envio de credenciais para a rota interna e tratamento dos erros devolvidos pelo BFF.

## Build para Vercel

A Vercel usa o arquivo `vercel.json`:

```json
{
  "framework": "nextjs",
  "installCommand": "npm ci",
  "buildCommand": "npm run test:vercel"
}
```

O deploy falha caso lint, typecheck, testes ou build falhem.

## Build Docker

Build local:

```bash
docker build -f docker/Dockerfile -t khora-frontend .
```

Execucao local:

```bash
docker run --rm -p 8080:8080 \
  -e BFF_BASE_URL=https://bff-khora.onrender.com \
  -e AUTH_SESSION_SECRET=troque-por-um-segredo-com-no-minimo-32-caracteres \
  khora-frontend
```

O container usa `NODE_ENV=production`, `HOSTNAME=0.0.0.0` e `PORT=8080`. O `next.config.ts` define `output: "standalone"`, e a imagem inicia a aplicacao com `node server.js`.

## CI/CD

O workflow `.github/workflows/ci.yml` executa:

1. `npm ci`
2. `npm run test:vercel`
3. scan de vulnerabilidades com Trivy
4. build e push da imagem para o Docker Hub
5. acionamento do deploy no Render

Secrets esperados no GitHub Actions:

```text
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
RENDER_API_KEY
RENDER_SERVICE_ID
```

A imagem configurada no workflow e `fivamkhora/frontend`.

## Render

O deploy no Render e acionado pelo workflow depois da publicacao da imagem Docker. Para evitar erro HTTP 502, o servico deve usar a porta `8080`; o container tambem define `HOSTNAME=0.0.0.0` para expor corretamente o servidor.
