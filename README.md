# FOCO — Deploy (Vercel + GitHub)

Guia prático para colocar o projeto no ar usando **GitHub** e **Vercel**, e como o banco de dados funciona.

---

## O que o projeto tem

| Parte | Onde fica | O que é |
|------|-----------|---------|
| **Frontend** | Raiz do projeto (`index.html`, `css/`, `js/`, etc.) | Site estático (HTML, CSS, JavaScript) |
| **Backend (API)** | Pasta `server/` | Servidor Node.js + Express que fala com o MongoDB |
| **Banco de dados** | Nuvem (MongoDB Atlas) | Onde ficam usuários, rotinas e pontos |

- O **frontend** você sobe na **Vercel** (conectando pelo GitHub).
- O **backend** precisa rodar em um serviço que suporte Node.js 24/7 (por exemplo **Render**).
- O **banco** fica no **MongoDB Atlas** (grátis na nuvem).

---

## Opção preferida: dois repositórios

Você pode usar **dois repos no GitHub**:

| Repositório   | Conteúdo              | Onde faz deploy |
|---------------|------------------------|-----------------|
| **app-foco**  | Só frontend (HTML, css/, js/) — **sem** a pasta `server/` | Vercel |
| **backend-foco** | Só a pasta `server/` (package.json, src/, etc.)       | Render |

**Resumo do fluxo:**  
1. Cria o repo **app-foco** com o frontend → conecta na Vercel → deploy.  
2. Cria o repo **backend-foco** com a pasta `server/` → conecta no Render → deploy (com MongoDB Atlas e variáveis).  
3. No repo **app-foco**, edita `js/config.js` e coloca a URL da API do Render:  
   `window.FOCO_API_URL = "https://sua-api.onrender.com";`  
4. Dá push no **app-foco** → Vercel redeploya. **Projeto no ar.**

Se quiser tudo em um único repositório, use a opção abaixo (um repo, frontend na raiz e backend em `server/`).

---

## 1. O que subir em cada repositório

Use as listas abaixo e marque conforme for subindo. **Subir sempre o `.gitignore`** nos dois repos (ele evita que `node_modules` e `.env` entrem no Git).

---

### Frontend → repo **app-foco** (deploy na Vercel)

Tudo que fica na **raiz** do projeto FOCO, **sem** a pasta `server/`. Na raiz do repo **app-foco** deve ficar assim:

**Arquivos na raiz:**

- [ ] `.gitignore`
- [ ] `index.html`
- [ ] `app.html`
- [ ] `metas.html`
- [ ] `sobre.html`
- [ ] `informacoes.html`
- [ ] `README.md` (opcional; pode ser este ou um resumo)
- [ ] `main.js` (se existir na raiz)

**Pasta `css/` (toda):**

- [ ] `css/variables.css`
- [ ] `css/background.css`
- [ ] `css/base.css`
- [ ] `css/layout.css`
- [ ] `css/components.css`
- [ ] `css/responsive.css`
- [ ] `css/small-screen.css`
- [ ] `css/game.css`
- [ ] `css/checkbox.css`
- [ ] `css/app-menu.css`
- [ ] `css/social.css`
- [ ] `css/landing/landing.css`
- [ ] `css/landing/login.css`
- [ ] `css/landing/support.css`
- [ ] `css/landing/sobre.css`
- [ ] `css/landing/informacoes.css`

**Pasta `js/` (toda):**

- [ ] `js/config.js` ← depois do deploy do backend, coloque aqui a URL da API (Render)
- [ ] `js/api.js`
- [ ] `js/main.js`
- [ ] `js/storage.js`
- [ ] `js/sheet.js`
- [ ] `js/app-menu.js`
- [ ] `js/metas-page.js`
- [ ] `js/metas-main.js`
- [ ] `js/game.js`
- [ ] `js/state.js`
- [ ] `js/animations.js`
- [ ] `js/particles3d.js`
- [ ] `js/landing/landing.js`
- [ ] `js/landing/login.js`
- [ ] `js/landing/login-api.js`
- [ ] `js/landing/support.js`
- [ ] `js/landing/sobre.js`
- [ ] `js/landing/informacoes.js`
- [ ] `js/landing/foco3d.js`

**Pasta `img/` (toda, se existir):**

- [ ] Todos os arquivos de imagem dentro de `img/`

**Não subir no app-foco:** pasta `server/` (ela vai no backend-foco).

---

### Backend → repo **backend-foco** (deploy no Render)

Só o que está **dentro** da pasta `server/`. A **raiz** do repo **backend-foco** deve ser o conteúdo de `server/` (como se você abrisse a pasta `server` e colocasse tudo isso na raiz do repo).

**Arquivos na raiz do repo backend-foco:**

- [ ] `.gitignore` (o que está em `server/.gitignore`)
- [ ] `.env.example`
- [ ] `package.json`
- [ ] `package-lock.json`

**Pasta `src/` (toda):**

- [ ] `src/index.js`
- [ ] `src/app.js`
- [ ] `src/config/db.js`
- [ ] `src/controllers/auth.controller.js`
- [ ] `src/controllers/rotina.controller.js`
- [ ] `src/middleware/auth.middleware.js`
- [ ] `src/middleware/rateLimit.middleware.js`
- [ ] `src/models/User.js`
- [ ] `src/models/Rotina.js`
- [ ] `src/routes/auth.routes.js`
- [ ] `src/routes/rotina.routes.js`

**Pasta `scripts/` (toda):**

- [ ] `scripts/verify-db.js`
- [ ] `scripts/reset-user-points.js`

**Não subir no backend-foco:** `node_modules/`, `.env` (no Render você configura as variáveis no painel: MONGODB_URI, JWT_SECRET, CORS_ORIGIN, etc.).

---

## 2. Deploy do frontend na Vercel (pelo GitHub)

### 2.1 Criar o repositório no GitHub

1. Crie um repositório novo no GitHub (ex: `foco-app`).
2. No seu computador, na pasta do projeto, execute:

```bash
git init
git add .
git commit -m "Initial commit - FOCO"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/foco-app.git
git push -u origin main
```

(Substitua `SEU_USUARIO/foco-app` pelo seu usuário e nome do repositório.)

### 2.2 Conectar o projeto na Vercel

1. Acesse [vercel.com](https://vercel.com) e entre na sua conta (pode usar “Login with GitHub”).
2. Clique em **Add New…** → **Project**.
3. Importe o repositório do GitHub (ex: `foco-app`).
4. Configuração do projeto:
   - **Framework Preset:** deixe **Other** (ou “None”).
   - **Root Directory:** deixe em branco (raiz) para a Vercel usar a pasta onde estão os `index.html`, `css/`, `js/`.
   - **Build Command:** pode deixar em branco (site estático não precisa de build).
   - **Output Directory:** em branco.
5. Clique em **Deploy**.

Quando terminar, a Vercel vai dar uma URL tipo:  
`https://foco-app-xxx.vercel.app`.  
Essa é a URL do **frontend**.

**Na Vercel não precisa mudar mais nada:** não adicione URL da API nem variáveis de ambiente no painel. A URL da API fica só no seu código (`js/config.js`). Quem precisa de configuração é o **Render**: lá você coloca em `CORS_ORIGIN` a URL do site na Vercel (ex: `https://foco-app-xxx.vercel.app`), para o navegador permitir as requisições do frontend para a API.

---

## 3. Banco de dados (MongoDB Atlas)

O backend não usa banco “dentro” da Vercel. O banco fica na nuvem no **MongoDB Atlas**.

### 3.1 Criar o banco na nuvem

1. Acesse [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Crie uma conta (ou entre).
3. Crie um **Cluster** gratuito (M0).
4. Crie um usuário de banco (nome e senha) e anote a senha.
5. Em **Network Access**, libere o acesso: **Add IP Address** → **Allow Access from Anywhere** (ou coloque os IPs do Render quando for fazer deploy do backend).
6. No cluster, clique em **Connect** → **Connect your application** → copie a **connection string**.  
   Ela é parecida com:  
   `mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/nome-do-banco`

Substitua `usuario` e `senha` pelos dados do usuário que você criou. O `nome-do-banco` pode ser, por exemplo, `foco`.

Essa URL é a sua **MONGODB_URI** que você vai usar no backend (Render).

---

## 4. Deploy do backend (ex.: Render)

A Vercel serve o frontend; o backend (API) precisa rodar em outro lugar. Um jeito simples e gratuito é o **Render**.

### 4.1 Preparar o backend no GitHub

No repo **backend-foco**, a raiz já é o backend: `package.json` e `"start": "node src/index.js"` na raiz, pasta `src/` com o código.  
No Render, conecte o repo **backend-foco** e deixe **Root Directory** em branco. (Se usar um repo único, coloque `server` em Root Directory.)

### 4.2 Criar o serviço no Render

1. Acesse [render.com](https://render.com) e entre (pode ser com GitHub).
2. **New** → **Web Service**.
3. Conecte o mesmo repositório do GitHub (ou o repo do backend).
4. Configuração:
   - **Root Directory:** repo **backend-foco** → deixe em branco. Repo único → coloque `server`.
   - **Runtime:** Node.
   - **Build Command:** `npm install`.
   - **Start Command:** `npm start`.
5. Em **Environment** (variáveis de ambiente), adicione:

| Nome | Valor |
|------|--------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` (ou o que o Render indicar) |
| `MONGODB_URI` | A connection string do MongoDB Atlas (com usuário e senha) |
| `JWT_SECRET` | Uma string longa e aleatória (mín. 32 caracteres) |
| `CORS_ORIGIN` | A URL do frontend na Vercel (ex: `https://foco-app-xxx.vercel.app`) |

6. Crie o Web Service. O Render vai dar uma URL para a API, por exemplo:  
   `https://foco-api.onrender.com`

---

## 5. Ligar o frontend (Vercel) à API (Render)

O frontend precisa saber qual é a URL da API em produção.

1. No seu projeto, edite o arquivo **`js/config.js`** na raiz:

```javascript
// URL da sua API no Render (ou onde subiu o backend)
window.FOCO_API_URL = "https://foco-api.onrender.com";
```

2. Salve, faça commit e push para o GitHub:

```bash
git add js/config.js
git commit -m "Config: API URL para produção"
git push
```

A Vercel faz **redeploy automático** quando você dá push. Depois disso, o site na Vercel passará a usar a API no Render.

---

## 6. Resumo do fluxo

```text
Usuário acessa: https://seu-app.vercel.app (frontend na Vercel)
        ↓
Frontend (HTML/JS) chama: https://sua-api.onrender.com/api/... (backend no Render)
        ↓
Backend lê/escreve no MongoDB Atlas (banco na nuvem)
```

- **Vercel:** só serve os arquivos estáticos (páginas, CSS, JS).
- **Render:** roda o Node (Express) e recebe as chamadas da API.
- **MongoDB Atlas:** guarda usuários, rotinas e pontos; o backend acessa com a `MONGODB_URI`.

---

## 7. Checklist rápido

- [ ] Repositório no GitHub com todo o código (sem `node_modules`, sem `.env`)
- [ ] MongoDB Atlas: cluster criado, usuário e connection string
- [ ] Render: Web Service do `server/` com variáveis `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`
- [ ] Vercel: projeto conectado ao GitHub, deploy da raiz (frontend)
- [ ] `js/config.js`: `window.FOCO_API_URL` apontando para a URL da API no Render
- [ ] Push no GitHub para atualizar frontend na Vercel

Se algo falhar, confira:  
- CORS no backend com a URL exata do frontend;  
- `MONGODB_URI` correta no Render;  
- `FOCO_API_URL` no frontend igual à URL do serviço no Render (com `https://`).
