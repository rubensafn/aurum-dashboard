// Vercel Serverless — filmes via TMDB (mesma TMDB_API_KEY do aurum-site).
// Listas: em alta na semana (mundo), em cartaz no Brasil e próximas estreias no Brasil.

import { send } from './_lib/graph.js';

const LISTS = {
  trending: 'trending/movie/week',
  nowPlaying: 'movie/now_playing',
  upcoming: 'movie/upcoming',
};

function slim(m) {
  return {
    id: m.id,
    title: m.title,
    originalTitle: m.original_title,
    overview: m.overview,
    releaseDate: m.release_date || null,
    rating: m.vote_count >= 20 ? +m.vote_average.toFixed(1) : null, // nota só com votos suficientes
    votes: m.vote_count,
    popularity: Math.round(m.popularity),
    poster: m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : null,
    url: `https://www.themoviedb.org/movie/${m.id}?language=pt-BR`,
  };
}

export default async function handler(req, res) {
  const key = process.env.TMDB_API_KEY;
  if (!key) return send(res, 503, { error: 'TMDB_API_KEY não configurada no Vercel.', code: 'not_configured' });

  const entries = await Promise.all(Object.entries(LISTS).map(async ([name, path]) => {
    const qs = new URLSearchParams({ api_key: key, language: 'pt-BR', region: 'BR', page: '1' });
    const r = await fetch(`https://api.themoviedb.org/3/${path}?${qs}`);
    const json = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(json.status_message || `TMDB HTTP ${r.status}`);
    let items = (json.results || []).map(slim);
    // TMDB às vezes devolve em "upcoming" filmes que já estrearam
    if (name === 'upcoming') {
      const today = new Date().toISOString().slice(0, 10);
      items = items.filter(m => !m.releaseDate || m.releaseDate >= today).sort((a, b) => (a.releaseDate || '').localeCompare(b.releaseDate || ''));
    }
    return [name, items.slice(0, 20)];
  })).catch(err => err);

  if (entries instanceof Error) {
    const invalidKey = /invalid api key/i.test(entries.message);
    return send(res, invalidKey ? 401 : 502, { error: entries.message, code: invalidKey ? 'invalid_key' : null });
  }
  return send(res, 200, { updatedAt: new Date().toISOString(), ...Object.fromEntries(entries) }, 10800);
}
