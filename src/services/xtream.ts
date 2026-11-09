import {
  XtreamAuthResponse,
  XtreamCategory,
  XtreamLiveStream,
  XtreamVodStream,
  XtreamVodInfo,
  XtreamSeries,
  XtreamSeriesInfo
} from '../types/xtream';
import {
  mockAuthResponse,
  mockLiveCategories,
  mockLiveStreams,
  mockVodCategories,
  mockVodStreams,
  mockSeriesCategories,
  mockSeriesList,
  mockSeriesDetails,
  testLiveStreamUrl,
  testVodStreamUrl,
  testSeriesStreamUrl
} from './mockData';

export class XtreamClient {
  public serverUrl: string;
  public username: string;
  public password: string;
  public isDemo: boolean;

  constructor(serverUrl: string = '', username: string = '', password: string = '') {
    // Clean server url: remove trailing slash
    let cleanUrl = (serverUrl || '').trim();
    if (cleanUrl.endsWith('/')) {
      cleanUrl = cleanUrl.slice(0, -1);
    }
    if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && cleanUrl !== 'demo') {
      cleanUrl = 'http://' + cleanUrl;
    }
    this.serverUrl = cleanUrl;
    this.username = (username || '').trim();
    this.password = (password || '').trim();
    this.isDemo = this.serverUrl.toLowerCase() === 'demo' || this.username.toLowerCase() === 'demo';
  }

  private getBaseUrl(): string {
    return `${this.serverUrl}/player_api.php?username=${encodeURIComponent(this.username)}&password=${encodeURIComponent(this.password)}`;
  }

  async authenticate(): Promise<XtreamAuthResponse> {
    if (this.isDemo) {
      return mockAuthResponse;
    }

    const url = this.getBaseUrl();
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`);
      }
      const data: XtreamAuthResponse = await res.json();
      if (!data.user_info || data.user_info.auth !== 1) {
        throw new Error(data.user_info?.message || 'Usuario o contraseña incorrectos');
      }
      return data;
    } catch (err: any) {
      if (this.isDemo) {
        return mockAuthResponse;
      }
      throw err;
    }
  }

  // === LIVE TV ===
  async getLiveCategories(): Promise<XtreamCategory[]> {
    if (this.isDemo) return mockLiveCategories;
    const url = `${this.getBaseUrl()}&action=get_live_categories`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener categorías en vivo');
    return res.json();
  }

  async getLiveStreams(categoryId?: string): Promise<XtreamLiveStream[]> {
    if (this.isDemo) {
      if (!categoryId || categoryId === 'all') return mockLiveStreams;
      return mockLiveStreams.filter(s => s.category_id === categoryId);
    }
    let url = `${this.getBaseUrl()}&action=get_live_streams`;
    if (categoryId && categoryId !== 'all') {
      url += `&category_id=${categoryId}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener canales en vivo');
    return res.json();
  }

  getLiveStreamUrl(streamId: number | string, format: 'm3u8' | 'ts' = 'm3u8'): string {
    if (this.isDemo) return testLiveStreamUrl;
    return `${this.serverUrl}/live/${encodeURIComponent(this.username)}/${encodeURIComponent(this.password)}/${streamId}.${format}`;
  }

  // === MOVIES (VOD) ===
  async getVodCategories(): Promise<XtreamCategory[]> {
    if (this.isDemo) return mockVodCategories;
    const url = `${this.getBaseUrl()}&action=get_vod_categories`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener categorías de películas');
    return res.json();
  }

  async getVodStreams(categoryId?: string): Promise<XtreamVodStream[]> {
    if (this.isDemo) {
      if (!categoryId || categoryId === 'all') return mockVodStreams;
      return mockVodStreams.filter(s => s.category_id === categoryId);
    }
    let url = `${this.getBaseUrl()}&action=get_vod_streams`;
    if (categoryId && categoryId !== 'all') {
      url += `&category_id=${categoryId}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener películas');
    return res.json();
  }

  async getVodInfo(vodId: number | string): Promise<XtreamVodInfo> {
    if (this.isDemo) {
      const movie = mockVodStreams.find(m => m.stream_id === Number(vodId));
      return {
        info: {
          name: movie?.name || 'Película Demo',
          plot: 'Una impresionante aventura cinematográfica para disfrutar en alta definición en tu Smart TV.',
          genre: 'Acción, Suspenso',
          director: 'Christopher Nolan',
          actors: 'Christian Bale, Cillian Murphy',
          rating: movie?.rating || '8.5',
          releasedate: '2024',
          duration: '2h 15m',
          cover_big: movie?.stream_icon
        },
        movie_data: {
          stream_id: Number(vodId),
          name: movie?.name || 'Película Demo',
          container_extension: movie?.container_extension || 'mp4'
        }
      };
    }
    const url = `${this.getBaseUrl()}&action=get_vod_info&vod_id=${vodId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener detalles de la película');
    return res.json();
  }

  getVodStreamUrl(streamId: number | string, extension: string = 'mp4'): string {
    if (this.isDemo) return testVodStreamUrl;
    return `${this.serverUrl}/movie/${encodeURIComponent(this.username)}/${encodeURIComponent(this.password)}/${streamId}.${extension}`;
  }

  // === SERIES ===
  async getSeriesCategories(): Promise<XtreamCategory[]> {
    if (this.isDemo) return mockSeriesCategories;
    const url = `${this.getBaseUrl()}&action=get_series_categories`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener categorías de series');
    return res.json();
  }

  async getSeries(categoryId?: string): Promise<XtreamSeries[]> {
    if (this.isDemo) {
      if (!categoryId || categoryId === 'all') return mockSeriesList;
      return mockSeriesList.filter(s => s.category_id === categoryId);
    }
    let url = `${this.getBaseUrl()}&action=get_series`;
    if (categoryId && categoryId !== 'all') {
      url += `&category_id=${categoryId}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener series');
    return res.json();
  }

  async getSeriesInfo(seriesId: number | string): Promise<XtreamSeriesInfo> {
    if (this.isDemo) {
      return mockSeriesDetails[Number(seriesId)] || mockSeriesDetails[9001];
    }
    const url = `${this.getBaseUrl()}&action=get_series_info&series_id=${seriesId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener información de la serie');
    return res.json();
  }

  getSeriesStreamUrl(episodeId: string | number, extension: string = 'mp4'): string {
    if (this.isDemo) return testSeriesStreamUrl;
    return `${this.serverUrl}/series/${encodeURIComponent(this.username)}/${encodeURIComponent(this.password)}/${episodeId}.${extension}`;
  }

  // === EPG ===
  async getShortEpg(streamId: number | string, limit: number = 4) {
    if (this.isDemo) {
      return {
        epg_listings: [
          {
            id: '1',
            title: 'Transmisión Principal en Vivo',
            start: new Date(Date.now() - 1800000).toISOString(),
            end: new Date(Date.now() + 1800000).toISOString(),
            description: 'Disfruta de la mejor programación en directo con audio multicanal y resolución Full HD/4K.'
          },
          {
            id: '2',
            title: 'Programa Especial / Siguiente emisión',
            start: new Date(Date.now() + 1800000).toISOString(),
            end: new Date(Date.now() + 5400000).toISOString(),
            description: 'Análisis detallado, resumen de noticias y debate en tiempo real.'
          }
        ]
      };
    }
    try {
      const url = `${this.getBaseUrl()}&action=get_short_epg&stream_id=${streamId}&limit=${limit}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }
}

