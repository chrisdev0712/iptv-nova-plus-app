import React, { useState } from 'react';
import {
  Tv,
  Globe,
  KeyRound,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Trash2,
  ArrowLeft,
  ExternalLink,
  Laptop,
  Check,
  Copy,
  History,
  X
} from 'lucide-react';
import { normalizeMac } from '../utils/deviceInfo';
import { XtreamClient } from '../services/xtream';

interface WebActivationPortalProps {
  onBack?: () => void;
  initialMac?: string;
}

export const WebActivationPortal: React.FC<WebActivationPortalProps> = ({
  onBack,
  initialMac = ''
}) => {
  const [mac, setMac] = useState(initialMac ? normalizeMac(initialMac) : '');
  const [deviceKey, setDeviceKey] = useState('');
  const [playlistName, setPlaylistName] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [serverPort, setServerPort] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [testingXtream, setTestingXtream] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'check'>('upload');
  const [searchMac, setSearchMac] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // History of queried and managed MACs
  const [macHistory, setMacHistory] = useState<Array<{ mac: string; name?: string; updatedAt?: string }>>(() => {
    try {
      const saved = localStorage.getItem('iptv_mac_history');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item && typeof item.mac === 'string' && item.mac.trim().length > 0);
      }
      return [];
    } catch {
      return [];
    }
  });

  const addToHistory = (targetMac: string, name?: string) => {
    if (!targetMac || typeof targetMac !== 'string') return;
    const clean = String(targetMac || '').trim().toUpperCase();
    if (clean.replace(/[^A-F0-9]/g, '').length !== 12) return;

    setMacHistory(prev => {
      const validPrev = Array.isArray(prev) ? prev.filter(item => item && typeof item.mac === 'string') : [];
      const existing = validPrev.find(item => (item.mac || '').toUpperCase() === clean);
      const filtered = validPrev.filter(item => (item.mac || '').toUpperCase() !== clean);
      const updated = [
        {
          mac: clean,
          name: name || existing?.name || '',
          updatedAt: new Date().toISOString()
        },
        ...filtered
      ].slice(0, 20); // Keep 20 most recent
      try {
        localStorage.setItem('iptv_mac_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving mac history:', e);
      }
      return updated;
    });
  };

  const removeFromHistory = (e: React.MouseEvent, targetMac: string) => {
    e.stopPropagation();
    const targetClean = (targetMac || '').toUpperCase();
    setMacHistory(prev => {
      const validPrev = Array.isArray(prev) ? prev.filter(item => item && typeof item.mac === 'string') : [];
      const updated = validPrev.filter(item => (item.mac || '').toUpperCase() !== targetClean);
      try {
        localStorage.setItem('iptv_mac_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearHistory = () => {
    if (confirm('¿Vaciar todo el historial de MACs consultadas?')) {
      setMacHistory([]);
      try {
        localStorage.removeItem('iptv_mac_history');
      } catch {}
    }
  };

  // Format MAC input as user types
  const handleMacChange = (val: string) => {
    const raw = (val || '').replace(/[^a-fA-F0-9]/g, '').toUpperCase();
    const parts: string[] = [];
    for (let i = 0; i < raw.length && i < 12; i += 2) {
      parts.push(raw.substring(i, i + 2));
    }
    setMac(parts.join(':'));
  };

  // Test Xtream Codes credentials before assigning
  const handleTestConnection = async () => {
    if (!serverUrl || !username || !password) {
      setStatusMessage({
        type: 'error',
        text: 'Completa Servidor, Usuario y Contraseña para probar la conexión Xtream.'
      });
      return;
    }

    setTestingXtream(true);
    setStatusMessage(null);

    let fullServer = serverUrl.trim();
    if (!fullServer.startsWith('http://') && !fullServer.startsWith('https://')) {
      fullServer = 'http://' + fullServer;
    }
    fullServer = fullServer.replace(/\/+$/, '');
    if (serverPort && !fullServer.split('://')[1]?.includes(':')) {
      fullServer = `${fullServer}:${serverPort.trim()}`;
    }

    try {
      const client = new XtreamClient(fullServer, username.trim(), password.trim());
      const auth = await client.authenticate();
      if (auth && auth.user_info) {
        setStatusMessage({
          type: 'success',
          text: `¡Credenciales Xtream Válidas! Estado: ${auth.user_info.status || 'Activo'} - Usuario: ${auth.user_info.username}`
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: 'El servidor respondió pero no devolvió información válida de usuario.'
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Error de autenticación Xtream: ${err.message || 'Servidor no disponible o credenciales incorrectas'}`
      });
    } finally {
      setTestingXtream(false);
    }
  };

  // Submit Playlist to Vercel Serverless API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const cleanMac = mac.replace(/[^a-fA-F0-9]/g, '');
    if (cleanMac.length !== 12) {
      setStatusMessage({
        type: 'error',
        text: 'La dirección MAC de la TV debe tener 12 caracteres hexadecimales (ej: 00:1A:79:B4:92:01).'
      });
      return;
    }

    if (!serverUrl || !username || !password) {
      setStatusMessage({
        type: 'error',
        text: 'Por favor completa todos los campos requeridos.'
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mac,
          key: deviceKey,
          name: playlistName || 'Mi Suscripción IPTV',
          server: serverUrl,
          port: serverPort,
          username,
          password
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al comunicarse con la API serverless');
      }

      setStatusMessage({
        type: 'success',
        text: `¡Cuenta asignada con éxito a la TV (${mac})! La Smart TV cargará la lista en cuanto abra la app o pulse "Sincronizar".`
      });

      addToHistory(mac, playlistName || username);

      // Clear sensitive fields if desired, or keep MAC
      setPlaylistName('');
      setPassword('');
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error al enviar la playlist a la API de Vercel.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Run check on a specific MAC
  const runCheckMac = async (macToTest: string) => {
    const cleanMac = macToTest.replace(/[^a-fA-F0-9]/g, '');
    if (cleanMac.length !== 12) {
      alert('Ingresa una MAC válida de 12 dígitos.');
      return;
    }

    setSearchLoading(true);
    setSearchResult(null);

    try {
      const res = await fetch(`/api/playlist?mac=${encodeURIComponent(macToTest)}`);
      const data = await res.json();
      if (res.ok && data.success && data.playlist) {
        setSearchResult(data.playlist);
        addToHistory(macToTest, data.playlist.name || data.playlist.username);
      } else {
        setSearchResult({ notFound: true, message: data.message || 'No se encontró lista.' });
        addToHistory(macToTest);
      }
    } catch (e: any) {
      setSearchResult({ error: true, message: e.message });
      addToHistory(macToTest);
    } finally {
      setSearchLoading(false);
    }
  };

  // Check existing playlist by MAC (from manual input button)
  const handleCheckMac = () => {
    runCheckMac(searchMac);
  };

  const handleSelectHistoryItem = (item: { mac: string; name?: string }) => {
    setSearchMac(item.mac);
    runCheckMac(item.mac);
  };

  // Delete playlist by MAC
  const handleDeletePlaylist = async (targetMac: string) => {
    if (!confirm(`¿Eliminar la playlist asignada a la TV MAC ${targetMac}?`)) return;

    try {
      const res = await fetch(`/api/playlist?mac=${encodeURIComponent(targetMac)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        alert('Playlist eliminada de la TV correctamente.');
        setSearchResult(null);
      }
    } catch (e: any) {
      alert('Error al eliminar: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#060a12] via-[#0b1326] to-[#040711] text-white flex flex-col justify-between py-6 px-4 sm:px-8">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
            <Tv className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wide flex items-center space-x-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                IPTV NOVA
              </span>
              <span className="rainbow-text">PLUS</span>
            </h1>
            <span className="text-[10px] sm:text-xs text-slate-400 font-semibold tracking-wider uppercase block">
              Portal Web de Carga de Playlists (Vercel Serverless)
            </span>
          </div>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la App</span>
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full my-6 flex-1">
        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Cargar a TV (MAC)</span>
          </button>
          <button
            onClick={() => setActiveTab('check')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'check'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Consultar Playlist</span>
          </button>
        </div>

        {/* Tab 1: Upload / Assign Form */}
        {activeTab === 'upload' && (
          <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center space-x-2.5">
                <Globe className="w-5 h-5 text-cyan-400" />
                <span>Asignar Suscripción Xtream Codes a una Smart TV</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Ingresa la dirección MAC que aparece en la pantalla del televisor y los datos de la cuenta que deseas cargar remotamente.
              </p>
            </div>

            {/* Notification alert */}
            {statusMessage && (
              <div
                className={`mb-6 p-4 rounded-2xl border flex items-start space-x-3 text-xs sm:text-sm font-semibold transition-all ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                    : 'bg-red-950/60 border-red-500/50 text-red-200'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">{statusMessage.text}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: TV MAC Address & Device Key */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                    <Tv className="w-3.5 h-3.5" />
                    <span>TV MAC Address *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="00:1A:79:B4:92:01"
                    maxLength={17}
                    value={mac}
                    onChange={e => handleMacChange(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm font-mono font-bold text-white tracking-widest placeholder:text-slate-600 outline-none transition-all"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Dirección MAC mostrada en la pantalla de IPTV Nova Plus en el televisor.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Device Key (Opcional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="482910"
                    value={deviceKey}
                    onChange={e => setDeviceKey(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm font-mono font-bold text-white tracking-widest placeholder:text-slate-600 outline-none transition-all"
                  />
                  <span className="text-[10px] text-slate-400 block">PIN de 6 dígitos si aplica.</span>
                </div>
              </div>

              {/* Row 2: Playlist Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Nombre de la Playlist (Identificador)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Plan Familiar VIP / Cuenta Reseller 1 Mes"
                  value={playlistName}
                  onChange={e => setPlaylistName(e.target.value)}
                  className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder:text-slate-600 outline-none transition-all"
                />
              </div>

              {/* Row 3: Username & Password (Primero) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Usuario (Username) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="usuario123"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder:text-slate-600 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Contraseña (Password) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder:text-slate-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Row 4: Server Address & Port (Después) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Server Address (URL del Servidor) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="http://line.ottprovider.com"
                    value={serverUrl}
                    onChange={e => setServerUrl(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-slate-600 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Puerto (Port)
                  </label>
                  <input
                    type="text"
                    placeholder="8080"
                    value={serverPort}
                    onChange={e => setServerPort(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-slate-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Actions Button Row */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingXtream || loading}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${testingXtream ? 'animate-spin text-cyan-400' : ''}`} />
                  <span>{testingXtream ? 'Probando Xtream...' : 'Probar Conexión'}</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Cargando a la TV...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-white" />
                      <span>Cargar Cuenta a la Smart TV</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Check Existing Playlist by MAC */}
        {activeTab === 'check' && (
          <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center space-x-2.5 mb-2">
              <Laptop className="w-5 h-5 text-cyan-400" />
              <span>Consultar Playlist Asignada a una MAC</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              Verifica los datos cargados en el servidor para cualquier televisor o dispositivo.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input
                type="text"
                placeholder="00:1A:79:B4:92:01"
                value={searchMac}
                onChange={e => {
                  const raw = (e.target.value || '').replace(/[^a-fA-F0-9]/g, '').toUpperCase();
                  const parts = [];
                  for (let i = 0; i < raw.length && i < 12; i += 2) {
                    parts.push(raw.substring(i, i + 2));
                  }
                  setSearchMac(parts.join(':'));
                }}
                className="flex-1 bg-slate-950/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm font-mono font-bold text-white tracking-widest placeholder:text-slate-600 outline-none"
              />
              <button
                onClick={handleCheckMac}
                disabled={searchLoading}
                className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${searchLoading ? 'animate-spin' : ''}`} />
                <span>Buscar</span>
              </button>
            </div>

            {/* History of Recent MACs */}
            {macHistory.length > 0 && (
              <div className="mb-6 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 uppercase tracking-wider">
                    <History className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Historial de Consultas Recientes ({macHistory.length})</span>
                  </span>
                  <button
                    onClick={clearHistory}
                    className="text-[11px] text-slate-500 hover:text-red-400 transition-colors font-medium cursor-pointer"
                  >
                    Limpiar historial
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                  {macHistory.filter(item => item && typeof item.mac === 'string').map(item => {
                    const isSelected = (searchMac || '').toUpperCase() === (item.mac || '').toUpperCase();
                    return (
                      <div
                        key={item.mac}
                        onClick={() => handleSelectHistoryItem(item)}
                        className={`group flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200 shadow-md shadow-cyan-500/10'
                            : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white'
                        }`}
                        title={`Clic para consultar directamente ${item.mac}`}
                      >
                        <span className="font-bold">{item.mac}</span>
                        {item.name && (
                          <span className="text-[10px] text-slate-400 max-w-[140px] truncate font-sans font-medium">
                            • {item.name}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => removeFromHistory(e, item.mac)}
                          className="opacity-40 group-hover:opacity-100 hover:text-red-400 p-0.5 rounded transition-all ml-1 cursor-pointer"
                          title="Eliminar del historial"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {searchResult && (
              <div className="mt-4 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                {searchResult.notFound ? (
                  <p className="text-sm text-amber-300 font-semibold">{searchResult.message}</p>
                ) : searchResult.error ? (
                  <p className="text-sm text-red-400 font-semibold">{searchResult.message}</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">
                          Playlist Activa
                        </span>
                        <h3 className="text-base font-bold text-white">{searchResult.name}</h3>
                      </div>
                      <button
                        onClick={() => handleDeletePlaylist(searchMac)}
                        className="px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-800 text-red-300 hover:text-white text-xs font-bold flex items-center space-x-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Servidor:</span>
                        <span className="font-mono text-cyan-300 truncate block">
                          {searchResult.serverUrl}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Usuario:</span>
                        <span className="font-bold text-white">{searchResult.username}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Última Actualización:</span>
                        <span className="text-slate-300">
                          {new Date(searchResult.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Instructions */}
      <footer className="max-w-4xl mx-auto w-full pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
        <span>IPTV Nova Plus • Compatible con Samsung Tizen, LG webOS, Android TV y Web</span>
        <span className="text-cyan-400 font-semibold">API Serverless Vercel Activa</span>
      </footer>
    </div>
  );
};

