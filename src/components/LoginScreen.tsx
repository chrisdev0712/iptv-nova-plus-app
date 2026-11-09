import React, { useState } from 'react';
import { Tv, KeyRound, Globe, User, ShieldCheck, Sparkles, Languages, Check, X } from 'lucide-react';
import { XtreamClient } from '../services/xtream';
import { SavedAccount } from '../types/xtream';
import { useTranslation, Language } from '../utils/i18n';

interface LoginScreenProps {
  onLoginSuccess: (client: XtreamClient, account: SavedAccount) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { language, setLanguage, t } = useTranslation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [serverUrl, setServerUrl] = useState(() => localStorage.getItem('iptv_server') || '');
  const [username, setUsername] = useState(() => localStorage.getItem('iptv_user') || '');
  const [password, setPassword] = useState(() => localStorage.getItem('iptv_pass') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!serverUrl || !username || !password) {
      setError(language === 'es' ? 'Por favor completa todos los campos del servidor Xtream' : 'Please fill in all Xtream server fields');
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
      setError(err?.message || (language === 'es' ? 'Error al conectar con el servidor Xtream Codes.' : 'Failed to connect to Xtream Codes server.'));
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
        {/* Language switch button */}
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={() => setShowLanguageModal(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-white text-xs font-bold transition-all tv-focusable shadow-md"
            title="Seleccionar Idioma / Select Language"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {language === 'en' ? '🇺🇸 ENGLISH' : language === 'es' ? '🇪🇸 ESPAÑOL' : language === 'pt' ? '🇧🇷 PORTUGUÊS' : '🇫🇷 FRANÇAIS'}
            </span>
          </button>
        </div>

        {/* App Logo & Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 mb-4">
            <Tv className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center space-x-2">
            <span className="text-white">{t('app_title')}</span>
            <span className="rainbow-text">{t('app_plus')}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Xtream Codes API &bull; Smart TV &bull; Web &bull; Mobile
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
              {t('server_label')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder={t('server_placeholder')}
                value={serverUrl}
                onChange={e => setServerUrl(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-base transition-all tv-focusable"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              {t('user_label')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder={t('user_placeholder')}
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-base transition-all tv-focusable"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              {t('pass_label')}
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
                <span>{t('connect_server')}</span>
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
            <span>{t('try_demo')}</span>
          </button>
        </div>
      </div>

      {/* LANGUAGE SELECTOR MODAL */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 select-none animate-fadeIn">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#0f172a] to-[#0a0f1d] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl shadow-cyan-950/60 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {t('language_setting')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('language_desc')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowLanguageModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white tv-focusable"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Options List */}
            <div className="space-y-2.5 my-2">
              {[
                { code: 'en' as const, label: 'English (US/UK)', nativeName: 'English', flag: '🇺🇸' },
                { code: 'es' as const, label: 'Español (Latinoamérica / España)', nativeName: 'Español', flag: '🇪🇸' },
                { code: 'pt' as const, label: 'Português (Brasil / Portugal)', nativeName: 'Português', flag: '🇧🇷' },
                { code: 'fr' as const, label: 'Français', nativeName: 'Français', flag: '🇫🇷' },
              ].map(opt => {
                const isSelected = language === opt.code;
                return (
                  <button
                    key={opt.code}
                    onClick={() => {
                      setLanguage(opt.code);
                      setShowLanguageModal(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all tv-focusable ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/70 text-slate-200 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <span className="text-2xl">{opt.flag}</span>
                      <div className="text-left">
                        <span className="text-sm font-bold block">{opt.nativeName}</span>
                        <span className="text-[11px] text-slate-400 block">{opt.label}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/40">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-4 mt-2 border-t border-slate-800/80 flex justify-end">
              <button
                onClick={() => setShowLanguageModal(false)}
                className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs tv-focusable"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
