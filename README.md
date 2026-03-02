# FOCO — Frontend

> **Rotina em jogo.** Cada conclusão vira ponto. Cada ponto sobe seu nível.

Interface do FOCO: landing, login, app de rotina com planilha de tarefas, metas e sistema de níveis. Site estático (HTML, CSS e JavaScript) que consome a [API FOCO](https://github.com/SEU_USUARIO/backend-foco) para autenticação e persistência.

---

## Conteúdo

- [O que é o FOCO](#o-que-é-o-foco)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Como rodar localmente](#como-rodar-localmente)
- [Configuração](#configuração)
- [Páginas](#páginas)

---

## O que é o FOCO

O FOCO é um app de **rotina gamificada**: você marca tarefas concluídas, ganha pontos, sobe de nível e acompanha metas. Tudo com uma interface visual e objetiva, sem listas sem graça.

- **Landing** — apresentação e acesso (login/registro)
- **App** — planilha de tarefas, pontos, nível e efeitos visuais
- **Metas** — acompanhamento de metas e bônus
- **Sobre / Informações** — conteúdo institucional e de suporte

---

## Tecnologias

| Tipo        | Uso                          |
|------------|------------------------------|
| **HTML5**  | Páginas semânticas e acessíveis |
| **CSS3**   | Variáveis, layout, responsivo, animações |
| **JavaScript** | Lógica, chamadas à API, estado da aplicação |
| **API REST**  | Backend separado (Node.js + MongoDB); autenticação via JWT |

Sem frameworks: HTML, CSS e JS vanilla para facilitar leitura e deploy em qualquer hospedagem estática (ex.: Vercel).

---

## Estrutura do projeto

```
.
├── index.html          # Landing (entrada do site)
├── app.html            # App principal (rotina, pontos, níveis)
├── metas.html          # Página de metas
├── sobre.html          # Sobre
├── informacoes.html    # Informações
├── js/
│   ├── config.js       # ⚙️ URL da API (único ponto de configuração)
│   ├── api.js          # Chamadas à API (auth, rotina)
│   ├── main.js         # Lógica principal do app
│   ├── storage.js      # Estado local / sincronização
│   ├── sheet.js        # Planilha de tarefas
│   ├── game.js         # Pontos e nível
│   └── landing/        # Scripts da landing (login, suporte, etc.)
├── css/
│   ├── variables.css   # Cores, fontes, espaçamentos
│   ├── base.css        # Reset e estilos base
│   ├── layout.css      # Layout do app
│   ├── components.css  # Componentes reutilizáveis
│   ├── game.css        # Estilos de pontos/nível
│   └── landing/        # Estilos da landing
└── img/                # Imagens e assets
```

- **`js/config.js`** — define a URL do backend; é o único arquivo que você altera para apontar para produção ou desenvolvimento.
- **`js/api.js`** — centraliza as requisições (login, registro, GET/PUT da rotina).
- **`js/landing/`** — lógica da landing (login, registro, suporte, abas).

---

## Como rodar localmente

1. **Clone o repositório**

   ```bash
   git clone https://github.com/SEU_USUARIO/app-foco.git
   cd app-foco
   ```

2. **Configure a API**  
   Edite `js/config.js` e defina a URL do backend:
   - Desenvolvimento (backend na sua máquina na porta 3001):  
     `window.FOCO_API_URL = "http://localhost:3001";`
   - Produção:  
     `window.FOCO_API_URL = "https://sua-api.onrender.com";`

3. **Sirva os arquivos**  
   Abra a pasta com um servidor local para evitar problemas de CORS ao chamar a API:
   - **VS Code:** extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) → “Go Live” na pasta do projeto.
   - **Linha de comando:**  
     `npx serve .`  
     ou  
     `python -m http.server 8080`  
     e acesse `http://localhost:8080` (ou a porta indicada).

4. **Backend**  
   Para login e persistência funcionarem, o backend precisa estar no ar (local ou em produção) e com CORS liberado para a origem do frontend (ex.: `http://127.0.0.1:5500` ou `http://localhost:8080`).

---

## Configuração

Toda a configuração do frontend está em **`js/config.js`**:

```javascript
// Deixe vazio para desenvolvimento com backend em localhost:3001
// Preencha com a URL da API em produção (ex.: Vercel + Render)
window.FOCO_API_URL = "";  // ex.: "https://sua-api.onrender.com"
```

- **Vazio** — o código pode usar fallback para `http://localhost:3001` em desenvolvimento.
- **Preenchido** — todas as chamadas à API usam essa URL (obrigatório em produção).

Nada mais precisa ser alterado no frontend para trocar entre dev e produção.

---

## Páginas

| Página           | Arquivo           | Descrição |
|------------------|-------------------|-----------|
| **Landing**      | `index.html`      | Página inicial, login e registro em modal |
| **App**          | `app.html`        | Planilha de tarefas, pontos, nível, menu |
| **Metas**        | `metas.html`      | Metas e bônus de pontos |
| **Sobre**        | `sobre.html`      | Conteúdo sobre o projeto |
| **Informações**  | `informacoes.html`| Informações e suporte |

A navegação entre páginas é feita por links normais; o app principal (`app.html`) usa o token JWT guardado no frontend para autenticar as requisições à API.

---

## Deploy

Este repositório é pensado para deploy como **site estático**:

- **Vercel** — conecte o repo e faça deploy; não é necessário configurar build.
- **Netlify, GitHub Pages, etc.** — basta apontar para a raiz do projeto.

Lembre-se de definir em **`js/config.js`** a URL da API em produção e de configurar **CORS** no backend para a URL do seu frontend.

---

Se tiver dúvidas ou quiser contribuir, abra uma issue ou entre em contato.  
**FOCO** — progresso que importa.
