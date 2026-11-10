import React, { useState, useEffect } from 'react';
import {
  Tv,
  Film,
  Clapperboard,
  RefreshCw,
  LogOut,
  Calendar,
  Clock,
  Star,
  Settings,
  Users,
  User,
  Languages,
  Check,
  X,
  PlayCircle
} from 'lucide-react';
import { XtreamClient } from '../services/xtream';
import { SavedAccount, XtreamAuthResponse } from '../types/xtream';
import { UserProfileModal } from './UserProfileModal';
import { useTranslation } from '../utils/i18n';

interface DashboardScreenProps {
  client: XtreamClient;
  account: SavedAccount;
  onNavigate: (view: 'live' | 'movies' | 'series' | 'favorites' | 'settings') => void;
  onLogout: () => void;
  onSwitchAccount: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  client,
  account,
  onNavigate,
  onLogout,
  onSwitchAccount
}) => {
  const { language, setLanguage, t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [authData, setAuthData] = useState<XtreamAuthResponse | null>(null);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const languageOptions: Array<{
    code: 'en' | 'es' | 'pt' | 'fr';
    label: string;
    nativeName: string;
    flag: string;
  }> = [
    { code: 'en', label: 'English (US/UK)', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español (Latinoamérica / España)', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'pt', label: 'Português (Brasil / Portugal)', nativeName: 'Português', flag: '🇧🇷' },
    { code: 'fr', label: 'Français', nativeName: 'Français', flag: '🇫🇷' }
  ];

  const activeLocale =
    language === 'es' ? 'es-ES' : language === 'pt' ? 'pt-BR' : language === 'fr' ? 'fr-FR' : 'en-US';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadStats = async () => {
    try {
      setLoadingRefresh(true);
      const auth = await client.authenticate();
      setAuthData(auth);
    } catch (e) {
      console.error('Error loading dashboard stats', e);
    } finally {
      setLoadingRefresh(false);
    }
  };

  useEffect(() => {
    loadStats();
    const liveCard = document.getElementById('card-live-tv');
    if (liveCard) {
      setTimeout(() => liveCard.focus(), 150);
    }
  }, []);

  const getExpirationText = () => {
    if (!authData?.user_info?.exp_date) return t('never_expires');
    const timestamp = parseInt(authData.user_info.exp_date);
    if (isNaN(timestamp) || timestamp <= 0) return t('never_expires');
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString(activeLocale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="relative h-screen w-screen flex flex-col justify-between bg-gradient-to-b from-[#070b18] via-[#0b1326] to-[#050811] px-4 sm:px-8 py-2.5 sm:py-5 text-white select-none overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[450px] h-[450px] bg-cyan-600/10 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[130px] pointer-events-none"></div>

      {/* TOP BAR (IPTV Smarters Compact Style) */}
      <header className="relative z-10 flex items-center justify-between pb-2 sm:pb-3.5 border-b border-slate-800/80 shrink-0 gap-2">
        {/* Left: Logo & Clock/Date */}
        <div className="flex items-center space-x-3 sm:space-x-5 min-w-0">
          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
              <Tv className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-extrabold tracking-wide text-white flex items-center space-x-1.5 leading-none">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  IPTV NOVA
                </span>
                <span className="rainbow-text text-base sm:text-xl">PLUS</span>
              </h2>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 font-semibold block mt-0.5">
                SMART TV &amp; MOBILE
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

          {/* Time & Date */}
          <div className="flex items-center space-x-2 sm:space-x-3 text-slate-300 truncate">
            <span className="text-sm sm:text-lg font-extrabold tracking-tight text-white font-mono">
              {currentTime.toLocaleTimeString(activeLocale, {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            <span className="text-xs sm:text-sm text-slate-400 font-medium truncate hidden md:inline">
              {currentTime.toLocaleDateString(activeLocale, {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Right: Quick Action Icons (Smarters Top-Right Bar) */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
          {/* Active User Badge */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-400 flex items-center space-x-2 transition-all tv-focusable"
            title="Ver Perfil y Expiración"
          >
            <User className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-cyan-300 max-w-[90px] sm:max-w-[140px] truncate">
              {account.username}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black text-[9px] uppercase border border-emerald-500/40 hidden sm:inline">
              ACTIVO
            </span>
          </button>

          {/* Switch User */}
          <button
            onClick={onSwitchAccount}
            title={t('nav_accounts')}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-cyan-300 hover:text-white font-bold text-xs flex items-center space-x-1.5 transition-all tv-focusable"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="hidden lg:inline">{t('nav_accounts')}</span>
          </button>

          {/* Refresh */}
          <button
            onClick={loadStats}
            title="Recargar"
            className="p-2 rounded-xl bg-slate-800/90 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white transition-all tv-focusable"
          >
            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loadingRefresh ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setShowLanguageModal(true)}
            title={t('language_setting')}
            className="flex items-center space-x-1 px-2.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-white text-xs font-bold transition-all tv-focusable"
          >
            <Languages className="w-4 h-4 text-cyan-400" />
            <span className="font-extrabold">{language.toUpperCase()}</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => onNavigate('settings')}
            title={t('nav_settings')}
            className="p-2 rounded-xl bg-slate-800/90 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white transition-all tv-focusable"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="p-2 rounded-xl bg-red-950/60 border border-red-800/60 hover:bg-red-900/80 text-red-300 hover:text-white transition-all tv-focusable"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* CENTER: IPTV SMARTERS ASYMMETRIC GRID (Fits Mobile Landscape & TV 100%) */}
      <main className="relative z-10 flex-1 min-h-0 py-2.5 sm:py-5 flex items-center justify-center">
        <div className="grid grid-cols-12 gap-3 sm:gap-6 w-full max-w-6xl h-full max-h-[420px]">
          {/* LEFT COLUMN (5 cols): Big LIVE TV Card */}
          <button
            id="card-live-tv"
            onClick={() => onNavigate('live')}
            className="col-span-5 group relative h-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#2dd4bf] via-[#0284c7] to-[#1e3a8a] border-2 border-cyan-300/40 flex flex-col justify-between overflow-hidden shadow-2xl shadow-cyan-950/60 hover:border-white smarters-card tv-focusable text-left"
          >
            {/* Center Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Tv className="w-10 h-10 sm:w-14 sm:h-14 text-white drop-shadow" />
              </div>
              <h3 className="text-xl sm:text-3xl font-black mt-3 sm:mt-5 tracking-wider text-white uppercase drop-shadow-md">
                {t('card_live')}
              </h3>
              <p className="text-cyan-100/90 font-medium text-xs sm:text-sm mt-0.5 line-clamp-1">
                {t('card_live_desc')}
              </p>
            </div>

            {/* Bottom Smarters Status Strip */}
            <div className="w-full px-3 sm:px-5 py-2 sm:py-3 bg-black/35 backdrop-blur-md border-t border-white/15 flex items-center justify-between text-[11px] sm:text-xs text-white/90 font-semibold">
              <span className="truncate">{t('live_title')} • HD / FHD</span>
              <span className="px-2 py-0.5 rounded-md bg-white text-blue-900 font-black text-[10px] uppercase shrink-0">
                EN VIVO
              </span>
            </div>
          </button>

          {/* RIGHT COLUMN (7 cols): Top (MOVIES + SERIES) & Bottom (3 Utility Pills) */}
          <div className="col-span-7 flex flex-col justify-between gap-3 sm:gap-5 h-full min-h-0">
            {/* Top Row: MOVIES & SERIES side-by-side */}
            <div className="flex-1 grid grid-cols-2 gap-3 sm:gap-5 min-h-0">
              {/* MOVIES CARD */}
              <button
                id="card-movies"
                onClick={() => onNavigate('movies')}
                className="group relative h-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#f43f5e] via-[#ea580c] to-[#d97706] border-2 border-amber-300/40 flex flex-col justify-between overflow-hidden shadow-2xl shadow-orange-950/60 hover:border-white smarters-card tv-focusable"
              >
                <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-5 text-center">
                  <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <PlayCircle className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black mt-2 sm:mt-4 tracking-wider text-white uppercase drop-shadow-md">
                    {t('card_movies')}
                  </h3>
                </div>

                <div className="w-full px-3 sm:px-4 py-1.5 sm:py-2.5 bg-black/35 backdrop-blur-md border-t border-white/15 flex items-center justify-between text-[10px] sm:text-xs text-white/90 font-semibold">
                  <span className="truncate">{t('card_movies_desc')}</span>
                  <span className="px-1.5 py-0.5 rounded bg-white text-orange-900 font-black text-[9px] uppercase shrink-0">
                    VOD
                  </span>
                </div>
              </button>

              {/* SERIES CARD */}
              <button
                id="card-series"
                onClick={() => onNavigate('series')}
                className="group relative h-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#a855f7] via-[#6366f1] to-[#2563eb] border-2 border-purple-300/40 flex flex-col justify-between overflow-hidden shadow-2xl shadow-purple-950/60 hover:border-white smarters-card tv-focusable"
              >
                <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-5 text-center">
                  <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Clapperboard className="w-7 h-7 sm:w-11 sm:h-11 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black mt-2 sm:mt-4 tracking-wider text-white uppercase drop-shadow-md">
                    {t('card_series')}
                  </h3>
                </div>

                <div className="w-full px-3 sm:px-4 py-1.5 sm:py-2.5 bg-black/35 backdrop-blur-md border-t border-white/15 flex items-center justify-between text-[10px] sm:text-xs text-white/90 font-semibold">
                  <span className="truncate">{t('card_series_desc')}</span>
                  <span className="px-1.5 py-0.5 rounded bg-white text-purple-900 font-black text-[9px] uppercase shrink-0">
                    SERIES
                  </span>
                </div>
              </button>
            </div>

            {/* Bottom Row: 3 Smarters Green/Teal Utility Buttons */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 shrink-0 h-11 sm:h-14">
              <button
                onClick={() => onNavigate('favorites')}
                className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/50 flex items-center justify-center space-x-2 px-2 sm:px-4 font-extrabold text-xs sm:text-sm text-white shadow-lg tv-focusable"
              >
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 fill-yellow-300 shrink-0" />
                <span className="truncate uppercase">{t('nav_favorites')}</span>
              </button>

              <button
                onClick={() => setShowProfileModal(true)}
                className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-600/80 to-cyan-600/80 hover:from-teal-500 hover:to-cyan-500 border border-cyan-400/50 flex items-center justify-center space-x-2 px-2 sm:px-4 font-extrabold text-xs sm:text-sm text-white shadow-lg tv-focusable"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
                <span className="truncate uppercase">{t('nav_profile')}</span>
              </button>

              <button
                onClick={() => onNavigate('settings')}
                className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 border border-blue-400/50 flex items-center justify-center space-x-2 px-2 sm:px-4 font-extrabold text-xs sm:text-sm text-white shadow-lg tv-focusable"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
                <span className="truncate uppercase">{t('nav_settings')}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM BAR (IPTV Smarters Footer: Expiration Left, Connected User Right) */}
      <footer className="relative z-10 pt-2 sm:pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs sm:text-sm text-slate-300 shrink-0">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold tracking-wide uppercase text-slate-400">EXPIRACIÓN:</span>
          <span className="font-extrabold text-white">{getExpirationText()}</span>
        </div>

        <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-400 font-mono">
          <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300">
            [OK] Seleccionar
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300">
            [▲ ▼ ◀ ▶] Navegar
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-400 font-medium">Conectado :</span>
          <span className="font-extrabold text-cyan-300">{account.username}</span>
        </div>
      </footer>

      {/* User Profile Full Modal */}
      {showProfileModal && (
        <UserProfileModal
          account={account}
          authData={authData}
          onClose={() => setShowProfileModal(false)}
          onSwitchAccount={onSwitchAccount}
          onLogout={onLogout}
        />
      )}

      {/* LANGUAGE SELECTOR MODAL */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-fadeIn">
          <div className="relative w-full max-w-md max-h-[90dvh] bg-gradient-to-b from-[#0f172a] to-[#0a0f1d] border border-cyan-500/40 rounded-3xl p-5 shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">{t('language_setting')}</h3>
                  <p className="text-xs text-slate-400">{t('language_desc')}</p>
                </div>
              </div>

              <button
                onClick={() => setShowLanguageModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white tv-focusable"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 my-1">
              {languageOptions.map(opt => {
                const isSelected = language === opt.code;
                return (
                  <button
                    key={opt.code}
                    onClick={() => {
                      setLanguage(opt.code);
                      setShowLanguageModal(false);
                    }}
                    className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all tv-focusable ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border-cyan-400 text-white shadow-lg'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/70 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{opt.flag}</span>
                      <div className="text-left">
                        <span className="text-sm font-bold block">{opt.nativeName}</span>
                        <span className="text-[11px] text-slate-400 block">{opt.label}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
