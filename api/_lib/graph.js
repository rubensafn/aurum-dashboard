// Helpers compartilhados das funções Vercel (arquivos com "_" não viram rota).
// Suporta os dois fluxos oficiais da Meta:
//  - "facebook": Instagram Graph API via Facebook Login (graph.facebook.com).
//    Token começa com "EAA". Permite business_discovery (concorrentes).
//  - "instagram": Instagram API com Instagram Login (graph.instagram.com).
//    Token começa com "IG". NÃO permite business_discovery.

const VERSION = process.env.INSTAGRAM_GRAPH_VERSION || 'v23.0';

export function getConfig() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN || '';
  const explicit = (process.env.INSTAGRAM_API || '').toLowerCase();
  const mode = explicit === 'instagram' || explicit === 'facebook'
    ? explicit
    : token.startsWith('IG') ? 'instagram' : 'facebook';
  const host = mode === 'instagram' ? 'https://graph.instagram.com' : 'https://graph.facebook.com';
  return { token, mode, base: `${host}/${VERSION}`, accountId: process.env.INSTAGRAM_ACCOUNT_ID || '' };
}

export class GraphError extends Error {
  constructor(message, code, status = 502) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function graph(cfg, path, params = {}) {
  const qs = new URLSearchParams({ ...params, access_token: cfg.token });
  const res = await fetch(`${cfg.base}/${path}?${qs}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    const e = json.error || {};
    // Código 190 = token inválido/expirado
    throw new GraphError(e.message || `Graph API HTTP ${res.status}`, e.code, e.code === 190 ? 401 : 502);
  }
  return json;
}

// Descobre o ID da conta IG profissional quando INSTAGRAM_ACCOUNT_ID não foi definido.
export async function resolveAccountId(cfg) {
  if (cfg.accountId) return cfg.accountId;
  if (cfg.mode === 'instagram') {
    const me = await graph(cfg, 'me', { fields: 'user_id' });
    return me.user_id || me.id;
  }
  const pages = await graph(cfg, 'me/accounts', { fields: 'instagram_business_account{id,username}' });
  const page = (pages.data || []).find(p => p.instagram_business_account);
  if (!page) throw new GraphError('Nenhuma conta Instagram profissional vinculada às páginas deste token.', 'no_account', 500);
  return page.instagram_business_account.id;
}

export function send(res, status, body, cacheSeconds = 0) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (cacheSeconds) res.setHeader('Cache-Control', `s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 4}`);
  else res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
}
