// Utilities to extract, parse, and format audio and subtitle tracks from Xtream Codes API
// Supports episodes, VOD movies, and live streams

export interface PlayerAudioTrack {
  id: number;
  name: string;
  language?: string;
  codec?: string;
  sampleRate?: string;
}

export const formatAudioLanguageLabel = (langCode?: string, fallback = ''): string => {
  if (!langCode || typeof langCode !== 'string') return fallback;
  const l = langCode.trim().toLowerCase();
  if (l.startsWith('es') || l === 'spa' || l === 'castellano' || l === 'spanish') return 'Español';
  if (l.startsWith('en') || l === 'eng' || l === 'english') return 'Inglés';
  if (l.startsWith('pt') || l === 'por' || l === 'portuguese') return 'Portugués';
  if (l.startsWith('fr') || l === 'fra' || l === 'french') return 'Francés';
  if (l.startsWith('it') || l === 'ita' || l === 'italian') return 'Italiano';
  if (l.startsWith('de') || l === 'ger' || l === 'german') return 'Alemán';
  if (l.startsWith('ru') || l === 'rus' || l === 'russian') return 'Ruso';
  if (l.startsWith('ja') || l === 'jpn' || l === 'japanese') return 'Japonés';
  if (l.startsWith('ko') || l === 'kor' || l === 'korean') return 'Coreano';
  if (l.startsWith('zh') || l === 'chi' || l === 'zho' || l === 'chinese') return 'Chino';
  return String(langCode || fallback || '').toUpperCase();
};

export const parseXtreamAudioTracks = (rawAudio: any): PlayerAudioTrack[] => {
  if (!rawAudio) return [];

  let list: any[] = [];
  if (typeof rawAudio === 'string') {
    try {
      rawAudio = JSON.parse(rawAudio);
    } catch {
      return [];
    }
  }

  if (Array.isArray(rawAudio)) {
    list = rawAudio;
  } else if (typeof rawAudio === 'object' && rawAudio !== null) {
    list = Object.values(rawAudio);
  }

  if (!Array.isArray(list) || list.length === 0) return [];

  return list
    .filter(item => item && typeof item === 'object')
    .map((item, idx) => {
      const lang = (typeof item?.tags?.language === 'string' ? item.tags.language : '') || (typeof item?.language === 'string' ? item.language : '') || (typeof item?.lang === 'string' ? item.lang : '');
      const title = (typeof item?.tags?.title === 'string' ? item.tags.title : '') || (typeof item?.title === 'string' ? item.title : '') || (typeof item?.name === 'string' ? item.name : '');
      const codec = (typeof item?.codec_name === 'string' ? item.codec_name : '') || (typeof item?.codec === 'string' ? item.codec : '');
      const sampleRate = item?.sample_rate ? `${item.sample_rate}Hz` : '';

      const langName = formatAudioLanguageLabel(lang);
      let label = '';

      if (langName) {
        label = `Audio ${idx + 1} (${langName})`;
      } else if (title && !title.toLowerCase().startsWith('und') && !title.toLowerCase().startsWith('unk')) {
        label = `Audio ${idx + 1} (${title})`;
      } else {
        label = `Audio ${idx + 1}`;
      }

      // Append codec and sample rate like IPTV Smarters: "Audio 1 (Inglés) • MP3, 48000Hz"
      const techDetails: string[] = [];
      if (codec && typeof codec === 'string') techDetails.push(String(codec).toUpperCase());
      if (sampleRate) techDetails.push(sampleRate);

      if (techDetails.length > 0) {
        label += ` • ${techDetails.join(', ')}`;
      }

      const id = typeof item?.index === 'number' ? item.index : idx;

      return {
        id,
        name: label,
        language: langName || lang,
        codec,
        sampleRate
      };
    });
};

export const parseXtreamSubtitles = (rawSubs: any): Array<{ id: number; name: string }> => {
  if (!rawSubs) return [];

  let list: any[] = [];
  if (typeof rawSubs === 'string') {
    try {
      rawSubs = JSON.parse(rawSubs);
    } catch {
      return [];
    }
  }

  if (Array.isArray(rawSubs)) {
    list = rawSubs;
  } else if (typeof rawSubs === 'object' && rawSubs !== null) {
    list = Object.values(rawSubs);
  }

  if (!Array.isArray(list) || list.length === 0) return [];

  return list
    .filter(item => item && typeof item === 'object')
    .map((item, idx) => {
      const lang = (typeof item?.tags?.language === 'string' ? item.tags.language : '') || (typeof item?.language === 'string' ? item.language : '') || (typeof item?.lang === 'string' ? item.lang : '');
      const title = (typeof item?.tags?.title === 'string' ? item.tags.title : '') || (typeof item?.title === 'string' ? item.title : '') || (typeof item?.name === 'string' ? item.name : '');
      const langName = formatAudioLanguageLabel(lang);

      let label = '';
      if (langName) {
        label = `Subtítulo ${idx + 1} (${langName})`;
      } else if (title) {
        label = `Subtítulo ${idx + 1} (${title})`;
      } else {
        label = `Subtítulo ${idx + 1}`;
      }

      const id = typeof item?.index === 'number' ? item.index : idx;
      return {
        id,
        name: label
      };
    });
};
