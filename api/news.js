// Vercel Serverless — notícias do setor de cinema via Google News RSS.
// Não precisa de chave de API. Cada categoria é uma busca; o resultado é
// deduplicado, ordenado por data e cacheado na CDN por 30 minutos.

import { send } from './_lib/graph.js';

const CATEGORIES = {
  local:      '"cinema em Goiânia" OR "cinemas de Goiânia" OR "cinema de Goiânia" OR (Goiânia estreia filme)',
  cinema:     'estreias cinema Brasil',
  criticas:   '(crítica OR resenha OR "vale a pena") filme cinema',
  emalta:     '("maior bilheteria" OR "mais assistido" OR "lidera bilheteria" OR "sucesso de público" OR "mais vistos") (filme OR cinema OR série)',
  bilheteria: 'bilheteria cinema Brasil',
  mercado:    'exibidores cinema OR Abraplex OR Ancine OR "salas de cinema"',
  streaming:  'streaming janela cinema lançamento',
  tech:       'IMAX OR "Dolby Cinema" OR "4DX" OR "sala premium" cinema',
};

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decode(str = '') {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m)
    .trim();
}

const tag = (xml, name) => decode((xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`)) || [])[1]);

async function fetchCategory(id, query) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(`${query} when:14d`)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (AurumDashboard)' } });
  if (!res.ok) throw new Error(`Google News HTTP ${res.status}`);
  const xml = await res.text();
  return (xml.match(/<item>[\s\S]*?<\/item>/g) || []).slice(0, 15).map(item => {
    const source = tag(item, 'source');
    let title = tag(item, 'title');
    // O Google News anexa " - Fonte" ao título
    if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3));
    return {
      id: tag(item, 'guid') || tag(item, 'link'),
      title,
      link: tag(item, 'link'),
      source,
      publishedAt: new Date(tag(item, 'pubDate')).toISOString(),
      category: id,
    };
  });
}

export default async function handler(req, res) {
  const results = await Promise.allSettled(Object.entries(CATEGORIES).map(([id, q]) => fetchCategory(id, q)));

  const seen = new Set();
  const items = results
    .flatMap(r => (r.status === 'fulfilled' ? r.value : []))
    .filter(n => {
      const key = n.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 120);

  if (!items.length) {
    return send(res, 502, { error: 'Não foi possível carregar as notícias agora.' });
  }
  return send(res, 200, { updatedAt: new Date().toISOString(), items }, 1800);
}
