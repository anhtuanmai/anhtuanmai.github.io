// Counter + comments API for the site.
//
// Endpoints
//   GET    /hit/<section>/<id>/<type>            -> increments and returns { value: N }
//   GET    /dec/<section>/<id>/<type>            -> decrements (clamped at 0), returns { value: N }
//   GET    /get/<section>/<id>/<type>            -> reads (no change), returns { value: N }
//   GET    /comments/<section>/<id>              -> returns [{id, date, name, text}, ...] (no secrets)
//   POST   /comments/<section>/<id>              -> body {date, name, text}; returns
//                                                   { comment: {id, date, name, text, secret},
//                                                     comments: [...public...] }
//   PUT    /comments/<section>/<id>/<commentId>  -> body {text}; needs author or owner; returns public list
//   DELETE /comments/<section>/<id>/<commentId>  -> needs author or owner; returns public list
//
// Auth
//   - Author edit/delete: header `X-Comment-Secret: <secret>` matching the secret
//     stored with the comment. Returned once at POST time; client keeps it in
//     localStorage and never re-fetches it.
//   - Owner escape hatch: header `Authorization: Bearer <OWNER_TOKEN>` allows
//     DELETE only (for moderating abuse). Edits are author-only.
//
// KV key shapes
//   <section>/<id>/<type>             -> stringified counter
//   comments:<section>:<id>           -> JSON array of {id, date, name, text, secret}
//   ratelimit:<ip>:<section>:<id>     -> stringified count, TTL = RATE_WINDOW_S
//
// Notes
//   - Secrets are stripped from all GET responses and from the public list
//     returned by mutations.
//   - KV is eventually consistent; concurrent writes to the same key may
//     lose at most one update under burst traffic. Acceptable for a personal site.

const ALLOWED_ORIGINS = new Set([
  'https://anhtuanmai.github.io',
  'http://localhost:4000',
  'http://127.0.0.1:4000',
]);

const COUNTER_RE = /^\/(hit|dec|get)\/([\w-]{1,30})\/([\w-]{1,64})\/([\w-]{1,16})$/;
const COMMENTS_RE = /^\/comments\/([\w-]{1,30})\/([\w-]{1,64})(?:\/([\w-]{1,24}))?$/;

const NAME_MAX = 50;
const TEXT_MAX = 1000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const RATE_WINDOW_S = 600; // 10 minutes
const RATE_MAX = 5;

function corsHeaders(origin) {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allow || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Comment-Secret',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
    'Content-Type': 'application/json; charset=utf-8',
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), { status, headers });
}

function randomHex(bytes) {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
}

function isOwner(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return !!(env.OWNER_TOKEN && token && constantTimeEqual(token, env.OWNER_TOKEN));
}

function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function publicComment(c) {
  return { id: c.id, date: c.date, name: c.name, text: c.text };
}

function publicList(list) {
  return list.map(publicComment);
}

async function readComments(env, section, id) {
  const raw = await env.COUNTERS.get(`comments:${section}:${id}`);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeComments(env, section, id, list) {
  await env.COUNTERS.put(`comments:${section}:${id}`, JSON.stringify(list));
}

async function checkRate(env, request, section, id) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `ratelimit:${ip}:${section}:${id}`;
  const current = Number((await env.COUNTERS.get(key)) || 0);
  if (current >= RATE_MAX) return false;
  await env.COUNTERS.put(key, String(current + 1), { expirationTtl: RATE_WINDOW_S });
  return true;
}

async function handleCounter(request, env, headers, m) {
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
}

async function handleComments(request, env, headers, m) {
  const [, section, id, commentId] = m;
  const method = request.method;

  if (method === 'GET') {
    const list = await readComments(env, section, id);
    return json(publicList(list), 200, headers);
  }

  if (method === 'POST' && !commentId) {
    if (!(await checkRate(env, request, section, id))) {
      return json({ error: 'rate limit exceeded' }, 429, headers);
    }
    let body;
    try { body = await request.json(); } catch { return json({ error: 'invalid json' }, 400, headers); }
    const date = String(body.date || '').trim();
    const name = String(body.name || '').trim();
    const text = String(body.text || '').trim();
    if (!DATE_RE.test(date)) return json({ error: 'invalid date' }, 400, headers);
    if (!name || name.length > NAME_MAX) return json({ error: 'invalid name' }, 400, headers);
    if (!text || text.length > TEXT_MAX) return json({ error: 'invalid text' }, 400, headers);

    const list = await readComments(env, section, id);
    const newComment = { id: randomHex(8), date, name, text, secret: randomHex(16) };
    list.push(newComment);
    await writeComments(env, section, id, list);
    return json({ comment: newComment, comments: publicList(list) }, 200, headers);
  }

  if ((method === 'PUT' || method === 'DELETE') && commentId) {
    const list = await readComments(env, section, id);
    const idx = list.findIndex((c) => c.id === commentId);
    if (idx === -1) return json({ error: 'not found' }, 404, headers);

    const providedSecret = request.headers.get('X-Comment-Secret') || '';
    const isAuthor = providedSecret && list[idx].secret && constantTimeEqual(providedSecret, list[idx].secret);
    const owner = isOwner(request, env);

    // Rate-limit only unauthenticated attempts so brute-forcing the secret
    // is throttled, while legitimate authors / the owner can edit freely.
    if (!isAuthor && !owner) {
      if (!(await checkRate(env, request, section, id))) {
        return json({ error: 'rate limit exceeded' }, 429, headers);
      }
    }

    if (method === 'PUT') {
      if (!isAuthor) return json({ error: 'unauthorized' }, 401, headers);
      let body;
      try { body = await request.json(); } catch { return json({ error: 'invalid json' }, 400, headers); }
      const text = String(body.text || '').trim();
      if (!text || text.length > TEXT_MAX) return json({ error: 'invalid text' }, 400, headers);
      // Edits are only allowed on the same calendar day the comment was posted.
      // The client sends its current local YYYY-MM-DD; we compare it to the
      // stored comment date. This is a UX rule, not a security boundary —
      // anyone with the secret could spoof, but the secret already grants edit.
      const today = String(body.date || '').trim();
      if (!DATE_RE.test(today)) return json({ error: 'invalid date' }, 400, headers);
      if (today !== list[idx].date) return json({ error: 'edit window expired' }, 403, headers);
      list[idx] = { ...list[idx], text };
      await writeComments(env, section, id, list);
      return json(publicList(list), 200, headers);
    }

    // DELETE
    if (!isAuthor && !owner) return json({ error: 'unauthorized' }, 401, headers);
    const next = list.filter((c) => c.id !== commentId);
    await writeComments(env, section, id, next);
    return json(publicList(next), 200, headers);
  }

  return json({ error: 'method not allowed' }, 405, headers);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);
    const counterMatch = url.pathname.match(COUNTER_RE);
    if (counterMatch) {
      if (request.method !== 'GET') return json({ error: 'method not allowed' }, 405, headers);
      return handleCounter(request, env, headers, counterMatch);
    }

    const commentsMatch = url.pathname.match(COMMENTS_RE);
    if (commentsMatch) {
      return handleComments(request, env, headers, commentsMatch);
    }

    return json({ error: 'not found' }, 404, headers);
  },
};
