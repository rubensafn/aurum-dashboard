# Aurum Cinema Dashboard — CLAUDE.md

## Stack
- React 19 + Vite 5
- Recharts para gráficos
- Deploy: Vercel
- Domínio: a definir (site institucional: aurumcinema.com.br)

## Cliente
- Aurum Cinema — Av. Dep. Jamel Cecílio, KM 01, Jardim Goiás, Goiânia/GO
- Instagram: @aurum.cinema
- Fontes: Cinzel (títulos/números, `C.display`) + Inter (interface, `C.font`) — Google Fonts em index.html
- Paleta oficial: #1B1B1B · ouro #DAA520 · areia #C9A94F · creme #F3EFE9 · vinho #4A1625 · verde #032B2A
- Brandkit: `C:/Users/ruben/aurum-brandkit-final`

## Fluxo de branches

| Branch | Ambiente | URL |
|--------|----------|-----|
| `main` | Produção | (a definir) |
| `dev`  | Preview  | URL automática Vercel |

### Regra: nunca commitar direto na `main`. Sempre trabalhar na `dev`.

```bash
git checkout dev
git add .
git commit -m "feat: descrição"
git push
# Quando aprovado:
git checkout main && git merge dev && git push && git checkout dev
```

## Estrutura do projeto

```
src/
  App.jsx        # Toda a aplicação (único arquivo)
  index.css      # Estilos globais (glass, metal-text dourado, glow-btn)
  main.jsx       # Entry point
public/
  favicon.svg / favicon.png   # Símbolo AU
  logo-aurum-branca.svg       # Logo Aurum Cinema (branca, sidebar)
  au-symbol.svg               # Símbolo AU dourado (sidebar recolhida)
api/
  _lib/graph.js  # Helpers Graph API (não vira rota)
  instagram.js   # status | summary | competitors (business_discovery)
  news.js        # Google News RSS — sem chave
```

## Integrações

Passo a passo completo no README.md. Resumo:
- `INSTAGRAM_ACCESS_TOKEN` no Vercel — preferir System User token (EAA…, não expira, libera concorrentes)
- `INSTAGRAM_ACCOUNT_ID` opcional (descoberto pela Página vinculada)
- Notícias não precisam de chave
- `npm run dev` não executa /api — usar `vercel dev` para testar integrações

## Módulos do dashboard

| Módulo | Descrição |
|--------|-----------|
| Visão Geral | Cards de stats + gráfico de seguidores |
| Projetos | Kanban de campanhas com 11 status + drag & drop |
| Conteúdo | Gestor de posts por plataforma |
| Calendário | Visualização mensal de conteúdo agendado |
| Analytics | Instagram real (@aurum.cinema) — alcance, views, seguidores, posts |
| Concorrentes | Cinemas de Goiânia com métricas ao vivo (business_discovery) |
| Filmes | TMDB — em alta, em cartaz BR, próximas estreias (`TMDB_API_KEY`) |
| Notícias | Google News RSS por categoria (inclui Em alta e Críticas), com busca e marcação de lidas |

## Cores principais

```js
accent:  "#C9A94F"  // areia/ouro
accentHi:"#DAA520"  // ouro
bg:      "#0C0B09"  // fundo
surface: "#14120E"  // surface dos cards
text1:   "#F3EFE9"  // creme
```

## Deploy

Push em `dev` → preview automático no Vercel
Push em `main` → produção

```bash
npm run dev      # servidor local
npm run build    # build de produção
npm run preview  # preview do build
```
