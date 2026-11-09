export type TvAction =
  | 'UP'
  | 'DOWN'
  | 'LEFT'
  | 'RIGHT'
  | 'ENTER'
  | 'BACK'
  | 'PLAY'
  | 'PAUSE'
  | 'PLAY_PAUSE'
  | 'STOP'
  | 'FAST_FORWARD'
  | 'REWIND'
  | 'RED'
  | 'GREEN'
  | 'YELLOW'
  | 'BLUE'
  | 'CH_UP'
  | 'CH_DOWN'
  | 'UNKNOWN';

export const normalizeTvKey = (event: KeyboardEvent): TvAction => {
  const { keyCode, key } = event;

  // Arrow Keys
  if (keyCode === 38 || key === 'ArrowUp') return 'UP';
  if (keyCode === 40 || key === 'ArrowDown') return 'DOWN';
  if (keyCode === 37 || key === 'ArrowLeft') return 'LEFT';
  if (keyCode === 39 || key === 'ArrowRight') return 'RIGHT';

  // Enter / OK
  if (keyCode === 13 || key === 'Enter') return 'ENTER';

  // Return / Back (Tizen: 10009, webOS: 461, Android: 4, Escape: 27, Backspace: 8)
  if (keyCode === 10009 || keyCode === 461 || keyCode === 4 || keyCode === 27 || keyCode === 8 || key === 'Backspace' || key === 'Escape') {
    return 'BACK';
  }

  // Media Keys
  if (keyCode === 415 || key === 'MediaPlay') return 'PLAY';
  if (keyCode === 19 || key === 'MediaPause') return 'PAUSE';
  if (keyCode === 10252 || key === 'MediaPlayPause') return 'PLAY_PAUSE';
  if (keyCode === 413 || key === 'MediaStop') return 'STOP';
  if (keyCode === 417 || key === 'MediaFastForward') return 'FAST_FORWARD';
  if (keyCode === 412 || key === 'MediaRewind') return 'REWIND';

  // Channel up / down
  if (keyCode === 427 || key === 'ChannelUp') return 'CH_UP';
  if (keyCode === 428 || key === 'ChannelDown') return 'CH_DOWN';

  // Color keys
  if (keyCode === 403 || key === 'ColorF0Red') return 'RED';
  if (keyCode === 404 || key === 'ColorF1Green') return 'GREEN';
  if (keyCode === 405 || key === 'ColorF2Yellow') return 'YELLOW';
  if (keyCode === 406 || key === 'ColorF3Blue') return 'BLUE';

  return 'UNKNOWN';
};

// Initialize Tizen TV keys if running inside Samsung Tizen OS
export const initTizenKeys = () => {
  try {
    const tizen = (window as any).tizen;
    if (tizen && tizen.tvinputdevice) {
      const keysToRegister = [
        'MediaPlay',
        'MediaPause',
        'MediaPlayPause',
        'MediaStop',
        'MediaFastForward',
        'MediaRewind',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'ColorF0Red',
        'ColorF1Green',
        'ColorF2Yellow',
        'ColorF3Blue'
      ];
      keysToRegister.forEach(k => {
        try {
          tizen.tvinputdevice.registerKey(k);
        } catch {
          // Key might not be supported or already registered
        }
      });
    }
  } catch (e) {
    console.warn('Tizen TV input device registration skipped', e);
  }
};

