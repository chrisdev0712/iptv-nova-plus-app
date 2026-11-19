import React, { useState, useEffect } from 'react';
import {
  Tv,
  Globe,
  RefreshCw,
  Copy,
  ExternalLink,
  X,
  AlertCircle
} from 'lucide-react';
import { getDeviceMac, getDeviceKey, getPortalUrl } from '../utils/deviceInfo';
import { XtreamClient } from '../services/xtream';
import { SavedAccount } from '../types/xtream';
import { useTranslation } from '../utils/i18n';

interface DeviceMacModalProps {
  onClose: () => void;
  onAccountLoaded: (client: XtreamClient, account: SavedAccount) => void;
  onOpenWebPortal: () => void;
}

export const DeviceMacModal: React.FC<DeviceMacModalProps> = ({
  onClose,
  onAccountLoaded,
  onOpenWebPortal
}) => {
  const { t } = useTranslation();
  const [mac] = useState(() => getDeviceMac());
  const [deviceKey] = useState(() => getDeviceKey());
  const portalUrl = getPortalUrl();

  const [checking, setChecking] = useState(false);
  const [copiedMac, setCopiedMac] = useState(false);
  const [statusText, setStatusText] = useState(() => t('status_waiting_mac'));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const checkRemotePlaylist = async (isManual = false) => {
    if (checking) return;
    setChecking(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/playlist?mac=${encodeURIComponent(mac)}`);
      const data = await res.json();

      if (res.ok && data.success && data.playlist) {
        setStatusText(t('status_found_mac'));

        // Connect with Xtream Codes
        const p = data.playlist;
        const client = new XtreamClient(p.serverUrl, p.username, p.password);
        const auth = await client.authenticate();

        const newAccount: SavedAccount = {
          id: 'acc_' + Date.now(),
          name: p.name || p.username,
          serverUrl: p.serverUrl,
          username: p.username,
          password: p.password,
          status: auth.user_info?.status || 'Active',
          expDate: auth.user_info?.exp_date,
          lastLogin: new Date().toISOString()
        };

        setStatusText(t('status_connected_mac'));
        setTimeout(() => {
          onAccountLoaded(client, newAccount);
        }, 1200);
      } else {
        if (isManual) {
          setErrorMsg(t('status_not_found_mac'));
        }
      }
    } catch (err: any) {
      if (isManual) {
        setErrorMsg(t('status_api_error') + (err?.message || 'Error'));
      }
    } finally {
      setChecking(false);
    }
  };

  // Auto-polling every 5 seconds while modal is open
  useEffect(() => {
    // Initial check
    checkRemotePlaylist(false);

    const interval = setInterval(() => {
      checkRemotePlaylist(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [mac]);

  const handleCopyMac = () => {
    navigator.clipboard?.writeText(mac);
    setCopiedMac(true);
    setTimeout(() => setCopiedMac(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-fadeIn">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#0f172a] to-[#070b14] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all tv-focusable"
          title={t('close')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
              <span>{t('mac_modal_title')}</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-black">
                VERCEL API
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {t('mac_modal_desc')}
            </p>
          </div>
        </div>

        {/* MAC & Key Info Cards */}
        <div className="my-6 space-y-4">
          {/* TV MAC BOX */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
            <div>
              <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase block mb-1">
                {t('mac_address_label')}
              </span>
              <span className="text-xl sm:text-2xl font-mono font-black tracking-widest text-white">
                {mac}
              </span>
            </div>
            <button
              onClick={handleCopyMac}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-bold flex items-center space-x-1.5 transition-all tv-focusable shrink-0"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedMac ? t('copied') : t('copy_mac')}</span>
            </button>
          </div>

          {/* DEVICE KEY BOX */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase block mb-0.5">
                {t('device_key_label')}
              </span>
              <span className="text-lg font-mono font-extrabold text-slate-200 tracking-wider">
                {deviceKey}
              </span>
            </div>
            <span className="text-xs text-slate-400">{t('device_key_desc')}</span>
          </div>

          {/* Web portal Instructions */}
          <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-blue-300 font-bold">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>{t('instructions_title')}</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed pl-1">
              <li>
                {t('instructions_step1')}
                <strong className="text-cyan-300 font-mono select-all">{portalUrl}</strong>
              </li>
              <li>{t('instructions_step2')}</li>
              <li>{t('instructions_step3')}</li>
              <li>{t('instructions_step4')}</li>
            </ol>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="mb-6 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <span className="font-semibold text-slate-200">{statusText}</span>
          </div>
          {checking && <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />}
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => checkRemotePlaylist(true)}
            disabled={checking}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all tv-focusable shadow-lg shadow-cyan-600/30 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{t('check_now')}</span>
          </button>

          <button
            onClick={onOpenWebPortal}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all tv-focusable"
          >
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            <span>{t('open_web_portal_here')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
