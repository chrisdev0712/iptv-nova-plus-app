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
  Languages
} from 'lucide-react';
import { XtreamClient } from '../services/xtream';
import { SavedAccount, XtreamAuthResponse } from '../types/xtream';
import { useTranslation } from '../utils/i18n';
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
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  client,
  account,
  onBack,
  onLogout,
  onSwitchAccount
}) => {
  const { language, setLanguage, t } = useTranslation();
  const [authData, setAuthData] = useState<XtreamAuthResponse | null>(null);
  const [streamFormat, setStreamFormat] = useState<'m3u8' | 'ts'>(() => {
    return (localStorage.getItem('iptv_format') as 'm3u8' | 'ts') || 'm3u8';
  });
  const [clearedNotice, setClearedNotice] = useState(false);

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
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Ajustes & Cuenta Xtream Codes</h1>
          </div>
        </div>
      </header>

      {/* Settings Grid */}
      <div className="flex-1 overflow-y-auto p-10 max-w-5xl mx-auto w-full space-y-8">
        {/* Account Details Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-base font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2 mb-4">
            <User className="w-4 h-4" />
            <span>Detalles de la Suscripción</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-xs text-slate-400 block">Usuario</span>
              <span className="text-base font-bold text-white mt-1 block">{account.username}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-xs text-slate-400 block">Estado</span>
              <span className="text-base font-bold text-emerald-400 mt-1 block">
                {authData?.user_info?.status || 'Activo'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-xs text-slate-400 block">Conexiones</span>
              <span className="text-base font-bold text-cyan-300 mt-1 block">
                {authData?.user_info?.active_cons || '1'} / {authData?.user_info?.max_connections || '1'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-xs text-slate-400 block">Servidor</span>
              <span className="text-base font-bold text-slate-200 mt-1 block truncate">
                {account.serverUrl}
              </span>
            </div>
          </div>
        </div>

        {/* Language Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-base font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2 mb-2">
            <Languages className="w-4 h-4" />
            <span>{t('language_setting')}</span>
          </h2>
          <p className="text-xs text-slate-400 mb-4">{t('language_desc')}</p>

          <div className="flex space-x-4">
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 py-3.5 px-4 rounded-xl text-sm font-bold border transition-all tv-focusable flex items-center justify-center space-x-2 ${
                language === 'en'
                  ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-600/30'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>🇺🇸 English (Global Default)</span>
            </button>
            <button
              onClick={() => setLanguage('es')}
              className={`flex-1 py-3.5 px-4 rounded-xl text-sm font-bold border transition-all tv-focusable flex items-center justify-center space-x-2 ${
                language === 'es'
                  ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-600/30'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>🇪🇸 Español</span>
            </button>
          </div>
        </div>

        {/* Playback Settings Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-base font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2 mb-4">
            <Tv className="w-4 h-4" />
            <span>Preferencias de Reproducción</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">
                Formato de Stream para Canales en Vivo
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
                  HLS (.m3u8) - Recomendado para Smart TV & Tizen / webOS
                </button>
                <button
                  onClick={() => handleFormatChange('ts')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border transition-all tv-focusable ${
                    streamFormat === 'ts'
                      ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  MPEG-TS (.ts) - Flujo directo sin segmentación
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
              <span>Control Parental (+18 / XXX)</span>
            </h2>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                parentalEnabled
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {parentalEnabled ? 'PROTECCIÓN ACTIVADA' : 'DESACTIVADO'}
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
                <h4 className="text-sm font-bold text-white">Bloqueo de Canales y Películas para Adultos</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Solicita PIN de 4 dígitos antes de abrir cualquier categoría o contenido XXX.
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
                {parentalEnabled ? 'Desactivar Control' : 'Activar Control'}
              </button>
            </div>

            {/* Change Password */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
              <div>
                <h4 className="text-sm font-bold text-white">Cambiar Contraseña / PIN</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  El PIN por defecto es <span className="font-mono font-bold text-slate-200">0000</span>. Puedes modificarlo cuando quieras.
                </p>
              </div>

              <button
                onClick={() => setPinModalMode('verify_old')}
                className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-600 text-xs font-bold text-cyan-300 hover:text-white flex items-center space-x-2 tv-focusable"
              >
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span>Cambiar PIN</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Management Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-base font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2 mb-4">
            <Trash2 className="w-4 h-4" />
            <span>Gestión de Datos</span>
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Borrar lista de Favoritos</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Restablece los canales y películas marcados con estrella.
              </p>
            </div>
            <button
              onClick={handleClearFavorites}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white tv-focusable"
            >
              {clearedNotice ? '¡Favoritos borrados!' : 'Limpiar Favoritos'}
            </button>
          </div>
        </div>

        {/* Log Out & Switch Account */}
        <div className="pt-4 flex items-center justify-between">
          <button
            onClick={onSwitchAccount}
            className="py-3 px-6 rounded-2xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 hover:text-white font-bold text-sm tv-focusable transition-all flex items-center space-x-2"
          >
            <span>Cambiar de Usuario / Agregar Cuenta</span>
          </button>

          <button
            onClick={onLogout}
            className="py-3 px-6 rounded-2xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 hover:text-white font-bold text-sm tv-focusable transition-all"
          >
            Cerrar Sesión en este TV
          </button>
        </div>
      </div>

      {/* Pin Verification for Toggle */}
      {pinModalMode === 'toggle' && (
        <PinModal
          title="Confirmar con PIN"
          subtitle={`Ingresa tu PIN para ${parentalEnabled ? 'desactivar' : 'activar'} el control parental`}
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
          title="Verificar PIN Actual"
          subtitle="Ingresa tu contraseña actual (por defecto es 0000)"
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

            <h3 className="text-xl font-bold text-white">Nuevo PIN de 4 Dígitos</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[260px] leading-relaxed">
              Elige tu nueva contraseña de 4 números para el control parental
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
                className="h-12 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white tv-focusable flex items-center justify-center"
                title="Borrar"
              >
                Borrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

