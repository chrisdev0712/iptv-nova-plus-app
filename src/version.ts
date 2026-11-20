export const APP_VERSION = 'v1.0.4-b20261120.02';
export const APP_BUILD_DATE = '2026-11-20';

if (typeof window !== 'undefined') {
  (window as any).__APP_VERSION__ = APP_VERSION;
  console.log(`%c[IPTV Nova Plus] Running ${APP_VERSION} (Build: ${APP_BUILD_DATE})`, 'color: #38bdf8; font-weight: bold; font-size: 14px;');
}
