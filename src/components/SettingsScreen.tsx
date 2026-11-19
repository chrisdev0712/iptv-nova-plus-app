import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Settings,
  Shield,
  Server,
  User,
  Clock,
  Trash2,
  CheckCircle,
  Tv,
  Lock,
  KeyRound,
  ShieldAlert,
  Languages,
  Copy,
  ExternalLink,
  RefreshCw,
  Globe,
  Check
} from 'lucide-react';
import { XtreamClient } from '../services/xtream';
import { SavedAccount, XtreamAuthResponse } from '../types/xtream';
import { useTranslation } from '../utils/i18n';
import { getDeviceMac, getDeviceKey, getPortalUrl } from '../utils/deviceInfo';
import {
  isParentalControlEnabled,
  setParentalControlEnabled,
  getParentalPin,
  setParentalPin
} from '../utils/parentalControl';
import { PinModal } from './PinModal';

interface SettingsScreenProps {
  client: XtreamClient;
  account: SavedAccount;
  onBack: () => void;
  onLogout: () => void;
  onSwitchAccount: () => void;
  onOpenWebPortal?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  client,
  account,
  onBack,
  onLogout,
  onSwitchAccount,
  onOpenWebPortal
}) => {
  const { language, setLanguage, t } = useTranslation();
  const [authData, setAuthData] = useState<XtreamAuthResponse | null>(null);
  const [streamFormat, setStreamFormat] = useState<'m3u8' | 'ts'>(() => {
    return (localStorage.getItem('iptv_format') as 'm3u8' | 'ts') || 'm3u8';
  });
  const [clearedNotice, setClearedNotice] = useState(false);

  // Device Info & MAC Activation state
  const [deviceMac] = useState(() => getDeviceMac());
  const [deviceKey] = useState(() => getDeviceKey());
  const portalUrl = getPortalUrl();
  const [copiedMac, setCopiedMac] = useState(false);
  const [syncingMac, setSyncingMac] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const handleSyncMacPlaylist = async () => {
    setSyncingMac(true);
    setSyncMsg(null);
    try {
      const res = await fetch(`/api/playlist?mac=${encodeURIComponent(deviceMac)}`);
      const data = await res.json();
      if (res.ok && data.success && data.playlist) {
        setSyncMsg('¡Playlist sincronizada exitosamente con la API de Vercel!');
      } else {
        setSyncMsg('No hay cambios pendientes para esta MAC en el servidor.');
      }
    } catch (e: any) {
      setSyncMsg('Error al conectar con la API: ' + e.message);
    } finally {
      setSyncingMac(false);
      setTimeout(() => setSyncMsg(null), 4000);
    }
  };

  // Parental Control state
  const [parentalEnabled, setParentalEnabledState] = useState<boolean>(() => isParentalControlEnabled());
  const [pinModalMode, setPinModalMode] = useState<'toggle' | 'verify_old' | 'set_new' | null>(null);
  const [newPinCandidate, setNewPinCandidate] = useState('');
  const [pinMessage, setPinMessage] = useState<string | null>(null);

  useEffect(() => {
    client.authenticate().then(setAuthData).catch(console.error);
  }, [client]);

  const handleFormatChange = (fmt: 'm3u8' | 'ts') => {
    setStreamFormat(fmt);
    localStorage.setItem('iptv_format', fmt);
  };

  const handleClearFavorites = () => {
    localStorage.removeItem('iptv_fav_live');
    localStorage.removeItem('iptv_fav_movies');
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  return (
    <div className="relative h-screen w-screen bg-[#080d1a] text-white flex flex-col overflow-hidden select-none">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 tv-focusable"
            title={t('player_back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">{t('settings_title')}</h1>
          </div>
        </div>
      </header>

      {/* Settings Grid */}
      <div className="flex-1 overflow-y-auto p-10 max-w-5xl mx-auto w-full space-y-8">
        {/* Account Details Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-base font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2 mb-4">
            <User className="w-4 h-4" />
            <span>{t('subscription_details')}</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-xs text-slate-400 block">{t('user_label')}</span>
              <span className="text-base font-bold text-white mt-1 block">{account.username}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-xs text-slate-400 block">{t('account_status')}</span>
              <span className="text-base font-bold text-emerald-400 mt-1 block">
                {authData?.user_info?.status || t('active_status')}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-xs text-slate-400 block">{t('max_connections')}</span>
              <span className="text-base font-bold text-cyan-300 mt-1 block">
                {authData?.user_info?.active_cons || '1'} / {authData?.user_info?.max_connections || '1'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-xs text-slate-400 block">{t('server_info')}</span>
              <span className="text-base font-bold text-slate-200 mt-1 block truncate">
                {account.serverUrl}
              </span>
            </div>
          </div>
        </div>

        {/* Device Information & Web Activation by MAC (Vercel Serverless) */}
        <div className="bg-slate-900/60 border border-cyan-500/30 rounded-3xl p-6 shadow-xl shadow-cyan-950/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
              <Tv className="w-4 h-4" />
              <span>{t('device_info_web_portal')}</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-black text-[10px] uppercase border border-cyan-500/40">
              Vercel API
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {/* TV MAC Box */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase">{t('mac_address_label')}</span>
                <span className="text-lg font-mono font-black text-cyan-300 tracking-wider mt-0.5 block">
                  {deviceMac}
                </span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(deviceMac);
                  setCopiedMac(true);
                  setTimeout(() => setCopiedMac(false), 2000);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all tv-focusable"
                title={t('copy_mac')}
              >
                {copiedMac ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Device Key */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-700/60">
              <span className="text-xs text-slate-400 block font-semibold uppercase">{t('device_key_label')}</span>
              <span className="text-lg font-mono font-black text-emerald-400 tracking-widest mt-0.5 block">
                {deviceKey}
              </span>
            </div>

            {/* Web Portal Link */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-700/60 flex items-center justify-between">
              <div className="min-w-0 mr-2">
                <span className="text-xs text-slate-400 block font-semibold uppercase">{t('mac_modal_title')}</span>
                <span className="text-xs font-mono text-slate-200 truncate block mt-0.5">
                  {portalUrl}
                </span>
              </div>
              {onOpenWebPortal && (
                <button
                  onClick={onOpenWebPortal}
                  className="p-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600 border border-cyan-500/40 text-cyan-200 hover:text-white transition-all tv-focusable shrink-0"
                  title={t('open_web_portal_here')}
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Sync status feedback */}
          {syncMsg && (
            <div className="mb-4 p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{syncMsg}</span>
            </div>
          )}

          {/* Actions button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSyncMacPlaylist}
              disabled={syncingMac}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center space-x-2 tv-focusable transition-all shadow-md shadow-cyan-950/50 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingMac ? 'animate-spin' : ''}`} />
              <span>{syncingMac ? 'Consultando API...' : 'Sincronizar Lista Web Ahora'}</span>
            </button>

            {onOpenWebPortal && (
              <button
                onClick={onOpenWebPortal}
                className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center space-x-2 tv-focusable transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Abrir Portal Web de Carga</span>
              </button>
            )}
          </div>
        </div>

        {/* Language Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-base font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2 mb-2">
            <Languages className="w-4 h-4" />
            <span>{t('language_setting')}</span>
          </h2>
          <p className="text-xs text-slate-400 mb-4">{t('language_desc')}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => setLanguage('en')}
              className={`py-3.5 px-4 rounded-xl text-sm font-bold border transition-all tv-focusable flex items-center justify-center space-x-2 ${
                language === 'en'
                  ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-600/30'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>🇺🇸 English</span>
            </button>
            <button
              onClick={() => setLanguage('es')}
              className={`py-3.5 px-4 rounded-xl text-sm font-bold border transition-all tv-focusable flex items-center justify-center space-x-2 ${
                language === 'es'
                  ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-600/30'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>🇪🇸 Español</span>
            </button>
            <button
              onClick={() => setLanguage('pt')}
              className={`py-3.5 px-4 rounded-xl text-sm font-bold border transition-all tv-focusable flex items-center justify-center space-x-2 ${
                language === 'pt'
                  ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-600/30'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>🇧🇷 Português</span>
            </button>
            <button
              onClick={() => setLanguage('fr')}
              className={`py-3.5 px-4 rounded-xl text-sm font-bold border transition-all tv-focusable flex items-center justify-center space-x-2 ${
                language === 'fr'
                  ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-600/30'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>🇫🇷 Français</span>
            </button>
          </div>
        </div>

        {/* Playback Settings Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-base font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2 mb-4">
            <Tv className="w-4 h-4" />
            <span>{t('playback_prefs')}</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">
                {t('stream_format_live')}
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleFormatChange('m3u8')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border transition-all tv-focusable ${
                    streamFormat === 'm3u8'
                      ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  HLS (.m3u8) - (Smart TV webOS / Tizen)
                </button>
                <button
                  onClick={() => handleFormatChange('ts')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border transition-all tv-focusable ${
                    streamFormat === 'ts'
                      ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  MPEG-TS (.ts) - Direct Stream
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Parental Control Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>{t('adult_protection')}</span>
            </h2>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                parentalEnabled
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {parentalEnabled ? t('parental_active') : t('parental_inactive')}
            </span>
          </div>

          {pinMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{pinMessage}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Toggle activation */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
              <div>
                <h4 className="text-sm font-bold text-white">{t('adult_protection')}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('adult_protection_desc')}
                </p>
              </div>

              <button
                onClick={() => setPinModalMode('toggle')}
                className={`py-2.5 px-5 rounded-xl text-xs font-bold transition-all tv-focusable ${
                  parentalEnabled
                    ? 'bg-red-950/60 hover:bg-red-900 border border-red-700/60 text-red-300'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {parentalEnabled ? t('disable_control') : t('enable_control')}
              </button>
            </div>

            {/* Change Password */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
              <div>
                <h4 className="text-sm font-bold text-white">{t('change_pin')}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('change_pin_desc')}
                </p>
              </div>

              <button
                onClick={() => setPinModalMode('verify_old')}
                className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-600 text-xs font-bold text-cyan-300 hover:text-white flex items-center space-x-2 tv-focusable"
              >
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span>{t('change_pin')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Management Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-base font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2 mb-4">
            <Trash2 className="w-4 h-4" />
            <span>{t('data_management')}</span>
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">{t('clear_fav_btn')}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('no_fav_movies_desc')}
              </p>
            </div>
            <button
              onClick={handleClearFavorites}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white tv-focusable"
            >
              {clearedNotice ? t('fav_cleared') : t('clear_fav_btn')}
            </button>
          </div>
        </div>

        {/* Log Out & Switch Account */}
        <div className="pt-4 flex items-center justify-between">
          <button
            onClick={onSwitchAccount}
            className="py-3 px-6 rounded-2xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 hover:text-white font-bold text-sm tv-focusable transition-all flex items-center space-x-2"
          >
            <span>{t('switch_account_btn')}</span>
          </button>

          <button
            onClick={onLogout}
            className="py-3 px-6 rounded-2xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 hover:text-white font-bold text-sm tv-focusable transition-all"
          >
            {t('logout_tv_btn')}
          </button>
        </div>
      </div>

      {/* Pin Verification for Toggle */}
      {pinModalMode === 'toggle' && (
        <PinModal
          title={t('confirm_pin')}
          subtitle={t('enter_pin_to_toggle')}
          onSuccess={() => {
            const next = !parentalEnabled;
            setParentalEnabledState(next);
            setParentalControlEnabled(next);
            setPinModalMode(null);
            setPinMessage(`Control parental ${next ? 'activado' : 'desactivado'} con éxito.`);
            setTimeout(() => setPinMessage(null), 3000);
          }}
          onCancel={() => setPinModalMode(null)}
        />
      )}

      {/* Pin Verification for Change */}
      {pinModalMode === 'verify_old' && (
        <PinModal
          title={t('verify_current_pin')}
          subtitle={t('enter_current_pin_desc')}
          onSuccess={() => {
            setPinModalMode('set_new');
          }}
          onCancel={() => setPinModalMode(null)}
        />
      )}

      {/* Enter New Pin Modal */}
      {pinModalMode === 'set_new' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6 select-none">
          <div className="relative w-full max-w-sm bg-slate-900 border border-cyan-500/50 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-3 shadow-lg shadow-cyan-500/20">
              <KeyRound className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-white">{t('new_4digit_pin')}</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[260px] leading-relaxed">
              {t('choose_new_pin_desc')}
            </p>

            {/* 4 dots */}
            <div className="flex items-center space-x-3 my-5">
              {[0, 1, 2, 3].map(idx => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    newPinCandidate.length > idx
                      ? 'bg-cyan-400 border-cyan-400 scale-110 shadow-lg shadow-cyan-400/50'
                      : 'border-slate-600 bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2.5 w-full max-w-[240px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
                <button
                  key={d}
                  onClick={() => {
                    if (newPinCandidate.length < 4) {
                      const next = newPinCandidate + d;
                      setNewPinCandidate(next);
                      if (next.length === 4) {
                        setParentalPin(next);
                        setPinModalMode(null);
                        setNewPinCandidate('');
                        setPinMessage(`¡PIN actualizado a "${next}" con éxito!`);
                        setTimeout(() => setPinMessage(null), 3000);
                      }
                    }
                  }}
                  className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-lg active:scale-95 transition-all tv-focusable flex items-center justify-center"
                >
                  {d}
                </button>
              ))}

              <button
                onClick={() => {
                  setPinModalMode(null);
                  setNewPinCandidate('');
                }}
                className="h-12 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 text-xs font-bold tv-focusable flex items-center justify-center"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  if (newPinCandidate.length < 4) {
                    const next = newPinCandidate + '0';
                    setNewPinCandidate(next);
                    if (next.length === 4) {
                      setParentalPin(next);
                      setPinModalMode(null);
                      setNewPinCandidate('');
                      setPinMessage(`¡PIN actualizado a "${next}" con éxito!`);
                      setTimeout(() => setPinMessage(null), 3000);
                    }
                  }
                }}
                className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-lg active:scale-95 transition-all tv-focusable flex items-center justify-center"
              >
                0
              </button>

              <button
                onClick={() => setNewPinCandidate(prev => prev.slice(0, -1))}
                className="h-12 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white tv-focusable flex items-center justify-center text-xs font-bold"
                title={t('btn_delete')}
              >
                {t('btn_delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

