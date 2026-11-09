const PIN_STORAGE_KEY = 'iptv_parental_pin';
const ENABLED_STORAGE_KEY = 'iptv_parental_enabled';

export const getParentalPin = (): string => {
  return localStorage.getItem(PIN_STORAGE_KEY) || '0000';
};

export const setParentalPin = (newPin: string): void => {
  localStorage.setItem(PIN_STORAGE_KEY, newPin);
};

export const isParentalControlEnabled = (): boolean => {
  const val = localStorage.getItem(ENABLED_STORAGE_KEY);
  // Enabled by default
  return val === null ? true : val === 'true';
};

export const setParentalControlEnabled = (enabled: boolean): void => {
  localStorage.setItem(ENABLED_STORAGE_KEY, String(enabled));
};

export const isAdultContent = (text?: string): boolean => {
  if (!text) return false;
  const lower = text.toLowerCase();
  
  // Patterns for adult content
  return (
    lower.includes('xxx') ||
    lower.includes('adult') ||
    lower.includes('adultos') ||
    lower.includes('+18') ||
    lower.includes('18+') ||
    lower.includes('erotic') ||
    lower.includes('erotico') ||
    lower.includes('porn') ||
    lower.includes('playboy') ||
    lower.includes('venus') ||
    lower.includes('penthouse') ||
    lower.includes('redlight') ||
    lower.includes('hustler')
  );
};

