/**
 * IPTV Nova Plus - Device Identification & Remote Activation Utilities
 * Provides unique, persistent MAC Address and Device Key for Smart TVs, Mobile, and Web.
 */

const STORAGE_MAC_KEY = 'iptv_device_mac';
const STORAGE_DEVICE_KEY = 'iptv_device_key';

// Helper to generate a realistic MAC address (00:1A:79 is standard for IPTV/STB devices)
const generateRealisticMac = (): string => {
  const hexDigits = '0123456789ABCDEF';
  const randomByte = () =>
    hexDigits[Math.floor(Math.random() * 16)] + hexDigits[Math.floor(Math.random() * 16)];
  return `00:1A:79:${randomByte()}:${randomByte()}:${randomByte()}`;
};

// Helper to generate a 6-digit numeric device key
const generateNumericKey = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Normalizes a MAC string to uppercase standard format: XX:XX:XX:XX:XX:XX
 */
export const normalizeMac = (rawMac: string): string => {
  const clean = rawMac.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
  const parts: string[] = [];
  for (let i = 0; i < clean.length && i < 12; i += 2) {
    parts.push(clean.substring(i, i + 2));
  }
  return parts.join(':');
};

/**
 * Returns the persistent MAC address of this device (Smart TV, Mobile, or Browser)
 */
export const getDeviceMac = (): string => {
  let mac = localStorage.getItem(STORAGE_MAC_KEY);
  if (mac && mac.length >= 12) {
    return normalizeMac(mac);
  }

  // Check LG webOS API if running natively on LG TV
  try {
    const webOS = (window as any).webOS;
    if (webOS && typeof webOS.deviceInfo === 'function') {
      webOS.deviceInfo((info: any) => {
        const found = info?.wiredAddr || info?.wifiAddr || info?.modelName;
        if (found && typeof found === 'string' && found.includes(':')) {
          localStorage.setItem(STORAGE_MAC_KEY, normalizeMac(found));
        }
      });
    }
  } catch {
    // Ignore native call failure
  }

  // Check Samsung Tizen API if running natively on Samsung TV
  try {
    const tizen = (window as any).tizen;
    if (tizen?.systeminfo?.getPropertyValue) {
      tizen.systeminfo.getPropertyValue(
        'WIFI_NETWORK',
        (wifi: any) => {
          if (wifi?.macAddress) {
            localStorage.setItem(STORAGE_MAC_KEY, normalizeMac(wifi.macAddress));
          }
        },
        () => {
          // Fallback to Ethernet
          tizen.systeminfo.getPropertyValue('ETHERNET_NETWORK', (eth: any) => {
            if (eth?.macAddress) {
              localStorage.setItem(STORAGE_MAC_KEY, normalizeMac(eth.macAddress));
            }
          });
        }
      );
    }
  } catch {
    // Ignore native call failure
  }

  // Re-read or generate persistent fallback
  mac = localStorage.getItem(STORAGE_MAC_KEY);
  if (!mac || mac.length < 12) {
    mac = generateRealisticMac();
    localStorage.setItem(STORAGE_MAC_KEY, mac);
  }

  return normalizeMac(mac);
};

/**
 * Set or override MAC address (useful if user wants to use their exact TV sticker MAC)
 */
export const setDeviceMac = (mac: string): string => {
  const normalized = normalizeMac(mac);
  localStorage.setItem(STORAGE_MAC_KEY, normalized);
  return normalized;
};

/**
 * Returns the persistent 6-digit Device Key
 */
export const getDeviceKey = (): string => {
  let key = localStorage.getItem(STORAGE_DEVICE_KEY);
  if (!key || key.length !== 6) {
    key = generateNumericKey();
    localStorage.setItem(STORAGE_DEVICE_KEY, key);
  }
  return key;
};

/**
 * Returns the public portal activation URL
 */
export const getPortalUrl = (): string => {
  const origin = window.location.origin;
  // If running from localhost or vercel
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return `${origin}/#activate`;
  }
  return 'https://iptvnovaplus.vercel.app/#activate';
};

