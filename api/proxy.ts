import http from 'http';
import https from 'https';
import { URL } from 'url';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default function handler(req: any, res: any) {
  // Global CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const targetUrl = req.query?.url as string;
  if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
    return res.status(400).json({ error: 'Missing or invalid target url parameter' });
  }

  try {
    const parsed = new URL(targetUrl);
    const client = parsed.protocol === 'https:' ? https : http;

    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    // Forward Range header for video seeking and partial content
    if (req.headers.range) {
      headers['Range'] = req.headers.range as string;
    }

    const proxyReq = client.request(
      parsed,
      {
        method: req.method === 'HEAD' ? 'HEAD' : 'GET',
        headers,
        timeout: 25000,
      },
      (remoteRes) => {
        // Forward status code (200, 206, etc.)
        res.status(remoteRes.statusCode || 200);

        // Forward vital video headers
        const forwardHeaders = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'last-modified', 'etag'];
        for (const h of forwardHeaders) {
          if (remoteRes.headers[h]) {
            res.setHeader(h, remoteRes.headers[h] as string);
          }
        }

        // Pipe video stream to client
        remoteRes.pipe(res);

        remoteRes.on('error', (err) => {
          console.error('Remote stream pipe error:', err);
          if (!res.headersSent) {
            res.status(502).end();
          }
        });
      }
    );

    proxyReq.on('timeout', () => {
      proxyReq.destroy();
      if (!res.headersSent) {
        res.status(504).json({ error: 'IPTV Stream Gateway Timeout' });
      }
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy request error:', err);
      if (!res.headersSent) {
        res.status(502).json({ error: 'Failed to connect to IPTV server: ' + err.message });
      }
    });

    // Abort proxy request if browser closes the video player
    req.on('close', () => {
      proxyReq.destroy();
    });

    proxyReq.end();
  } catch (err: any) {
    console.error('Proxy setup error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
}
