import http from 'http';
import https from 'https';
import { URL } from 'url';

export const config = {
  api: {
    responseLimit: false,
  },
};

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true,
});

const httpAgent = new http.Agent({
  keepAlive: true,
});

const MAX_REDIRECTS = 6;

function fetchWithRedirect(targetUrl: string, clientReq: any, clientRes: any, redirectCount = 0) {
  if (redirectCount > MAX_REDIRECTS) {
    if (!clientRes.headersSent) {
      clientRes.status(508).json({ error: 'Demasiadas redirecciones en el servidor IPTV' });
    }
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch (err: any) {
    if (!clientRes.headersSent) {
      clientRes.status(400).json({ error: 'URL inválida: ' + err.message });
    }
    return;
  }

  const isHttps = parsed.protocol === 'https:';
  const client = isHttps ? https : http;
  const agent = isHttps ? httpsAgent : httpAgent;

  const headers: Record<string, string> = {
    'User-Agent': (clientReq.headers['user-agent'] as string) || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Connection': 'keep-alive',
  };

  // Forward Range header for video seeking & partial content
  if (clientReq.headers.range) {
    headers['Range'] = clientReq.headers.range as string;
  }

  const proxyReq = client.request(
    parsed,
    {
      method: clientReq.method === 'HEAD' ? 'HEAD' : 'GET',
      headers,
      agent,
      timeout: 30000,
    },
    (remoteRes) => {
      const statusCode = remoteRes.statusCode || 200;

      // Handle 301, 302, 303, 307, 308 redirects (Xtream Codes frequently redirects to load balancer nodes)
      if ([301, 302, 303, 307, 308].includes(statusCode) && remoteRes.headers.location) {
        let redirectUrl = remoteRes.headers.location;
        if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
          redirectUrl = new URL(redirectUrl, targetUrl).toString();
        }
        console.log(`[Proxy] Following redirect (${statusCode}) to: ${redirectUrl}`);
        remoteRes.resume();
        return fetchWithRedirect(redirectUrl, clientReq, clientRes, redirectCount + 1);
      }

      // Check if this is an M3U8 playlist
      const contentType = remoteRes.headers['content-type'] || '';
      const isM3u8 = contentType.includes('mpegurl') || parsed.pathname.toLowerCase().endsWith('.m3u8');

      if (isM3u8 && clientReq.method !== 'HEAD') {
        let data = '';
        remoteRes.setEncoding('utf8');
        remoteRes.on('data', (chunk: string) => {
          data += chunk;
        });
        remoteRes.on('end', () => {
          const lines = data.split('\n');
          const rewrittenLines = lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return line;
            let fullSegmentUrl: string;
            if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
              fullSegmentUrl = trimmed;
            } else {
              fullSegmentUrl = new URL(trimmed, targetUrl).toString();
            }
            return `/api/proxy?url=${encodeURIComponent(fullSegmentUrl)}`;
          });
          const modifiedBody = rewrittenLines.join('\n');

          clientRes.writeHead(statusCode, {
            'Content-Type': 'application/vnd.apple.mpegurl',
            'Content-Length': Buffer.byteLength(modifiedBody),
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          });
          clientRes.end(modifiedBody);
        });
        return;
      }

      // Direct video streams (MP4, MKV, TS, etc.)
      const outHeaders: Record<string, string> = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
        'Accept-Ranges': 'bytes',
      };

      const forwardHeaders = [
        'content-type',
        'content-length',
        'content-range',
        'accept-ranges',
        'last-modified',
        'etag',
        'cache-control'
      ];
      for (const h of forwardHeaders) {
        if (remoteRes.headers[h]) {
          outHeaders[h] = remoteRes.headers[h] as string;
        }
      }

      // Infer Content-Type if missing or generic
      if (!outHeaders['content-type'] || outHeaders['content-type'] === 'application/octet-stream' || outHeaders['content-type'] === 'binary/octet-stream') {
        const fullUrl = ((clientReq.query?.url as string) || targetUrl).toLowerCase();
        const currentPath = parsed.pathname.toLowerCase();
        if (fullUrl.includes('.mp4') || currentPath.endsWith('.mp4')) {
          outHeaders['content-type'] = 'video/mp4';
        } else if (fullUrl.includes('.mkv') || currentPath.endsWith('.mkv')) {
          outHeaders['content-type'] = 'video/x-matroska';
        } else if (fullUrl.includes('.ts') || currentPath.endsWith('.ts')) {
          outHeaders['content-type'] = 'video/mp2t';
        }
      }

      clientRes.writeHead(statusCode, outHeaders);
      remoteRes.pipe(clientRes);

      remoteRes.on('error', (err) => {
        console.error('[Proxy] Stream pipe error:', err);
        if (!clientRes.headersSent) {
          clientRes.status(502).end();
        }
      });
    }
  );

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    if (!clientRes.headersSent) {
      clientRes.status(504).json({ error: 'Tiempo de espera agotado al conectar con el servidor IPTV' });
    }
  });

  proxyReq.on('error', (err) => {
    console.error('[Proxy] Request error:', err);
    if (!clientRes.headersSent) {
      clientRes.status(502).json({ error: 'No se pudo conectar con el servidor IPTV: ' + err.message });
    }
  });

  clientReq.on('close', () => {
    proxyReq.destroy();
  });

  proxyReq.end();
}

export default function handler(req: any, res: any) {
  // Global CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const targetUrl = (req.query?.url as string || '').trim();
  if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
    return res.status(400).json({ error: 'Missing or invalid target url parameter' });
  }

  fetchWithRedirect(targetUrl, req, res);
}
