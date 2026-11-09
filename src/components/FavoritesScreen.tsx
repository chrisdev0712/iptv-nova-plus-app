import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  Tv,
  Film,
  Clapperboard,
  Play,
  Trash2,
  Layers,
  Sparkles
} from 'lucide-react';
import { XtreamClient } from '../services/xtream';
import { XtreamLiveStream, XtreamVodStream, XtreamSeries } from '../types/xtream';
import { useTranslation } from '../utils/i18n';

interface FavoritesScreenProps {
  client: XtreamClient;
  onBack: () => void;
  onPlayLive: (stream: XtreamLiveStream, allStreams: XtreamLiveStream[]) => void;
  onSelectMovie: (movie: XtreamVodStream) => void;
  onSelectSeries: (series: XtreamSeries) => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  client,
  onBack,
  onPlayLive,
  onSelectMovie,
  onSelectSeries
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'live' | 'movies' | 'series'>('live');

  // Favorite IDs from localStorage
  const [favLiveIds, setFavLiveIds] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('iptv_fav_live') || '[]');
    } catch {
      return [];
    }
  });

  const [favMovieIds, setFavMovieIds] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('iptv_fav_movies') || '[]');
    } catch {
      return [];
    }
  });

  const [favSeriesIds, setFavSeriesIds] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('iptv_fav_series') || '[]');
    } catch {
      return [];
    }
  });

  // Cached Stream Objects
  const [liveStreams, setLiveStreams] = useState<XtreamLiveStream[]>([]);
  const [movies, setMovies] = useState<XtreamVodStream[]>([]);
  const [seriesList, setSeriesList] = useState<XtreamSeries[]>([]);
  const [loading, setLoading] = useState(false);

  // Load content according to active tab
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        if (activeTab === 'live') {
          // If we don't have streams, load all
          if (liveStreams.length === 0) {
            const data = await client.getLiveStreams('all');
            setLiveStreams(data);
          }
        } else if (activeTab === 'movies') {
          if (movies.length === 0) {
            const data = await client.getVodStreams('all');
            setMovies(data);
          }
        } else if (activeTab === 'series') {
          if (seriesList.length === 0) {
            const data = await client.getSeries('all');
            setSeriesList(data);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [activeTab, client]);

  // Remove from favorites
  const removeFavorite = (id: number, type: 'live' | 'movies' | 'series', e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === 'live') {
      const next = favLiveIds.filter(item => item !== id);
      setFavLiveIds(next);
      localStorage.setItem('iptv_fav_live', JSON.stringify(next));
    } else if (type === 'movies') {
      const next = favMovieIds.filter(item => item !== id);
      setFavMovieIds(next);
      localStorage.setItem('iptv_fav_movies', JSON.stringify(next));
    } else {
      const next = favSeriesIds.filter(item => item !== id);
      setFavSeriesIds(next);
      localStorage.setItem('iptv_fav_series', JSON.stringify(next));
    }
  };

  const currentLiveFavorites = liveStreams.filter(s => favLiveIds.includes(s.stream_id));
  const currentMovieFavorites = movies.filter(m => favMovieIds.includes(m.stream_id));
  const currentSeriesFavorites = seriesList.filter(s => favSeriesIds.includes(s.series_id));

  return (
    <div className="relative h-screen w-screen bg-[#080d1a] text-white flex flex-col overflow-hidden select-none">
      {/* Header */}
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
            <div className="p-2 rounded-xl bg-amber-500/20 text-yellow-400">
              <Star className="w-5 h-5 fill-yellow-400" />
            </div>
            <h1 className="text-xl font-black tracking-tight">{t('my_favorites')}</h1>
          </div>
        </div>

        {/* 3 Tabs: Live, Movies, Series */}
        <div className="flex space-x-2 bg-slate-950/60 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('live')}
            className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all tv-focusable ${
              activeTab === 'live'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>{t('channels_tab')} ({favLiveIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('movies')}
            className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all tv-focusable ${
              activeTab === 'movies'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>{t('movies_tab')} ({favMovieIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('series')}
            className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all tv-focusable ${
              activeTab === 'series'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clapperboard className="w-4 h-4" />
            <span>{t('series_tab')} ({favSeriesIds.length})</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 overflow-y-auto p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold">{t('loading_favorites')}</span>
          </div>
        ) : (
          <>
            {/* 1. LIVE TV FAVORITES */}
            {activeTab === 'live' && (
              <div>
                {currentLiveFavorites.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
                    <Star className="w-16 h-16 text-slate-700 mb-3" />
                    <h3 className="text-lg font-bold text-slate-300">{t('no_fav_live')}</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      {t('no_fav_live_desc')}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {currentLiveFavorites.map(stream => (
                      <div
                        key={stream.stream_id}
                        onClick={() => onPlayLive(stream, currentLiveFavorites)}
                        className="group p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-400 flex items-center justify-between cursor-pointer transition-all tv-focusable"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                            {stream.stream_icon ? (
                              <img src={stream.stream_icon} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Tv className="w-6 h-6 text-slate-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-mono font-bold text-cyan-300">#{stream.num || stream.stream_id}</span>
                            <h4 className="text-sm font-bold text-white truncate group-hover:text-cyan-300">{stream.name}</h4>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={e => removeFavorite(stream.stream_id, 'live', e)}
                            className="p-2 rounded-xl hover:bg-red-950/80 text-yellow-400 hover:text-red-400"
                            title={t('remove_favorite')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="p-2 rounded-xl bg-cyan-600 text-white">
                            <Play className="w-4 h-4 fill-white" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. MOVIES FAVORITES */}
            {activeTab === 'movies' && (
              <div>
                {currentMovieFavorites.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
                    <Film className="w-16 h-16 text-slate-700 mb-3" />
                    <h3 className="text-lg font-bold text-slate-300">{t('no_fav_movies')}</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      {t('no_fav_movies_desc')}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                    {currentMovieFavorites.map(movie => (
                      <div
                        key={movie.stream_id}
                        onClick={() => onSelectMovie(movie)}
                        className="group relative rounded-2xl bg-slate-900/80 border border-slate-700/60 hover:border-amber-400 overflow-hidden cursor-pointer transition-all tv-focusable"
                      >
                        <div className="aspect-[2/3] w-full bg-slate-950 relative">
                          <img src={movie.stream_icon} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={e => removeFavorite(movie.stream_id, 'movies', e)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-yellow-400 hover:text-red-400"
                            title={t('remove_favorite')}
                          >
                            <Star className="w-4 h-4 fill-yellow-400" />
                          </button>
                        </div>
                        <div className="p-3">
                          <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-300">{movie.name}</h4>
                          <span className="text-[10px] text-slate-400 uppercase mt-0.5 block">{movie.container_extension || 'MP4'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. SERIES FAVORITES */}
            {activeTab === 'series' && (
              <div>
                {currentSeriesFavorites.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
                    <Clapperboard className="w-16 h-16 text-slate-700 mb-3" />
                    <h3 className="text-lg font-bold text-slate-300">{t('no_fav_series')}</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      {t('no_fav_series_desc')}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                    {currentSeriesFavorites.map(series => (
                      <div
                        key={series.series_id}
                        onClick={() => onSelectSeries(series)}
                        className="group relative rounded-2xl bg-slate-900/80 border border-slate-700/60 hover:border-purple-400 overflow-hidden cursor-pointer transition-all tv-focusable"
                      >
                        <div className="aspect-[2/3] w-full bg-slate-950 relative">
                          <img src={series.cover} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={e => removeFavorite(series.series_id, 'series', e)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-yellow-400 hover:text-red-400"
                            title={t('remove_favorite')}
                          >
                            <Star className="w-4 h-4 fill-yellow-400" />
                          </button>
                        </div>
                        <div className="p-3">
                          <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-purple-300">{series.name}</h4>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">{series.releaseDate || 'TV Series'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

