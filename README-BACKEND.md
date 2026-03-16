# FOCO — Backend

> API do **FOCO**: autenticação (JWT), rotina por usuário e persistência em MongoDB.

Backend em Node.js + Express que serve o [frontend FOCO](https://github.com/SEU_USUARIO/app-foco). Responsável por registro, login, e CRUD da rotina (tarefas, checks, metas) por usuário.

---

## Conteúdo

- [O que faz esta API](#o-que-faz-esta-api)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Rotas da API](#rotas-da-api)
- [Como rodar localmente](#como-rodar-localmente)
- [Segurança](#segurança)
- [Deploy](#deploy)

---

## O que faz esta API

- **Autenticação** — registro e login com email/senha; retorno de JWT.
- **Rotina** — GET/PUT dos dados da rotina do usuário autenticado (checks, tarefas customizadas, metas, pontos).
- **Persistência** — MongoDB (Mongoose); usuários e rotinas por documento.

Todas as rotas de rotina exigem o header `Authorization: Bearer <token>`.

---

## Tecnologias

| Pacote | Uso |
|--------|-----|
| **Express** | Servidor HTTP e rotas |
| **Mongoose** | ODM para MongoDB |
| **jsonwebtoken** | Geração e validação de JWT |
| **bcryptjs** | Hash de senhas |
| **cors** | Controle de origem (frontend) |
| **helmet** | Headers de segurança HTTP |
| **express-rate-limit** | Rate limit por IP |
| **dotenv** | Variáveis de ambiente |

- **Node.js** ≥ 18  
- **ES Modules** (`"type": "module"` no `package.json`)

---

## Estrutura do projeto

```
.
├── src/
│   ├── index.js          # Entrada: conecta DB e sobe o servidor
│   ├── app.js            # Express: middleware e rotas
│   ├── config/
│   │   └── db.js         # Conexão MongoDB
│   ├── controllers/
│   │   ├── auth.controller.js    # register, login
│   │   └── rotina.controller.js  # getRotina, putRotina
│   ├── middleware/
│   │   ├── auth.middleware.js    # requireAuth (JWT)
│   │   └── rateLimit.middleware.js # globalLimiter, authLimiter
│   ├── models/
│   │   ├── User.js       # Usuário (name, email, password)
│   │   └── Rotina.js     # Rotina por userId
│   └── routes/
│       ├── auth.routes.js   # POST /register, POST /login
│       └── rotina.routes.js # GET /, PUT / (com requireAuth)
├── scripts/
│   ├── verify-db.js      # Verifica conexão com o banco
│   └── reset-user-points.js
├── .env.example          # Modelo de variáveis (sem segredos)
├── package.json
└── package-lock.json
```

---

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha. **Nunca** commite o `.env`.

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `PORT` | Não (default 3000) | Porta do servidor |
| `NODE_ENV` | Produção: sim | `development` ou `production` |
| `MONGODB_URI` | Sim | Connection string do MongoDB (local ou Atlas) |
| `JWT_SECRET` | Sim (produção) | String longa e aleatória (mín. 32 caracteres) |
| `JWT_EXPIRES_IN` | Não | Tempo de vida do token (ex.: `7d`) |
| `CORS_ORIGIN` | Produção: sim | URL do frontend (ex.: `https://app-foco.vercel.app`) |
| `HOST` | Não | Para deploy (ex.: `0.0.0.0`) |
| `RATE_LIMIT_MAX_GLOBAL` | Não | Requisições por IP a cada 15 min (default 100) |
| `RATE_LIMIT_MAX_AUTH` | Não | Tentativas de login/register por IP a cada 15 min (default 10) |

Em **produção** é obrigatório: `NODE_ENV=production`, `JWT_SECRET` forte e `CORS_ORIGIN` com a URL exata do frontend.

---

## Rotas da API

### Públicas

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Mensagem de boas-vindas da API |
| GET | `/health` | Health check (`{ ok: true }`) |

### Autenticação — `/api/auth`

| Método | Rota | Body | Descrição |
|--------|------|------|-----------|
| POST | `/api/auth/register` | `{ name, email, password }` | Cria usuário; retorna `{ user, token }` |
| POST | `/api/auth/login` | `{ email, password }` | Retorna `{ user, token }` |

### Rotina — `/api/rotina` (requer `Authorization: Bearer <token>`)

| Método | Rota | Body | Descrição |
|--------|------|------|-----------|
| GET | `/api/rotina` | — | Retorna rotina do usuário (checks, customTasks, removedTaskIds, metaBonusPoints) |
| PUT | `/api/rotina` | `{ checks?, customTasks?, removedTaskIds?, metaBonusPoints? }` | Atualiza rotina (parcial) |

Respostas de erro usam `{ error: "mensagem" }` e status HTTP adequado (400, 401, 404, 429, 500).

---

## Como rodar localmente

1. **Requisitos** — Node.js ≥ 18 e MongoDB (local ou Atlas).

2. **Clone e dependências**

   ```bash
   git clone https://github.com/SEU_USUARIO/backend-foco.git
   cd backend-foco
   npm install
   ```

3. **Configure o `.env`**

   ```bash
   cp .env.example .env
   # Edite .env: MONGODB_URI, JWT_SECRET, CORS_ORIGIN (ex.: http://localhost:5500)
   ```

4. **Inicie o servidor**

   ```bash
   npm run dev
   ```

   A API fica em `http://localhost:3001` (ou a porta definida em `PORT`). O frontend deve apontar para essa URL em `js/config.js` durante o desenvolvimento.

5. **Scripts úteis**

   - `npm start` — produção
   - `npm run dev` — desenvolvimento com `--watch`
   - `npm run verify-db` — testa conexão com o MongoDB

---

## Segurança

- **Helmet** — headers HTTP de segurança (X-Content-Type-Options, X-Frame-Options, etc.).
- **CORS** — apenas origens configuradas em `CORS_ORIGIN` (em produção não use `*`).
- **Rate limit por IP** — limite global (ex.: 100 req/15 min) e limite mais restrito em `/api/auth` (ex.: 10 req/15 min) para reduzir brute force.
- **Body limit** — JSON limitado a 100 KB por requisição.
- **Senhas** — hash com bcrypt antes de persistir.
- **JWT** — validação em todas as rotas de rotina; token com expiração configurável.

---

## Deploy

Este repositório é pensado para deploy em serviços que rodam Node.js (ex.: **Render**, Railway, Fly.io).

1. Conecte o repo (a raiz do repo deve ser esta pasta, sem um nível `server/` acima).
2. Defina **Build Command:** `npm install` e **Start Command:** `npm start`.
3. Configure no painel todas as variáveis de **produção** (`NODE_ENV`, `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`, etc.).
4. Use **MongoDB Atlas** (ou outro MongoDB em nuvem) e defina `MONGODB_URI` com a connection string.
5. No frontend, defina `window.FOCO_API_URL` com a URL pública desta API.

Não inclua o arquivo `.env` no repositório; use apenas as variáveis do painel do serviço de deploy.

---

**FOCO** — progresso que importa.
