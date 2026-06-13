# Fivam Backend FIAP

API Hello World em Node.js com Express.

## Requisitos

- Node.js 22+
- npm
- Docker

## Executar localmente

```bash
npm ci
npm start
```

A aplicação sobe em `http://localhost:3000`.

## Testes

```bash
npm test
```

## Docker

```bash
docker build -f docker/Dockerfile -t fivam-backend-fiap .
docker run --rm -p 3000:3000 fivam-backend-fiap
```

## Rotas

- `GET /` retorna `{ "message": "Hello World" }`
- `GET /health` retorna `{ "status": "ok" }`
- `GET /request-info` retorna dados da requisicao, respeitando cabecalhos `X-Forwarded-*` de proxy/TLS offload

## Proxy e TLS offload

A aplicacao usa `trust proxy` para respeitar os cabecalhos enviados por um proxy reverso ou load balancer, como `X-Forwarded-Proto` e `X-Forwarded-For`.
