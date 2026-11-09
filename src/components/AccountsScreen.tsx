import React, { useState, useEffect } from 'react';
import {
  Tv,
  User,
  KeyRound,
  Globe,
  UserPlus,
  Trash2,
  Play,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  Plus,
  X,
  Server,
  Languages
} from 'lucide-react';
import { XtreamClient } from '../services/xtream';
import { SavedAccount } from '../types/xtream';
import { useTranslation } from '../utils/i18n';

interface AccountsScreenProps {
  onSelectAccount: (client: XtreamClient, account: SavedAccount) => void;
}

export const AccountsScreen: React.FC<AccountsScreenProps> = ({ onSelectAccount }) => {
  const { language, setLanguage, t } = useTranslation();
  const [accounts, setAccounts] = useState<SavedAccount[]>(() => {
    try {
      const stored = localStorage.getItem('iptv_accounts');
      if (stored) return JSON.parse(stored);
      
      // Migrate old single account if present
      const oldServer = localStorage.getItem('iptv_server');
      const oldUser = localStorage.getItem('iptv_user');
      const oldPass = localStorage.getItem('iptv_pass');
      if (oldServer && oldUser && oldPass) {
        const migrated: SavedAccount = {
          id: 'acc_' + Date.now(),
          name: oldUser,
          username: oldUser,
          password: oldPass,
          serverUrl: oldServer,
          status: 'Active',
          lastLogin: new Date().toISOString()
        };
        localStorage.setItem('iptv_accounts', JSON.stringify([migrated]));
        return [migrated];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [isAdding, setIsAdding] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If there are no accounts on first start, open the Add User form directly
  useEffect(() => {
    if (accounts.length === 0) {
      setIsAdding(true);
    }
  }, [accounts.length]);

  const saveAccountsToStorage = (newList: SavedAccount[]) => {
    setAccounts(newList);
    localStorage.setItem('iptv_accounts', JSON.stringify(newList));
  };

  const handleConnectAccount = async (acc: SavedAccount) => {
    setLoading(true);
    setError(null);
    try {
      const client = new XtreamClient(acc.serverUrl, acc.username, acc.password);
      const auth = await client.authenticate();
      
      // Update account status & expiration in storage
      const updatedList = accounts.map(a => {
        if (a.id === acc.id) {
          return {
            ...a,
            status: auth.user_info.status || 'Active',
            expDate: auth.user_info.exp_date,
            lastLogin: new Date().toISOString()
          };
        }
        return a;
      });
      saveAccountsToStorage(updatedList);

      // Persist active account
      localStorage.setItem('iptv_active_id', acc.id);
      localStorage.setItem('iptv_server', acc.serverUrl);
      localStorage.setItem('iptv_user', acc.username);
      localStorage.setItem('iptv_pass', acc.password);

      onSelectAccount(client, acc);
    } catch (err: any) {
      setError(err?.message || `Error al conectar con la cuenta "${acc.name || acc.username}".`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim() || !serverUrl.trim()) {
      setError('Por favor ingresa Usuario, Contraseña y URL del Servidor');
      return;
    }

    setLoading(true);
    try {
      const client = new XtreamClient(serverUrl, username, password);
      const auth = await client.authenticate();

      const newAccount: SavedAccount = {
        id: 'acc_' + Date.now(),
        name: profileName.trim() || username.trim(),
        username: username.trim(),
        password: password.trim(),
        serverUrl: serverUrl.trim(),
        status: auth.user_info.status || 'Active',
        expDate: auth.user_info.exp_date,
        maxConnections: auth.user_info.max_connections,
        lastLogin: new Date().toISOString()
      };

      const updated = [...accounts, newAccount];
      saveAccountsToStorage(updated);

      // Persist active
      localStorage.setItem('iptv_active_id', newAccount.id);
      localStorage.setItem('iptv_server', newAccount.serverUrl);
      localStorage.setItem('iptv_user', newAccount.username);
      localStorage.setItem('iptv_pass', newAccount.password);

      setIsAdding(false);
      onSelectAccount(client, newAccount);
    } catch (err: any) {
      setError(err?.message || 'Error al autenticar la cuenta. Verifica que los datos sean correctos.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Seguro que deseas eliminar esta cuenta de la lista?')) {
      const updated = accounts.filter(a => a.id !== id);
      saveAccountsToStorage(updated);
      if (updated.length === 0) {
        setIsAdding(true);
      }
    }
  };

  const handleDemoLogin = () => {
    setLoading(true);
    const demoClient = new XtreamClient('demo', 'demo', 'demo');
    const demoAccount: SavedAccount = {
      id: 'demo_acc',
      name: 'Cuenta Demo',
      username: 'demo',
      password: 'demo',
      serverUrl: 'demo',
      status: 'Active',
      lastLogin: new Date().toISOString()
    };
    setTimeout(() => {
      onSelectAccount(demoClient, demoAccount);
      setLoading(false);
    }, 400);
  };

  const formatExpDate = (timestamp?: string) => {
    if (!timestamp) return 'Ilimitado';
    const ts = parseInt(timestamp);
    if (isNaN(ts) || ts <= 0) return 'Ilimitado';
    return new Date(ts * 1000).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-gradient-to-br from-[#060a12] via-[#0d1629] to-[#080d1a] px-8 py-10 select-none overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none"></div>

      {/* HEADER: App Logo & Title with Rainbow PLUS & Language Switcher */}
      <header className="relative z-10 flex flex-col items-center">
        {/* Language switch button */}
        <div className="absolute top-0 right-0 flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-white text-xs font-bold transition-all tv-focusable shadow-md"
            title="Switch Language / Cambiar Idioma"
          >
            <Languages className="w-4 h-4 text-cyan-400" />
            <span>{language === 'es' ? 'ESPAÑOL' : 'ENGLISH'}</span>
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-2">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/30">
            <Tv className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center space-x-2.5">
              <span>{t('app_title')}</span>
              <span className="rainbow-text">{t('app_plus')}</span>
            </h1>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mt-0.5">
              {t('admin_users')} &bull; Xtream Codes API
            </p>
          </div>
        </div>
      </header>

      {/* Global Error Banner */}
      {error && (
        <div className="relative z-20 max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-sm flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0"></div>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:bg-white/10 rounded-lg text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN CONTENT: List Users OR Add User */}
      <main className="relative z-10 my-auto w-full max-w-5xl mx-auto">
        {!isAdding ? (
          <div>
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-2xl font-black text-white">{t('select_account')}</h2>
                <p className="text-xs text-slate-400 mt-1">
                  {t('select_account_desc')}
                </p>
              </div>

              <button
                onClick={() => {
                  setError(null);
                  setIsAdding(true);
                }}
                className="py-3 px-5 rounded-2xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 transition-all shadow-lg shadow-cyan-500/30 flex items-center space-x-2 text-sm tv-focusable"
              >
                <Plus className="w-4 h-4" />
                <span>{t('add_user')}</span>
              </button>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map(acc => (
                <div
                  key={acc.id}
                  onClick={() => handleConnectAccount(acc)}
                  className="group relative rounded-3xl bg-slate-900/80 hover:bg-slate-850 border-2 border-slate-700/60 hover:border-cyan-400/80 p-6 flex flex-col justify-between cursor-pointer transition-all shadow-xl hover:shadow-cyan-500/20 smarters-card tv-focusable"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 font-black text-xl">
                        <User className="w-7 h-7" />
                      </div>

                      {/* Delete account */}
                      <button
                        onClick={e => handleDeleteAccount(acc.id, e)}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-950/80 text-slate-400 hover:text-red-400 border border-slate-700/60 hover:border-red-500/40 transition-colors tv-focusable"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {acc.name || acc.username}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5 truncate flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{acc.username}</span>
                    </p>

                    <div className="mt-4 pt-4 border-t border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center space-x-1 truncate max-w-[170px]">
                          <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{acc.serverUrl}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          {acc.status || 'Activo'}
                        </span>
                      </div>

                      {acc.expDate && (
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Expira:</span>
                          </span>
                          <span className="text-slate-300 font-medium">{formatExpDate(acc.expDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-3">
                    <div className="w-full py-2.5 px-4 rounded-xl bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-cyan-300 text-xs font-bold flex items-center justify-center space-x-2 transition-all">
                      <span>INICIAR SESIÓN</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New User Card Tile */}
              <div
                onClick={() => {
                  setError(null);
                  setIsAdding(true);
                }}
                className="rounded-3xl border-2 border-dashed border-slate-700/80 hover:border-cyan-400/80 bg-slate-900/30 hover:bg-slate-900/60 p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all tv-focusable"
              >
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 mb-4 shadow-inner">
                  <UserPlus className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">Agregar Otra Cuenta</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                  Conecta otra lista de Xtream Codes API con usuario y contraseña
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ADD USER FORM (Ordered: Username, Password, Server URL) */
          <div className="max-w-xl mx-auto bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Agregar Cuenta Xtream</h3>
                  <p className="text-xs text-slate-400">Ingresa tus credenciales de suscripción</p>
                </div>
              </div>

              {accounts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 tv-focusable"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <form onSubmit={handleAddNewAccount} className="space-y-4">
              {/* Profile Name (Optional) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t('profile_name_opt')}
                </label>
                <input
                  type="text"
                  placeholder={t('profile_name_placeholder')}
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 tv-focusable text-sm"
                />
              </div>

              {/* 1st: Usuario */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1.5 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>{t('user_label')}</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('user_placeholder')}
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 tv-focusable text-sm"
                    required
                  />
                </div>
              </div>

              {/* 2nd: Contraseña */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1.5 flex items-center space-x-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{t('pass_label')}</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 tv-focusable text-sm"
                    required
                  />
                </div>
              </div>

              {/* 3rd: URL del Servidor */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1.5 flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{t('server_label')}</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('server_placeholder')}
                    value={serverUrl}
                    onChange={e => setServerUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 tv-focusable text-sm"
                    required
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center space-x-3 pt-4">
                {accounts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm tv-focusable"
                  >
                    {t('cancel')}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-600/30 text-sm flex items-center justify-center space-x-2 tv-focusable disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{t('save_connect')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* FOOTER: Quick Demo & Navigation Hints */}
      <footer className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={handleDemoLogin}
          className="flex items-center space-x-2 text-slate-400 hover:text-cyan-300 transition-colors tv-focusable"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t('try_demo')}</span>
        </button>

        <div className="flex items-center space-x-3">
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">
            [OK] Conectar
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">
            [▲ ▼ ◀ ▶] Mover
          </span>
        </div>
      </footer>
    </div>
  );
};

