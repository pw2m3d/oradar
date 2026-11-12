# Publicar ORadar no GitHub + Render

## Por que não basta GitHub Pages?
GitHub Pages hospeda HTML/CSS/JS estáticos, mas ORadar 0.1 depende das rotas `/api/*` implementadas no `server.mjs` em Node.js.

## Passo a passo (sem compilar)
1. Crie um repositório no GitHub chamado `oradar` (público ou privado).
2. Envie **todos os arquivos desta pasta para a raiz do repositório**: `index.html`, `app.js`, `styles.css`, `server.mjs`, `package.json`, etc. Não envie apenas o ZIP.
3. Entre em https://dashboard.render.com e conecte sua conta do GitHub.
4. Selecione **New > Web Service** e escolha o repositório `oradar`.
5. Configure: **Language/Runtime: Node**, **Branch: main**, **Build Command: `node --version`**, **Start Command: `node server.mjs`**, **Plan: Free** (se disponível).
6. Clique em **Create Web Service**. Aguarde o deploy finalizar e abra a URL `https://SEU-SERVICO.onrender.com` exibida pelo Render.
7. Teste cidade, clima, país/câmbio, planeta/asteroides. Dados externos dependem das APIs públicas e podem falhar ou sofrer limites.

O `render.yaml` também permite configurar o serviço como Blueprint (opcional).

## Como testar localmente
Com Node.js 22+:

```bash
node server.mjs
```

Depois, acesse http://localhost:4173.

## Limitações
- No plano Free, o Render pode adormecer após inatividade; a primeira abertura poderá demorar.
- As respostas das APIs são guardadas apenas em memória e o cache se perde quando o serviço reinicia.
- A API Open-Meteo gratuita se destina a usos não comerciais. Rever a licença ANTES de vender ou ativar publicidade.
- Não é um serviço oficial de emergências e não gera alertas de perigo em tempo real.
- Esta versão ainda não é um aplicativo Android/iOS nem um serviço pronto para produção.
