// Vercel Serverless Function: IPTV Nova Plus Remote MAC Activation API
// Allows assigning and syncing Xtream Codes playlists to Smart TVs using their MAC Address

export const config = {
  runtime: 'nodejs'
};

// In-memory fallback cache across warm serverless invocations
const memoryStore: Map<string, any> = (global as any).__macPlaylists || new Map();
(global as any).__macPlaylists = memoryStore;

// Clean and normalize MAC to uppercase with colons
function formatMac(raw: string): string {
  const clean = (raw || '').replace(/[^a-fA-F0-9]/g, '').toUpperCase();
  const parts: string[] = [];
  for (let i = 0; i < clean.length && i < 12; i += 2) {
    parts.push(clean.substring(i, i + 2));
  }
  return parts.join(':');
}

// Upstash / Vercel KV REST helpers (zero dependencies needed)
async function kvGet(key: string): Promise<any | null> {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        }
      }
    } catch (e) {
      console.warn('KV GET error, falling back to memory store:', e);
    }
  }

  return memoryStore.get(key) || null;
}

async function kvSet(key: string, value: any): Promise<boolean> {
  memoryStore.set(key, value);

  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const res = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(JSON.stringify(value))
      });
      return res.ok;
    } catch (e) {
      console.warn('KV SET error, falling back to memory store:', e);
    }
  }

  return true;
}

async function kvDel(key: string): Promise<boolean> {
  memoryStore.delete(key);

  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const res = await fetch(`${url}/del/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.ok;
    } catch (e) {
      console.warn('KV DEL error:', e);
    }
  }

  return true;
}

export default async function handler(req: any, res: any) {
  // Global CORS Headers for Smart TV & Web Browser cross-origin requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const method = req.method;

  // 1. GET: Fetch playlist for a specific TV MAC
  if (method === 'GET') {
    const rawMac = (req.query?.mac || '').toString();
    if (!rawMac) {
      return res.status(200).json({
        success: true,
        service: 'IPTV Nova Plus Remote MAC Activation API',
        status: 'online',
        timestamp: new Date().toISOString()
      });
    }

    const mac = formatMac(rawMac);
    const storageKey = `iptv_mac_${mac.replace(/:/g, '')}`;
    const playlist = await kvGet(storageKey);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        mac,
        message: 'No hay ninguna playlist asignada a esta MAC de TV todavía.'
      });
    }

    return res.status(200).json({
      success: true,
      mac,
      playlist
    });
  }

  // 2. POST: Assign or update playlist for a TV MAC
  if (method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }

      const { mac: rawMac, name, server, port, username, password, key } = body || {};

      if (!rawMac || !server || !username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Campos requeridos faltantes: mac, server, username, password'
        });
      }

      const mac = formatMac(rawMac);
      if (mac.replace(/:/g, '').length !== 12) {
        return res.status(400).json({
          success: false,
          message: 'La dirección MAC de la TV es inválida. Debe tener 12 caracteres hexadecimales.'
        });
      }

      // Format server URL with port if provided
      let fullServer = server.trim();
      if (!fullServer.startsWith('http://') && !fullServer.startsWith('https://')) {
        fullServer = 'http://' + fullServer;
      }
      fullServer = fullServer.replace(/\/+$/, ''); // Remove trailing slashes

      if (port && !fullServer.split('://')[1].includes(':')) {
        fullServer = `${fullServer}:${port.toString().trim()}`;
      }

      const playlistData = {
        name: (name || 'Mi Suscripción IPTV').trim(),
        serverUrl: fullServer,
        port: port ? port.toString().trim() : '',
        username: username.trim(),
        password: password.trim(),
        deviceKey: key ? key.toString().trim() : '',
        updatedAt: new Date().toISOString()
      };

      const storageKey = `iptv_mac_${mac.replace(/:/g, '')}`;
      await kvSet(storageKey, playlistData);

      return res.status(200).json({
        success: true,
        message: '¡Playlist asignada exitosamente a la TV!',
        mac,
        playlist: {
          name: playlistData.name,
          serverUrl: playlistData.serverUrl,
          username: playlistData.username,
          updatedAt: playlistData.updatedAt
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al guardar la playlist: ' + (err?.message || err)
      });
    }
  }

  // 3. DELETE: Remove playlist for a TV MAC
  if (method === 'DELETE') {
    const rawMac = (req.query?.mac || req.body?.mac || '').toString();
    if (!rawMac) {
      return res.status(400).json({ success: false, message: 'MAC requerida' });
    }

    const mac = formatMac(rawMac);
    const storageKey = `iptv_mac_${mac.replace(/:/g, '')}`;
    await kvDel(storageKey);

    return res.status(200).json({
      success: true,
      message: 'Playlist eliminada correctamente para la TV',
      mac
    });
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'OPTIONS']);
  return res.status(405).json({ success: false, message: `Método ${method} no permitido` });
}

