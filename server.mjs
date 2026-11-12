import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, join, sep } from 'node:path';

const ROOT = resolve(import.meta.dirname);
const PORT = Number(process.env.PORT || 4173);
const cache = new Map();
const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml', '.json':'application/json; charset=utf-8', '.webmanifest':'application/manifest+json', '.png':'image/png' };
const clamp = (n, min, max, fallback) => Number.isFinite(Number(n)) ? Math.max(min, Math.min(max, Number(n))) : fallback;
const validCode = value => /^[A-Z]{3}$/.test(value || '');
const dayISO = (offset) => new Date(Date.now() + offset*864e5).toISOString().slice(0,10);

async function remote(url, ttl = 600000) {
  const key = url.toString();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return {data: hit.data, updatedAt:hit.at, cached:true};
  try {
    const response = await fetch(url, {headers: {'User-Agent':'ORadar-MVP/0.1 (educational noncommercial evaluation)', 'Accept':'application/json'}, signal:AbortSignal.timeout(12000)});
    if (!response.ok) throw new Error(`Fonte respondeu HTTP ${response.status}`);
    const data = await response.json();
    cache.set(key, {data, at:Date.now()});
    return {data, updatedAt:Date.now(), cached:false};
  } catch (err) {
    if (hit) return {data:hit.data, updatedAt:hit.at, cached:true, stale:true};
    throw err;
  }
}

async function routeAPI(url) {
  const p = url.searchParams;
  if (url.pathname === '/api/geocode') {
    const q = (p.get('q') || '').trim().slice(0,90);
    if (q.length < 2) throw new Error('Informe pelo menos 2 caracteres para procurar a cidade.');
    const u = new URL('https://geocoding-api.open-meteo.com/v1/search');
    u.search = new URLSearchParams({name:q, count:'8', language:'pt', format:'json'}).toString();
    return remote(u, 86400000);
  }
  if (url.pathname === '/api/weather') {
    const latitude = clamp(p.get('lat'), -90, 90, NaN);
    const longitude = clamp(p.get('lon'), -180, 180, NaN);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error('Coordenadas inválidas.');
    const u = new URL('https://api.open-meteo.com/v1/forecast');
    u.search = new URLSearchParams({latitude:String(latitude), longitude:String(longitude), current:'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,apparent_temperature', daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max', hourly:'precipitation_probability,temperature_2m', forecast_days:'7', timezone:'auto'}).toString();
    return remote(u, 12 * 60000);
  }
  if (url.pathname === '/api/quakes') {
    const period = ['day','week','month'].includes(p.get('period')) ? p.get('period') : 'week';
    const u = new URL(`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_${period}.geojson`);
    return remote(u, 6 * 60000);
  }
  if (url.pathname === '/api/solar') {
    const [forecast, alerts] = await Promise.allSettled([
      remote(new URL('https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json'), 15*60000),
      remote(new URL('https://services.swpc.noaa.gov/products/alerts.json'), 15*60000)
    ]);
    if (forecast.status === 'rejected' && alerts.status === 'rejected') throw new Error('NOAA temporariamente indisponível.');
    return {data:{forecast:forecast.status === 'fulfilled' ? forecast.value.data : [], alerts:alerts.status === 'fulfilled' ? alerts.value.data : []}, updatedAt:Date.now(), cached:false};
  }
  if (url.pathname === '/api/asteroids') {
    const period = ['past30','future30','past365'].includes(p.get('period')) ? p.get('period') : 'future30';
    const days = period === 'past365' ? [-365,0] : period === 'past30' ? [-30,0] : [0,30];
    const u = new URL('https://ssd-api.jpl.nasa.gov/cad.api');
    u.search = new URLSearchParams({'date-min':dayISO(days[0]), 'date-max':dayISO(days[1]), 'dist-max':'20LD', 'body':'Earth', 'sort':period.startsWith('past') ? '-date' : 'date', 'limit':'80', 'diameter':'true'}).toString();
    return remote(u, 4*3600000);
  }
  if (url.pathname === '/api/events') {
    const u = new URL('https://eonet.gsfc.nasa.gov/api/v3/events');
    u.search = new URLSearchParams({status:'all', days:'30', limit:'120'}).toString();
    return remote(u, 30*60000);
  }
  if (url.pathname === '/api/fx') {
    const base = (p.get('base') || 'BRL').toUpperCase();
    if (!validCode(base)) throw new Error('Código de moeda inválido.');
    const others = ['USD','EUR','GBP','JPY','CHF','CNY','BRL','CLP','ARS','CAD','AUD','MXN','INR'].filter(c=>c!==base);
    const u = new URL('https://api.frankfurter.dev/v2/rates');
    u.search = new URLSearchParams({base, quotes:others.join(',')}).toString();
    return remote(u, 60*60000);
  }
  throw new Error('Rota de API não encontrada.');
}

const server = createServer(async (req, res) => {
  const send = (code, data) => {
    res.writeHead(code, {'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'});
    res.end(JSON.stringify(data));
  };
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(405,{error:'Método não permitido'});
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) {
      try { send(200, await routeAPI(url)); }
      catch (e) { send(502,{error:e.message || 'Fonte temporariamente indisponível'}); }
      return;
    }
    const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const target = resolve(ROOT, '.'+pathname);
    if (target !== ROOT && !target.startsWith(ROOT+sep)) return send(403,{error:'Proibido'});
    const fileStat = await stat(target);
    if (!fileStat.isFile()) return send(404,{error:'Não encontrado'});
    const data = await readFile(target);
    res.writeHead(200, {'Content-Type':MIME[extname(target)] || 'application/octet-stream', 'Cache-Control':'no-cache', 'X-Content-Type-Options':'nosniff'});
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { send(404,{error:'Página não encontrada'}); }
});
server.listen(PORT, process.env.HOST || '0.0.0.0', () => console.log(`ORadar ouvindo na porta ${PORT}`));
