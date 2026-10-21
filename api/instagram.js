// Vercel Serverless — proxy da Instagram Graph API (@aurum.cinema)
// O token fica só no servidor; o front chama /api/instagram?endpoint=...
//
// endpoints:
//   status       → diz se está configurado e qual fluxo (facebook|instagram)
//   summary      → perfil + métricas 28d (com período anterior) + séries diárias + posts
//   competitors  → ?usernames=a,b,c — métricas públicas via business_discovery

import { getConfig, graph, resolveAccountId, send, GraphError } from './_lib/graph.js';

const DAY = 86400;
const PROFILE_FIELDS = 'id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url';
const MEDIA_FIELDS = 'id,caption,media_type,media_product_type,timestamp,thumbnail_url,media_url,permalink,like_count,comments_count';
const TOTAL_METRICS = 'reach,views,profile_views,accounts_engaged,total_interactions';

const now = () => Math.floor(Date.now() / 1000);

function totalsFrom(json) {
  const out = {};
  for (const m of json.data || []) out[m.name] = m.total_value?.value ?? null;
  return out;
}

function seriesFrom(json) {
  const out = {};
  for (const m of json.data || []) {
    out[m.name] = (m.values || []).map(v => ({ date: v.end_time?.slice(0, 10), value: v.value }));
  }
  return out;
}

function engagementRate(posts, followers) {
  if (!followers || !posts.length) return null;
  const avg = posts.reduce((s, p) => s + (p.like_count || 0) + (p.comments_count || 0), 0) / posts.length;
  return +(avg / followers * 100).toFixed(2);
}

function postsPerWeek(posts) {
  const cutoff = Date.now() - 28 * DAY * 1000;
  return +(posts.filter(p => new Date(p.timestamp).getTime() >= cutoff).length / 4).toFixed(1);
}

async function summary(cfg) {
  const id = await resolveAccountId(cfg);
  const t = now();
  const errors = [];
  const settle = (label, p) => p.catch(e => { errors.push(`${label}: ${e.message}`); return null; });

  // Métricas de conta só aceitam janelas de até 30 dias — usamos 28d e os 28d anteriores para comparação.
  const [profile, media, current, previous, series, followers] = await Promise.all([
    graph(cfg, id, { fields: PROFILE_FIELDS }),
    settle('media', graph(cfg, `${id}/media`, { fields: MEDIA_FIELDS, limit: 25 })),
    settle('insights', graph(cfg, `${id}/insights`, { metric: TOTAL_METRICS, metric_type: 'total_value', period: 'day', since: t - 28 * DAY, until: t })),
    settle('insights anteriores', graph(cfg, `${id}/insights`, { metric: TOTAL_METRICS, metric_type: 'total_value', period: 'day', since: t - 56 * DAY, until: t - 28 * DAY })),
    settle('série de alcance', graph(cfg, `${id}/insights`, { metric: 'reach', period: 'day', since: t - 28 * DAY, until: t })),
    // follower_count só existe para contas com 100+ seguidores e cobre os últimos 30 dias
    settle('série de seguidores', graph(cfg, `${id}/insights`, { metric: 'follower_count', period: 'day', since: t - 28 * DAY, until: t })),
  ]);

  const posts = media?.data || [];
  return {
    source: cfg.mode,
    updatedAt: new Date().toISOString(),
    profile,
    engagementRate: engagementRate(posts.slice(0, 12), profile.followers_count),
    postsPerWeek: postsPerWeek(posts),
    totals: current ? totalsFrom(current) : null,
    previous: previous ? totalsFrom(previous) : null,
    series: { ...(series ? seriesFrom(series) : {}), ...(followers ? seriesFrom(followers) : {}) },
    posts,
    errors,
  };
}

async function competitors(cfg, usernamesParam) {
  if (cfg.mode !== 'facebook') {
    throw new GraphError('Dados de concorrentes exigem token do fluxo Facebook Login (business_discovery). O token atual é do Instagram Login.', 'needs_facebook', 400);
  }
  const usernames = String(usernamesParam || '')
    .split(',')
    .map(u => u.trim().replace(/^@/, '').toLowerCase())
    .filter(u => /^[a-z0-9._]{1,30}$/.test(u))
    .slice(0, 12);
  if (!usernames.length) return { items: [] };

  const id = await resolveAccountId(cfg);
  const items = await Promise.all(usernames.map(async username => {
    try {
      const json = await graph(cfg, id, {
        fields: `business_discovery.username(${username}){username,name,followers_count,media_count,profile_picture_url,media.limit(12){timestamp,like_count,comments_count}}`,
      });
      const bd = json.business_discovery;
      const posts = bd.media?.data || [];
      return {
        username,
        ok: true,
        name: bd.name,
        followers: bd.followers_count,
        mediaCount: bd.media_count,
        picture: bd.profile_picture_url,
        engagementRate: engagementRate(posts, bd.followers_count),
        postsPerWeek: postsPerWeek(posts),
        lastPost: posts[0]?.timestamp || null,
      };
    } catch (e) {
      if (e.code === 190) throw e; // token inválido afeta todos — não é problema do perfil
      // Perfil pessoal, inexistente ou privado: business_discovery só enxerga contas profissionais
      return { username, ok: false, error: e.message };
    }
  }));
  return { updatedAt: new Date().toISOString(), items };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Método não permitido' });

  const cfg = getConfig();
  const { endpoint = 'summary', usernames } = req.query;

  if (endpoint === 'status') {
    return send(res, 200, { configured: !!cfg.token, mode: cfg.token ? cfg.mode : null, hasAccountId: !!cfg.accountId });
  }
  if (!cfg.token) {
    return send(res, 503, { error: 'INSTAGRAM_ACCESS_TOKEN não configurado nas variáveis de ambiente do Vercel.', code: 'not_configured' });
  }

  try {
    if (endpoint === 'summary') return send(res, 200, await summary(cfg), 900);
    if (endpoint === 'competitors') return send(res, 200, await competitors(cfg, usernames), 3600);
    return send(res, 404, { error: `Endpoint desconhecido: ${endpoint}` });
  } catch (err) {
    const status = err instanceof GraphError ? err.status : 500;
    return send(res, status, { error: err.message, code: err.code ?? null });
  }
}
