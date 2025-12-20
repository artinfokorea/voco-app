const http = require('http');
const { URL } = require('url');
const { AccessToken } = require('livekit-server-sdk');

const port = Number(process.env.PORT || 4000);
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error('Missing LIVEKIT_API_KEY or LIVEKIT_API_SECRET in env.');
  process.exit(1);
}

const withCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const server = http.createServer(async (req, res) => {
  withCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${port}`);

  if (req.method === 'GET' && url.pathname === '/token') {
    const room = url.searchParams.get('room') || 'voco-agent';
    const identity = url.searchParams.get('identity') || `user-${Date.now()}`;
    const name = url.searchParams.get('name') || identity;

    try {
      const at = new AccessToken(apiKey, apiSecret, {
        identity,
        name,
        ttl: '1h',
      });

      at.addGrant({
        roomJoin: true,
        room,
        canPublish: true,
        canSubscribe: true,
      });

      const token = await at.toJwt();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ token }));
      return;
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to generate token' }));
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(port, () => {
  console.log(`LiveKit token server listening on http://localhost:${port}/token`);
});

