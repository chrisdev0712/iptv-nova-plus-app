import React from 'react';
import {
  User,
  Calendar,
  Clock,
  ShieldCheck,
  Server,
  Tv,
  X,
  Users,
  LogOut,
  RefreshCw,
  Zap,
  Globe
} from 'lucide-react';
import { SavedAccount, XtreamAuthResponse } from '../types/xtream';

interface UserProfileModalProps {
  account: SavedAccount;
  authData: XtreamAuthResponse | null;
  onClose: () => void;
  onSwitchAccount: () => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  account,
  authData,
  onClose,
  onSwitchAccount,
  onLogout
}) => {
  const userInfo = authData?.user_info;
  const serverInfo = authData?.server_info;

  const formatExpDate = () => {
    if (!userInfo?.exp_date) return 'Ilimitado';
    const ts = parseInt(userInfo.exp_date);
    if (isNaN(ts) || ts <= 0) return 'Ilimitado';
    const date = new Date(ts * 1000);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysRemaining = () => {
    if (!userInfo?.exp_date) return null;
    const ts = parseInt(userInfo.exp_date);
    if (isNaN(ts) || ts <= 0) return null;
    const diffTime = ts * 1000 - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Expirado';
    if (diffDays === 0) return 'Expira hoy';
    if (diffDays === 1) return 'Falta 1 día';
    if (diffDays < 30) return `Faltan ${diffDays} días`;
    const months = Math.floor(diffDays / 30);
    return `Quedan ~${months} meses (${diffDays} días)`;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6 select-none">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0f172a] to-[#0a0f1d] border border-cyan-500/40 rounded-3xl p-8 shadow-2xl shadow-cyan-950/60">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white tv-focusable"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Profile Info */}
        <div className="flex items-center space-x-5 mb-8 pb-6 border-b border-slate-800">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30 text-3xl font-black shrink-0">
            <User className="w-10 h-10" />
          </div>

          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{userInfo?.status || 'ACTIVO'}</span>
              </span>

              {userInfo?.is_trial === '1' && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs">
                  Cuenta Demo / Trial
                </span>
              )}
            </div>

            <h2 className="text-3xl font-black text-white tracking-tight">
              {account.name || userInfo?.username || account.username}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Usuario ID: <span className="text-cyan-300 font-bold">{account.username}</span>
            </p>
          </div>
        </div>

        {/* Big Expiration Banner */}
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/40 border border-emerald-500/40 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Fecha de Expiración de tu Suscripción
              </span>
              <p className="text-2xl font-black text-emerald-400 mt-0.5 tracking-wide">
                {formatExpDate()}
              </p>
            </div>
          </div>

          {daysRemaining && (
            <div className="text-right">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-sm block">
                {daysRemaining}
              </span>
            </div>
          )}
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {/* Conexiones */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Conexiones</span>
            </div>
            <p className="text-xl font-black text-white">
              {userInfo?.active_cons || '0'} / {userInfo?.max_connections || '1'}
            </p>
            <span className="text-[11px] text-slate-400">Pantallas simultáneas</span>
          </div>

          {/* Servidor */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Servidor Host</span>
            </div>
            <p className="text-sm font-bold text-white truncate font-mono">
              {serverInfo?.url || account.serverUrl}
            </p>
            <span className="text-[11px] text-slate-400">Puerto: {serverInfo?.port || '8443'}</span>
          </div>

          {/* Formatos */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Tv className="w-4 h-4 text-purple-400" />
              <span>Formatos</span>
            </div>
            <p className="text-sm font-bold text-white truncate font-mono uppercase">
              {userInfo?.allowed_output_formats?.join(', ') || 'M3U8, TS, MP4'}
            </p>
            <span className="text-[11px] text-slate-400">Streaming compatible</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                onClose();
                onSwitchAccount();
              }}
              className="py-3 px-5 rounded-xl bg-cyan-600/30 hover:bg-cyan-500 border border-cyan-500/40 text-cyan-300 hover:text-slate-950 font-bold text-xs flex items-center space-x-2 transition-all tv-focusable"
            >
              <Users className="w-4 h-4" />
              <span>Cambiar de Usuario / Agregar Cuenta</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="py-3 px-5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-700/60 text-red-300 hover:text-white font-bold text-xs flex items-center space-x-2 transition-all tv-focusable"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-white text-xs tv-focusable"
          >
            Listo / Volver
          </button>
        </div>
      </div>
    </div>
  );
};

