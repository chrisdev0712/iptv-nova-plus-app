import React, { useState } from 'react';
import { Tv, KeyRound, Globe, User, ShieldCheck, PlayCircle, Sparkles } from 'lucide-react';
import { XtreamClient } from '../services/xtream';
import { SavedAccount } from '../types/xtream';

interface LoginScreenProps {
  onLoginSuccess: (client: XtreamClient, account: SavedAccount) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [serverUrl, setServerUrl] = useState(() => localStorage.getItem('iptv_server') || '');
  const [username, setUsername] = useState(() => localStorage.getItem('iptv_user') || '');
  const [password, setPassword] = useState(() => localStorage.getItem('iptv_pass') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!serverUrl || !username || !password) {
      setError('Por favor completa todos los campos del servidor Xtream');
      return;
    }

    setLoading(true);
    try {
      const client = new XtreamClient(serverUrl, username, password);
      await client.authenticate();

      // Persist in localStorage
      localStorage.setItem('iptv_server', serverUrl);
      localStorage.setItem('iptv_user', username);
      localStorage.setItem('iptv_pass', password);

      onLoginSuccess(client, {
        id: 'acc_' + Date.now(),
        name: username,
        serverUrl,
        username,
        password,
        lastLogin: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err?.message || 'Error al conectar con el servidor Xtream Codes. Verifica tus credenciales o el CORS/servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setLoading(true);
    const client = new XtreamClient('demo', 'demo', 'demo');
    setTimeout(() => {
      onLoginSuccess(client, {
        id: 'demo_acc',
        name: 'Cuenta Demo',
        serverUrl: 'demo',
        username: 'demo',
        password: 'demo',
        lastLogin: new Date().toISOString()
      });
      setLoading(false);
    }, 400);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#060a12] via-[#0d1629] to-[#080d1a] px-6 py-10 select-none overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl shadow-black/80">
        {/* App Logo & Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 mb-4">
            <Tv className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
            IPTV SMARTERS PRO
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Xtream Codes API &bull; Samsung Tizen &bull; LG webOS &bull; Android TV
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-sm flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></div>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Server URL */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              URL del Servidor / Host
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="http://servidor-iptv.com:8080"
                value={serverUrl}
                onChange={e => setServerUrl(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-base transition-all tv-focusable"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Tu usuario"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-base transition-all tv-focusable"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-base transition-all tv-focusable"
              />
            </div>
          </div>

          {/* Connect Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] transition-all shadow-lg shadow-cyan-600/30 flex items-center justify-center space-x-2 text-base tv-focusable disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>CONECTAR CON SERVIDOR</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Mode Button */}
        <div className="mt-6 pt-5 border-t border-slate-700/60 flex flex-col items-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-600/60 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 text-sm tv-focusable"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Probar en MODO DEMO (Canales, Películas y Series de prueba)</span>
          </button>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Usa el teclado o el control remoto (Flechas + Enter) para navegar en pantalla.
          </p>
        </div>
      </div>
    </div>
  );
};

