import React, { useState, useEffect } from 'react';
import { Maximize2, X, Smartphone } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

export const RotateDevicePrompt: React.FC = () => {
  const { t } = useTranslation();
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('iptv_dismiss_rotate') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobileWidth = Math.min(window.innerWidth, window.innerHeight) <= 850;

      if (isPortrait && (isTouch || isMobileWidth)) {
        setIsPortraitMobile(true);
      } else {
        setIsPortraitMobile(false);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const handleEnterLandscapeFullscreen = async () => {
    try {
      const docEl = document.documentElement as any;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen request:', e);
    }

    try {
      const screenObj = window.screen as any;
      if (screenObj?.orientation?.lock) {
        await screenObj.orientation.lock('landscape');
      } else if (screenObj?.lockOrientation) {
        screenObj.lockOrientation('landscape');
      }
    } catch (e) {
      console.warn('Orientation lock:', e);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('iptv_dismiss_rotate', '1');
    } catch {}
  };

  if (!isPortraitMobile || dismissed) {
    return null;
  }

  return (
    <aside
      aria-label="Rotate suggestion"
      className="fixed bottom-4 left-4 right-4 z-[9999] p-3 rounded-2xl bg-slate-900/95 border border-cyan-500/40 backdrop-blur-xl shadow-2xl shadow-cyan-950/60 flex items-center justify-between gap-3 animate-fadeIn text-white"
    >
      <div className="flex items-center space-x-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
          <Smartphone className="w-5 h-5 animate-phone-rotate" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white truncate">
            {t('rotate_prompt_title')}
          </p>
          <p className="text-[11px] text-slate-400 truncate">
            {t('rotate_prompt_desc')}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        <button
          onClick={handleEnterLandscapeFullscreen}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>16:9 TV</span>
        </button>

        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
