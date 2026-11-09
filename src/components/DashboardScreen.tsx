import React, { useState, useEffect } from 'react';
import {
  Tv,
  Film,
  Clapperboard,
  RefreshCw,
  LogOut,
  Calendar,
  Clock,
  UserCheck,
  Star,
  Settings,
  Layers,
  Search,
  SlidersHorizontal,
  Users,
  User,
  ShieldCheck,
  BadgeInfo,
  Languages,
  Check,
  X
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
  const [counts, setCounts] = useState({ live: 0, movies: 0, series: 0 });
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const languageOptions: Array<{ code: 'en' | 'es' | 'pt' | 'fr'; label: string; nativeName: string; flag: string }> = [
    { code: 'en', label: 'English (US/UK)', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español (Latinoamérica / España)', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'pt', label: 'Português (Brasil / Portugal)', nativeName: 'Português', flag: '🇧🇷' },
    { code: 'fr', label: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  ];

  const activeLocale = language === 'es' ? 'es-ES' : language === 'pt' ? 'pt-BR' : language === 'fr' ? 'fr-FR' : 'en-US';

  // Digital clock update every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial stats and account info
  const loadStats = async () => {
    try {
      setLoadingRefresh(true);
      const auth = await client.authenticate();
      setAuthData(auth);

      // Load counts
      const [liveCats, vodCats, seriesCats] = await Promise.all([
        client.getLiveCategories().catch(() => []),
        client.getVodCategories().catch(() => []),
        client.getSeriesCategories().catch(() => [])
      ]);

      setCounts({
        live: liveCats.length ? liveCats.length * 15 : 120, // estimate or fetch
        movies: vodCats.length ? vodCats.length * 20 : 450,
        series: seriesCats.length ? seriesCats.length * 10 : 80
      });
    } catch (e) {
      console.error('Error loading dashboard stats', e);
    } finally {
      setLoadingRefresh(false);
    }
  };

  useEffect(() => {
    loadStats();
    // Auto focus the Live TV card on mount
    const liveCard = document.getElementById('card-live-tv');
    if (liveCard) {
      setTimeout(() => liveCard.focus(), 150);
    }
  }, []);

  // Format expiration timestamp
  const getExpirationText = () => {
    if (!authData?.user_info?.exp_date) return t('never_expires');
    const timestamp = parseInt(authData.user_info.exp_date);
    if (isNaN(timestamp) || timestamp <= 0) return t('never_expires');
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString(activeLocale, { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-gradient-to-b from-[#090e1c] via-[#0d162a] to-[#060a14] px-10 py-7 text-white select-none overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[550px] h-[550px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* HEADER: Smarters Top Bar */}
      <header className="relative z-10 flex items-center justify-between pb-6 border-b border-slate-800/80">
        {/* Left: App Logo & Clock */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
              <Tv className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-wide text-white flex items-center space-x-1.5">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  IPTV NOVA
                </span>
                <span className="rainbow-text text-xl">PLUS</span>
              </h2>
              <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                SMART TV EDITION
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800"></div>

          {/* Clock & Date */}
          <div className="flex items-center space-x-5 text-slate-300">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span className="text-2xl font-bold tracking-tight text-white font-mono">
                {currentTime.toLocaleTimeString(activeLocale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-400 font-medium">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>
                {currentTime.toLocaleDateString(activeLocale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Big Prominent Expiration & Logged User Badges */}
        <div className="flex items-center space-x-4">
          {/* PROMINENT USER & EXPIRATION CARD (Clickable to open Full Profile) */}
          <div
            onClick={() => setShowProfileModal(true)}
            className="group cursor-pointer bg-gradient-to-r from-slate-900/95 via-slate-850/90 to-slate-900/95 border-2 border-slate-700/80 hover:border-cyan-400 rounded-2xl px-4 py-2 flex items-center space-x-4 transition-all shadow-xl hover:shadow-cyan-500/20 tv-focusable"
            title="Presiona OK o Clic para ver Perfil Completo"
          >
            {/* User Info (Larger) */}
            <div className="flex items-center space-x-2.5 pr-4 border-r border-slate-700/80">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-cyan-500/30">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block leading-tight">
                  USUARIO ACTIVO
                </span>
                <span className="text-base font-black text-cyan-300 block leading-tight group-hover:text-cyan-200">
                  {account.username}
                </span>
              </div>
            </div>

            {/* Expiration Date (Much Larger & Alert Styled) */}
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400/90 block leading-tight">
                  EXPIRA EL
                </span>
                <span className="text-base font-black text-emerald-400 block leading-tight tracking-wide font-mono">
                  {getExpirationText()}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-black text-[10px] uppercase border border-emerald-500/40 ml-1">
                ACTIVO
              </span>
            </div>
          </div>

          {/* Switch User Button */}
          <button
            onClick={onSwitchAccount}
            title="Cambiar de usuario o agregar cuenta"
            className="py-2.5 px-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-cyan-300 hover:text-white font-bold text-xs flex items-center space-x-1.5 transition-all tv-focusable"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Usuarios</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={loadStats}
            title="Recargar canales"
            className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white transition-all tv-focusable"
          >
            <RefreshCw className={`w-5 h-5 ${loadingRefresh ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setShowLanguageModal(true)}
            title="Seleccionar Idioma / Select Language"
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-white text-xs font-bold transition-all tv-focusable shadow-sm hover:shadow-cyan-500/20"
          >
            <Languages className="w-4 h-4 text-cyan-400" />
            <span className="font-extrabold">{language.toUpperCase()}</span>
          </button>

          {/* Settings button */}
          <button
            onClick={() => onNavigate('settings')}
            title="Ajustes"
            className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white transition-all tv-focusable"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Logout button */}
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="p-2.5 rounded-xl bg-red-950/60 border border-red-800/60 hover:bg-red-900/80 text-red-300 hover:text-white transition-all tv-focusable"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* CENTER: 3 Iconic Smarters Cards (LIVE TV, MOVIES, SERIES) */}
      <main className="relative z-10 my-auto py-6">
        <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* 1. LIVE TV CARD */}
          <button
            id="card-live-tv"
            onClick={() => onNavigate('live')}
            className="group relative h-96 rounded-3xl bg-gradient-to-b from-[#112347] via-[#0d1a33] to-[#091224] border-2 border-cyan-500/40 p-8 flex flex-col justify-between items-center text-center shadow-2xl shadow-cyan-950/50 hover:border-cyan-400 hover:shadow-cyan-500/40 smarters-card tv-focusable"
          >
            {/* Top decorative glow */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-500"></div>

            {/* Live Indicator */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 self-end">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-xs font-black uppercase tracking-wider text-red-400">{t('live_title')}</span>
            </div>

            {/* Center Big Icon */}
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-xl shadow-cyan-600/40 group-hover:scale-110 group-focus:scale-110 transition-transform duration-300">
                <Tv className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-4xl font-black mt-6 tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                {t('card_live')}
              </h3>
              <p className="text-slate-400 font-medium text-sm mt-1">
                {t('card_live_desc')}
              </p>
            </div>

            {/* Bottom info pill */}
            <div className="w-full py-2 px-4 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-center space-x-2 text-xs font-semibold text-cyan-300">
              <span>{t('card_live')}</span>
            </div>
          </button>

          {/* 2. MOVIES / VOD CARD */}
          <button
            id="card-movies"
            onClick={() => onNavigate('movies')}
            className="group relative h-96 rounded-3xl bg-gradient-to-b from-[#381a1a] via-[#241214] to-[#140b0c] border-2 border-amber-500/40 p-8 flex flex-col justify-between items-center text-center shadow-2xl shadow-amber-950/50 hover:border-amber-400 hover:shadow-amber-500/40 smarters-card tv-focusable"
          >
            {/* Top decorative glow */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 to-rose-500"></div>

            {/* VOD badge */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 self-end">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">VOD 4K</span>
            </div>

            {/* Center Big Icon */}
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-xl shadow-rose-600/40 group-hover:scale-110 group-focus:scale-110 transition-transform duration-300">
                <Film className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-4xl font-black mt-6 tracking-wider text-white group-hover:text-amber-300 transition-colors">
                {t('card_movies')}
              </h3>
              <p className="text-slate-400 font-medium text-sm mt-1">
                {t('card_movies_desc')}
              </p>
            </div>

            {/* Bottom info pill */}
            <div className="w-full py-2 px-4 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-center space-x-2 text-xs font-semibold text-amber-300">
              <span>{t('card_movies')}</span>
            </div>
          </button>

          {/* 3. SERIES CARD */}
          <button
            id="card-series"
            onClick={() => onNavigate('series')}
            className="group relative h-96 rounded-3xl bg-gradient-to-b from-[#25153b] via-[#1a0f2b] to-[#10081c] border-2 border-purple-500/40 p-8 flex flex-col justify-between items-center text-center shadow-2xl shadow-purple-950/50 hover:border-purple-400 hover:shadow-purple-500/40 smarters-card tv-focusable"
          >
            {/* Top decorative glow */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>

            {/* Series badge */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 self-end">
              <span className="text-xs font-black uppercase tracking-wider text-purple-400">SERIES</span>
            </div>

            {/* Center Big Icon */}
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-purple-600/40 group-hover:scale-110 group-focus:scale-110 transition-transform duration-300">
                <Clapperboard className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-4xl font-black mt-6 tracking-wider text-white group-hover:text-purple-300 transition-colors">
                {t('card_series')}
              </h3>
              <p className="text-slate-400 font-medium text-sm mt-1">
                {t('card_series_desc')}
              </p>
            </div>

            {/* Bottom info pill */}
            <div className="w-full py-2 px-4 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-center space-x-2 text-xs font-semibold text-purple-300">
              <span>{t('card_series')}</span>
            </div>
          </button>
        </div>
      </main>

      {/* FOOTER: Smarters Utilities Bar */}
      <footer className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-400/50 hover:bg-cyan-500/30 font-bold text-sm text-cyan-300 tv-focusable"
          >
            <User className="w-4 h-4 text-cyan-400" />
            <span>{t('nav_profile')}</span>
          </button>

          <button
            onClick={() => onNavigate('favorites')}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:bg-slate-700 font-medium text-sm text-slate-200 tv-focusable"
          >
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>{t('nav_favorites')}</span>
          </button>

          <button
            onClick={onSwitchAccount}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:bg-slate-700 font-medium text-sm text-slate-200 tv-focusable"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>{t('nav_accounts')}</span>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:bg-slate-700 font-medium text-sm text-slate-200 tv-focusable"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span>{t('nav_settings')}</span>
          </button>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/80 font-mono text-slate-300">
            [OK] Seleccionar
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/80 font-mono text-slate-300">
            [▲ ▼ ◀ ▶] Moverse
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/80 font-mono text-slate-300">
            [Atrás] Salir
          </span>
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
              {languageOptions.map(opt => {
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

