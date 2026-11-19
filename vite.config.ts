import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

// Local middleware plugin so /api/playlist works out of the box in `npm run dev`
function localApiPlugin(): Plugin {
  const currentDir = typeof import.meta.dirname !== 'undefined' ? import.meta.dirname : process.cwd();
  const dataFile = path.resolve(currentDir, '.data/playlists.json');
  const getStore = () => {
    try {
      if (fs.existsSync(dataFile)) {
        return JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
      }
    } catch {}
    return {};
  };
  const saveStore = (data: any) => {
    try {
      const dir = path.dirname(dataFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save local playlists', e);
    }
  };

  return {
    name: 'local-api-playlist',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/playlist')) {
          return next();
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          return res.end();
        }

        const url = new URL(req.url, 'http://localhost:3000');
        const rawMac = url.searchParams.get('mac') || '';
        const cleanMac = rawMac.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
        const store = getStore();

        if (req.method === 'GET') {
          if (!cleanMac) {
            res.setHeader('Content-Type', 'application/json');
            return res.end(
              JSON.stringify({
                success: true,
                service: 'IPTV Nova Plus Local Dev Serverless API',
                status: 'online',
                count: Object.keys(store).length
              })
            );
          }

          const found = store[cleanMac];
          res.setHeader('Content-Type', 'application/json');
          if (!found) {
            res.statusCode = 404;
            return res.end(
              JSON.stringify({
                success: false,
                mac: rawMac,
                message: 'No hay ninguna playlist asignada a esta MAC de TV todavía.'
              })
            );
          }

          return res.end(
            JSON.stringify({
              success: true,
              mac: rawMac,
              playlist: found
            })
          );
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const { mac: postMac, name, server, port, username, password, key } = parsed;
              const macKey = (postMac || '').replace(/[^a-fA-F0-9]/g, '').toUpperCase();

              if (!macKey || !server || !username || !password) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(
                  JSON.stringify({
                    success: false,
                    message: 'Faltan campos requeridos: mac, server, username, password'
                  })
                );
              }

              let fullServer = server.trim();
              if (!fullServer.startsWith('http://') && !fullServer.startsWith('https://')) {
                fullServer = 'http://' + fullServer;
              }
              fullServer = fullServer.replace(/\/+$/, '');
              if (port && !fullServer.split('://')[1]?.includes(':')) {
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

              store[macKey] = playlistData;
              saveStore(store);

              res.setHeader('Content-Type', 'application/json');
              return res.end(
                JSON.stringify({
                  success: true,
                  message: '¡Playlist asignada exitosamente a la TV!',
                  mac: postMac,
                  playlist: playlistData
                })
              );
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: false, message: err.message }));
            }
          });
          return;
        }

        if (req.method === 'DELETE') {
          delete store[cleanMac];
          saveStore(store);
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ success: true, message: 'Playlist eliminada' }));
        }

        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localApiPlugin()],
  base: './', // Essential for Smart TVs (Tizen, webOS) and Capacitor local file loading
  server: {
    port: 3000,
    host: true
  }
});
