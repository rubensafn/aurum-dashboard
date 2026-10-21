# Aurum Cinema — Dashboard

Painel de marketing do **Aurum Cinema** (Goiânia/GO · [@aurum.cinema](https://instagram.com/aurum.cinema)).
React 19 + Vite + Recharts, com funções serverless da Vercel em `api/`.

```bash
npm install
npm run dev      # só o front — as rotas /api NÃO rodam aqui
vercel dev       # front + /api (precisa da Vercel CLI e de um .env local)
npm run build
```

## Integrações

| Rota | Fonte | Precisa de chave? |
|------|-------|-------------------|
| `/api/instagram?endpoint=summary` | Instagram Graph API — perfil, alcance, visualizações, visitas, contas engajadas (28d vs 28d anteriores), séries diárias e posts | Sim |
| `/api/instagram?endpoint=competitors&usernames=a,b` | `business_discovery` — seguidores, engajamento médio e frequência de posts de perfis públicos profissionais | Sim (token "EAA…") |
| `/api/instagram?endpoint=status` | Diz se o token está configurado e qual fluxo | — |
| `/api/news` | Google News RSS (8 buscas: Goiânia, em alta, críticas, estreias, bilheteria, mercado, streaming, tecnologia) | Não |
| `/api/movies` | TMDB — em alta na semana, em cartaz no Brasil, próximas estreias BR (com nota) | Sim (`TMDB_API_KEY`) |

As respostas ficam em cache na CDN da Vercel (Instagram 15 min, concorrentes 1 h, notícias 30 min, filmes 3 h).

## Conectar o TMDB (aba Filmes)

É a mesma chave já usada no projeto **aurum-site**. Na Vercel → projeto *aurum-site* → Settings →
Environment Variables → copie o valor de `TMDB_API_KEY` e crie a mesma variável no projeto do dashboard.
Sem acesso a ela: crie conta grátis em [themoviedb.org](https://www.themoviedb.org/signup) →
Configurações → API → solicite uma chave (uso não comercial/pessoal é aprovado na hora) e use a "Chave da API (v3)".
O token **nunca** vai para o navegador.

## Conectar o Instagram (@aurum.cinema)

Pré-requisito: a conta @aurum.cinema precisa ser **profissional (Empresa ou Criador)** e estar
vinculada a uma **Página do Facebook** dentro de um **Portfólio empresarial** (Meta Business Suite).

### Opção A — System User token (recomendado: não expira + libera concorrentes)

1. Em [developers.facebook.com](https://developers.facebook.com/apps) → **Criar app** → tipo **Empresa**,
   vinculado ao portfólio do Aurum.
2. No app, adicione o produto **Instagram** → *API setup with Facebook login*.
3. Em [business.facebook.com/settings](https://business.facebook.com/settings) → **Usuários → Usuários do sistema**
   → *Adicionar* (função Administrador).
4. Em **Atribuir ativos**, dê ao usuário do sistema acesso à **Página** do Aurum e ao **app** criado.
5. Clique em **Gerar novo token** → selecione o app → validade **Nunca** → marque as permissões:
   `instagram_basic`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement`, `business_management`.
6. Copie o token (começa com `EAA`).
7. Na Vercel → projeto → **Settings → Environment Variables**, crie `INSTAGRAM_ACCESS_TOKEN` (Production e Preview).
   `INSTAGRAM_ACCOUNT_ID` é opcional — a função descobre o ID pela Página vinculada.
8. Faça um novo deploy (variáveis só valem para deploys feitos depois de criadas).
9. Teste: `https://<seu-deploy>/api/instagram?endpoint=status` deve responder `"configured":true,"mode":"facebook"`.

### Opção B — Instagram Login (mais simples, mas limitado)

App → produto Instagram → *API setup with Instagram login* → gere o token da conta @aurum.cinema
(começa com `IG`). Funciona para o Analytics, mas **expira em 60 dias** e **não** permite os dados de concorrentes.

### Erros comuns

| Mensagem no painel | Causa |
|--------------------|-------|
| "falta configurar INSTAGRAM_ACCESS_TOKEN" | Variável ausente ou deploy anterior à variável |
| "token expirado ou inválido" | Gere outro token (Opção A evita isso) |
| "Métricas de concorrentes exigem token do fluxo Facebook Login" | Token `IG…` em uso — use a Opção A |
| "Perfil não encontrado ou não é conta profissional" | O @ do concorrente está errado ou é conta pessoal — edite na aba Concorrentes |
| Série de novos seguidores vazia | A Meta só fornece para contas com 100+ seguidores |

## Concorrentes

A lista inicial (Cinemark, Kinoplex, Cinépolis, Lumière) fica em `iCompetitors` no `src/App.jsx`.
Os **@ precisam ser confirmados** — se algum vier como "não encontrado", remova o card e adicione com o @ certo.
Adições/remoções ficam salvas no navegador (localStorage).

## Marca

Paleta oficial (brandkit Aurum): preto `#1B1B1B`, ouro `#DAA520`, areia `#C9A94F`, creme `#F3EFE9`,
vinho `#4A1625`, verde `#032B2A`. Tipografia: **Cinzel** (títulos e números) + **Inter** (interface).
Logos em `public/` (`logo-aurum-branca.svg`, `au-symbol.svg`).
