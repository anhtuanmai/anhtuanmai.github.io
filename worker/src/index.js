// Counter API for the site: views and likes, scoped by section.
//
// Endpoints
//   GET /hit/<section>/<id>/<type>   -> increments and returns { value: N }
//   GET /dec/<section>/<id>/<type>   -> decrements (clamped at 0), returns { value: N }
//   GET /get/<section>/<id>/<type>   -> reads (no change), returns { value: N }
//
// KV key shape: `<section>/<id>/<type>`
//   blog/jekyll-blog-ideas/view
//   blog/jekyll-blog-ideas/like
//   page/cv/view
//   page/home/view
//
// Notes
//   - KV is eventually consistent; concurrent writes to the same key may
//     lose at most one increment under burst traffic. Acceptable for a
//     personal site. Upgrade to Durable Objects if exact counts matter.
//   - Origin is restricted to ALLOWED_ORIGINS below; relax with care.

const ALLOWED_ORIGINS = new Set([
  'https://anhtuanmai.github.io',
  'http://localhost:4000',
  'http://127.0.0.1:4000',
]);

const PATH_RE = /^\/(hit|dec|get)\/([\w-]{1,30})\/([\w-]{1,64})\/([\w-]{1,16})$/;

function corsHeaders(origin) {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allow || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
    'Content-Type': 'application/json; charset=utf-8',
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), { status, headers });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== 'GET') {
      return json({ error: 'method not allowed' }, 405, headers);
    }

    const url = new URL(request.url);
    const m = url.pathname.match(PATH_RE);
    if (!m) {
      return json({ error: 'not found' }, 404, headers);
    }

    const [, action, section, id, type] = m;
    const fullKey = `${section}/${id}/${type}`;

    if (action === 'get') {
      const v = await env.COUNTERS.get(fullKey);
      return json({ value: v ? Number(v) : 0 }, 200, headers);
    }

    const current = Number((await env.COUNTERS.get(fullKey)) || 0);
    const next = action === 'dec' ? Math.max(0, current - 1) : current + 1;
    await env.COUNTERS.put(fullKey, String(next));
    return json({ value: next }, 200, headers);
  },
};
