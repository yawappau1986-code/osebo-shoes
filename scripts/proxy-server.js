require('dotenv').config({ path: '.env' });
const http = require('http');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const PORT = process.env.PROXY_PORT ? Number(process.env.PROXY_PORT) : 3001;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  });
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
    });
    res.end();
    return;
  }

  if (req.url === '/health') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.url === '/api/products') {
    const { data, error } = await supabase.from('products').select('*');

    if (error) {
      sendJson(res, 500, { error: error.message, details: error.details ?? null });
      return;
    }

    sendJson(res, 200, data ?? []);
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Supabase proxy listening on http://localhost:${PORT}`);
});
